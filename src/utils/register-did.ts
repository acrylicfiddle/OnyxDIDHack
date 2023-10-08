import { getDIDRegistryAddress } from "./address";
import { ethers } from "ethers";
import DIDRegistry from "./abi/did-registry-abi.json";
import { BiconomySmartAccount } from "@biconomy/account"
import {
    IHybridPaymaster,
    SponsorUserOperationDto,
    PaymasterMode
} from '@biconomy/paymaster';
import { utils, types, Provider, EIP712Signer, Web3Provider } from "zksync-web3";
import { useSelector } from "react-redux";
import deployZkSyncAccount from "./account-deploy";
import { getPrePaymasterParams } from "./get-paymaster-param";

const zkSyncProvider = new Provider("https://testnet.era.zksync.dev");

async function isActive(network:string, provider: ethers.providers.JsonRpcProvider, accountAddress: string) {
    const didRegistryAddress = getDIDRegistryAddress(network);
    let currentProvider = network == 'zksync-era-testnet' ? zkSyncProvider : provider;
    const registryContract = new ethers.Contract(   
        didRegistryAddress,
        DIDRegistry,
        currentProvider
    );
    const isActivated = await registryContract.isActive('ethr', accountAddress);
    return isActivated;
}

export async function registerBiconomyDid (network: string, provider: ethers.providers.JsonRpcProvider, smartAccount: BiconomySmartAccount, address: string) {
    if (await isActive(network, provider, address)) {
        console.log("Account already activated");
        return;
    }
    const didRegistryAddress = getDIDRegistryAddress(network);
    const registryContract = new ethers.Contract(   
        didRegistryAddress,
        DIDRegistry,
        provider
    );
    const registerTx = await registryContract.populateTransaction.register('ethr', address);
    console.log(registerTx.data);
    const tx1 = {
        to: didRegistryAddress,
        data: registerTx.data,
    };
    console.log("here before userop")
    
    let userOp = await smartAccount.buildUserOp([tx1]);
    console.log({ userOp })
    const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
    let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
    };
    const paymasterAndDataResponse =
    await biconomyPaymaster.getPaymasterAndData(
        userOp,
        paymasterServiceData
    );

    userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
    const userOpResponse = await smartAccount.sendUserOp(userOp);
    console.log("userOpHash", userOpResponse);
    const { receipt } = await userOpResponse.wait(1);
    console.log("txHash", receipt.transactionHash);
}

export async function registerZkSyncDid(provider: Web3Provider | ethers.providers.JsonRpcProvider, address: string, emailOrHandle?: string) {
    if (await isActive('zksync-era-testnet', provider, address)) {
        console.log("Account already activated");
        return;
    }
    const didRegistryAddress = getDIDRegistryAddress("zksync-era-testnet");
    const registryContract = new ethers.Contract(   
        didRegistryAddress,
        DIDRegistry,
        zkSyncProvider
    );
    const code = await zkSyncProvider.getCode(address);
    console.log('code is ',{ code })
    const signer = await provider.getSigner();
    if (code == '0x') {
        if (emailOrHandle == undefined) { 
            console.error('emailOrHandle is undefined');
            return; 
        }
        const salt = ethers.utils.formatBytes32String(emailOrHandle);
        await deployZkSyncAccount(signer, salt);
    };
    const paymasterParams = await getPrePaymasterParams(signer);
    console.log('paymasterParams is ', paymasterParams);
    const registerTx = await registryContract.populateTransaction.register('ethr', address);
    console.log('Basic tx info', registerTx);

    
    const gasPrice = await zkSyncProvider.getGasPrice();
    
    let tx1 = {
        ...registerTx,
        from: address,
        to: didRegistryAddress,
        chainId: 280,
        gasLimit: ethers.BigNumber.from(1000000),
        gasPrice: gasPrice,
        nonce: await zkSyncProvider.getTransactionCount(address),
        type: 113,
        customData: {
            paymasterParams: paymasterParams,
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        } as types.Eip712Meta,
        value: ethers.BigNumber.from(0),
    };

    console.log(utils.serialize(tx1));
    const eip712Signer = new EIP712Signer(signer, 280);
    const signature = await eip712Signer.sign(tx1);

    tx1.customData = {
        ...tx1.customData,
        customSignature: signature,
    };

    let tx = await zkSyncProvider.sendTransaction(utils.serialize(tx1));
    const receipt = await tx.wait(1);
    const txhash = receipt.transactionHash;
    console.log({ tx });
    console.log({ receipt });
}