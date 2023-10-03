export const getNftContractAddress = (network: string) => {
    if (network == "ethereum-goerli") {
        return "0x19bddA1Cc2a9Afc1e07C4EC8C981d9eb1464C148";
    } else if (network == "polygon-mumbai") {
        return "0x8d1A0328Ea8BeBa81b79F46C90528ebFcEE8E825";
    } else if (network == "zksync-era-testnet") {
        return "0x65b7dC3bbAf38342d1ee2e1c3b89fD446Dd1f8AE"
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
}

export const ZKSYNC_AAFACTORY_ADDRESS = '0x0ee2ec442E758f55218911f654CfB57f4616aeFA';
export const ZKSYNC_PAYMASTER_ADDRESS = '0x57F8B019e9B637F9f0a3F03778C0430a55FaDa9b';
