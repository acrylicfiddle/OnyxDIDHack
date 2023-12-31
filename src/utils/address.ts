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

export const getDIDRegistryAddress = (network: string) => { 
    if (network == "ethereum-goerli") {
        return "0xf5ba736548815ad78c9d857a631e19591a89c8bd";
    } else if (network == "polygon-mumbai") {
        return "0x8f137ce93ae840f287e0d6f6ea0488e8c668affe";
    } else if (network == "zksync-era-testnet") {
        return "0xffaA8fA7af33D2CB66D8b78c7680eDab24DF670c";
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
}


export const ZKSYNC_AAFACTORY_ADDRESS = '0x0ee2ec442E758f55218911f654CfB57f4616aeFA';
export const ZKSYNC_PAYMASTER_ADDRESS = '0xf0d55f874c85522F20CB873C888fD22B33188b57';
