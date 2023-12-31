import { utils, Provider, Contract, EIP712Signer, types } from "zksync-web3";
import { ethers } from "ethers";
import AAFactoryAbi from "./abi/aafactory-abi.json";
import { ZKSYNC_AAFACTORY_ADDRESS, ZKSYNC_PAYMASTER_ADDRESS } from "./address";
import { getPrePaymasterParams } from "./get-paymaster-param";


const provider = new Provider("https://testnet.era.zksync.dev");

export default async function deployZkSyncAccount (signer: ethers.providers.JsonRpcSigner, salt: string) {
    const paymasterParams = await getPrePaymasterParams(await signer.getAddress());
    const owner = await signer.getAddress();
    const aaFactory = new Contract(ZKSYNC_AAFACTORY_ADDRESS, AAFactoryAbi, signer);
    console.log(aaFactory);
    // deploy account
    let tx = await aaFactory.populateTransaction.deployAccount(salt, owner);
  
    tx = {
        ...tx,
        chainId: 280,
        customData: {
            paymasterParams: paymasterParams,
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        } as types.Eip712Meta,
    }
    console.log(tx);
    
    let txSent = await signer.sendTransaction(tx);
    const receipt = await txSent.wait();
    console.log('Tx Receipt: ', receipt);
    
    const abiCoder = new ethers.utils.AbiCoder();
    const accountAddress = utils.create2Address(
        ZKSYNC_AAFACTORY_ADDRESS,
        await aaFactory.aaBytecodeHash(),
        salt,
        abiCoder.encode(["address"], [owner])
    );
    console.log(`Account deployed on address ${accountAddress}`);
}
