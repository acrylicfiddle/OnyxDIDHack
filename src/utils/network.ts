import { ChainId } from "@biconomy/core-types"

export enum Network {
    POLYGON_MUMBAI = 'polygon-mumbai',
    ETHEREUM_GOERLI = 'ethereum-goerli',
    ZKSYNC_ERA_TESTNET = 'zksync-era-testnet',
}

export const getNetworkUrl = (network: string) => {
    switch (network) {
        case Network.POLYGON_MUMBAI:
            return 'https://rpc-mumbai.maticvigil.com/';
        case Network.ETHEREUM_GOERLI:
            return `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
        case Network.ZKSYNC_ERA_TESTNET:
            return 'https://testnet.era.zksync.dev';
        default:
            throw new Error('Network not supported');
    }
};

export const getChainId = (network: string) => {
  switch (network) {
    case Network.POLYGON_MUMBAI:
      return 80001;
    case Network.ETHEREUM_GOERLI:
      return 5;
    case Network.ZKSYNC_ERA_TESTNET:
      return 280;
  }
};

export const getBiconomyChainId = (network: string): ChainId => {
  switch (network) {
    case Network.POLYGON_MUMBAI:
      return ChainId.POLYGON_MUMBAI;
    case Network.ETHEREUM_GOERLI:
      return ChainId.GOERLI;
    default:
      throw new Error(`Unsupported network: ${network}`);
  } 
}

export const getNetworkToken = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_MUMBAI:
    case Network.ETHEREUM_GOERLI:
      return 'ETH';
  }
};

export const getFaucetUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
      case Network.POLYGON_MUMBAI:
          return 'https://faucet.polygon.technology/';
      case Network.ETHEREUM_GOERLI:
          return 'https://goerlifaucet.com/';
      case Network.ZKSYNC_ERA_TESTNET:  
  }
};

export const getNetworkName = (network: string) => {
  switch (network) {
    case Network.POLYGON_MUMBAI:
      return 'Polygon (Mumbai)';
    case Network.ETHEREUM_GOERLI:
      return 'Ethereum (Goerli)';
    case Network.ZKSYNC_ERA_TESTNET:
      return 'ZkSync Era (Testnet)';
  }
};

export const getBlockExplorer = (network: string, address: string) => {
  switch (network) {
    case Network.POLYGON_MUMBAI:
      return `https://mumbai.polygonscan.com/address/${address}`;
    case Network.ETHEREUM_GOERLI:
      return `https://goerli.etherscan.io/address/${address}`;
    case Network.ZKSYNC_ERA_TESTNET:
      return `https://goerli.explorer.zksync.io/address/${address}`;
  }
};

export const getPaymasterURLPerNetwork = (network: string) => {
  switch (network) {
    case Network.POLYGON_MUMBAI:
      return `https://paymaster.biconomy.io/api/v1/80001/${process.env.NEXT_PUBLIC_PAYMASTER_API_MUMBAI}`;
    case Network.ETHEREUM_GOERLI:
      return `https://paymaster.biconomy.io/api/v1/5/${process.env.NEXT_PUBLIC_PAYMASTER_API_GOERLI}`;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};