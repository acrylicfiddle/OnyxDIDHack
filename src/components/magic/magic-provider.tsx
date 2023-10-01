import { getChainId, getNetworkUrl } from '../../utils/network';
import { OAuthExtension } from '@magic-ext/oauth';
import { AuthExtension } from '@magic-ext/auth';
import { Magic as MagicBase } from 'magic-sdk';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export type Magic = MagicBase<AuthExtension & OAuthExtension[]>;

type MagicContextType = {
  magic: Magic | null;
  provider: ethers.providers.Web3Provider | null;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  provider: null,
});

type MagicProviderProps = {
  children: ReactNode;
};

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: MagicProviderProps) => {
    const [magic, setMagic] = useState<Magic | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const network = useSelector((state: RootState) => state.network.network);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
            const magic = new MagicBase(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
                network: {
                    rpcUrl: getNetworkUrl(network),
                    chainId: getChainId(network),
                },
                extensions: [new AuthExtension(), new OAuthExtension()],
            });
            console.log("MagicProvider: ", { magic })
            setMagic(magic);
            setProvider(new ethers.providers.Web3Provider((magic as any).rpcProvider));
            console.log("Provider: ", { provider })
        }
    }, []);

    const value = useMemo(() => {
        return {
            magic,
            provider,
        };
    }, [magic, provider]);

    return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
};

export default MagicProvider;
