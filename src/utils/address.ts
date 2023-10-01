export const getNftContractAddress = (network: string) => {
    if (network == "ethereum-goerli") {
        return "0x19bddA1Cc2a9Afc1e07C4EC8C981d9eb1464C148";
    } else if (network == "polygon-mumbai") {
        return "0x8d1A0328Ea8BeBa81b79F46C90528ebFcEE8E825";
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
}

export const ZKSYNC_AAFACTORY_ADDRESS = '0x0ee2ec442E758f55218911f654CfB57f4616aeFA';
export const ZKSYNC_PAYMASTER_ADDRESS = '0x0678F69E97E5fAB19a9188DFC8349b622c46A28D';
