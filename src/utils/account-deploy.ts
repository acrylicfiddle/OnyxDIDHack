import { utils, Wallet, Provider, EIP712Signer, types } from "zksync-web3";
import { ethers } from "ethers";
import AAFactoryAbi from "./abi/aafactory-abi.json";
import { ZKSYNC_AAFACTORY_ADDRESS, ZKSYNC_PAYMASTER_ADDRESS } from "./address";
import { getPaymasterParams } from "./paymaster";

const provider = new Provider("https://testnet.era.zksync.dev");

export default async function deployZkSyncAccount (signer:  ethers.Signer, salt: string) {
    const platformWallet = new Wallet(process.env.PLATFORM_PRIVATE_KEY?? "", provider);
    const owner = await signer.getAddress();
    const message = ethers.utils.arrayify(ethers.utils.id(owner));
    const signature = await platformWallet.signMessage(message);
    const input = ethers.utils.hexConcat([signature, message]);
    const paymasterParams = getPaymasterParams(ZKSYNC_PAYMASTER_ADDRESS, {
        paymasterInput: input
    });

    const aaFactory = new ethers.Contract(ZKSYNC_AAFACTORY_ADDRESS, AAFactoryAbi, signer);

    // deploy account
    await (
        await aaFactory.deployAccount(salt, owner, {
            // paymaster info
            customData: {
                paymasterParams: paymasterParams,
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
            }
        )
    ).wait();

    // Getting the address of the deployed contract account
    const abiCoder = new ethers.utils.AbiCoder();
    const accountAddress = utils.create2Address(
        ZKSYNC_AAFACTORY_ADDRESS,
        await aaFactory.aaBytecodeHash(),
        salt,
        abiCoder.encode(["address"], [owner])
    );
    console.log(`Account deployed on address ${accountAddress}`);
}
