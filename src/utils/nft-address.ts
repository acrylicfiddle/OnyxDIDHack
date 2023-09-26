export const getNftContractAddress = (network: string) => {
    if (network == "ethereum-goerli") {
        return "0x19bddA1Cc2a9Afc1e07C4EC8C981d9eb1464C148";
    } else if (network == "polygon-mumbai") {
        return "0x8d1A0328Ea8BeBa81b79F46C90528ebFcEE8E825";
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
}