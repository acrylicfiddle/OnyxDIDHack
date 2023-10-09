import { Wallet, Provider } from "zksync-web3";
import { ethers } from "ethers";
import { GeneralPaymasterInput } from "zksync-web3/build/src/types";
import { ZKSYNC_PAYMASTER_ADDRESS } from "./address";
import { getPaymasterParams } from "zksync-web3/build/src/paymaster-utils";


export async function getPrePaymasterParams(address: string) {
    const platformWallet = new Wallet(process.env.NEXT_PUBLIC_PLATFORM_PRIVATE_KEY?? "", new Provider("https://testnet.era.zksync.dev"));
    if (!platformWallet) {
        throw new Error("Platform wallet is not initialized");
    }
    
    const hash = ethers.utils.solidityKeccak256(["address"], [address]);
    const message = ethers.utils.arrayify(hash);
    const signature = await platformWallet.signMessage(message);
    const input: GeneralPaymasterInput = {
        type: 'General',
        innerInput: ethers.utils.hexConcat([signature, message]),
    };
    
    return getPaymasterParams(
        ZKSYNC_PAYMASTER_ADDRESS,
        input,
    );
}