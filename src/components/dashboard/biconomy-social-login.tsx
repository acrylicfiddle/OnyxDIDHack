import { useState, useEffect } from 'react';
import { IBundler, Bundler } from '@biconomy/bundler';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS  } from '@biconomy/account'
import { useMagic } from '../magic/magic-provider';
import { 
    IPaymaster, 
    BiconomyPaymaster,  
} from '@biconomy/paymaster';
import { css } from '@emotion/css';
import { useRouter } from 'next/router';
import { getPaymasterURLPerNetwork, getBiconomyChainId } from '../../utils/network';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearUser, clearToken, clearLoginMethod, clearEmailOrHandle } from '../../store/features/rootSlice';
import MintNFT from '../nft/biconomy-nft-mint';
import Button from '../Button';
import ClaimVerifiableCredential from '../claimVerifiableCredential/claim-verifiable-credential';

export default function BiconomyAuth() {
    const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [interval, enableInterval] = useState(false)
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(null);
    const { magic, provider } = useMagic();
    const router = useRouter();
    const network = useSelector((state: RootState) => state.network.network);
    console.log("network: ", network)
    console.log({ magic, provider })
    const dispatch = useDispatch();
    const chainId = getBiconomyChainId(network);
    const bundler: IBundler = new Bundler({
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,    // Global bundler
        chainId: getBiconomyChainId(network),
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });
    
    const paymaster: IPaymaster = new BiconomyPaymaster({
        paymasterUrl: getPaymasterURLPerNetwork(network), 
    });

    const currentToken = useSelector((state: RootState) => state.token.token);

    useEffect(() => {
        let configureLogin: NodeJS.Timeout;
        if (interval) {
          configureLogin = setInterval(() => {
            if (!smartAccount) {
              console.log(magic?.wallet.getInfo());
              setupSmartAccount();
              clearInterval(configureLogin);
            };
          }, 1000)
        }
        return () => {
            clearInterval(configureLogin);
        };
    }, [interval])

    useEffect(() => {
        if (!smartAccount && currentToken) {
            enableInterval(true);  
        }
    }, [smartAccount, currentToken]); 

    const setupSmartAccount = async () => {
        setLoading(true);
        const signer = await provider?.getSigner();
        if (!signer) {
            console.log("Signer not found");
            return;
        };
        const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
            signer: signer,
            chainId: getBiconomyChainId(network),
            bundler: bundler,
            paymaster: paymaster
        };
        try {
            let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
            biconomySmartAccount =  await biconomySmartAccount.init();
            setAddress( await biconomySmartAccount.getSmartAccountAddress());
            setSmartAccount(biconomySmartAccount);
            setLoading(false);
        } catch (error) {
          console.error(error);
        };
    };

    const login = async () => {
        router.push('/sign-up');
    }

    const logoutFromAll = async () => {
        if (await magic?.user.isLoggedIn()) {
          await magic?.user.logout();
        }
        
        dispatch(clearUser());
        dispatch(clearToken());
        dispatch(clearLoginMethod());
        dispatch(clearEmailOrHandle());
        setSmartAccount(null);
        enableInterval(false);
        router.push('/sign-up');
    }
    

    return (
            <div>
                {
                    !!smartAccount && currentToken && provider && (
                        <div className='dashboard-box'>
                            <h3 className='wallet-text'>Smart account address:</h3>
                            <p className='wallet-text'>{address}</p>
                            <Button onClick={logoutFromAll}>Logout</Button>
                            <MintNFT smartAccount={smartAccount} address={address} provider={provider}/>
                            <ClaimVerifiableCredential address={address} />

                        </div>
                    )
                }
                {
                    !currentToken || loading && (
                        <div className={detailsContainerStyle}>
                            <h3>Loading...</h3>
                            <Button onClick={login}>Go Back to Login Page</Button>
                        </div>
                    )
                }
            </div>
    )
}


const detailsContainerStyle = css`
  margin-top: 10px;
`

