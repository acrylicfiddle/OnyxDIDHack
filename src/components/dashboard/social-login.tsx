import { useState, useEffect } from 'react';
import { IBundler, Bundler } from '@biconomy/bundler';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS  } from '@biconomy/account'
import { useMagic } from '../magic/magic-provider';
import { 
    IPaymaster, 
    BiconomyPaymaster,  
} from '@biconomy/paymaster';
import { useRouter } from 'next/router';
import { getPaymasterURLPerNetwork, getBiconomyChainId, getNetworkName } from '../../utils/network';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearUser, clearToken, clearLoginMethod, clearEmailOrHandle } from '../../store/features/rootSlice';
import MintNFT from '../nft/biconomy-nft-mint';
import Button from '@/ui/Button';
import ClaimVerifiableCredential from '../claimVerifiableCredential/claim-verifiable-credential';
import { ethers } from 'ethers';
import AAFactoryAbi from '@/utils/abi/aafactory-abi.json';
import AccountAbi from '@/utils/abi/account-abi.json';
import { ZKSYNC_AAFACTORY_ADDRESS } from '@/utils/address';
import { utils } from 'zksync-web3';
import MintZkSyncNFT from '../nft/zksync-nft-mint';
import { LoadingBox } from '@/ui/LoadingBox';
import formatAddress from '@/utils/format-address';
import postLoginInfo from '@/utils/post-login-info';


export default function SocialAuth() {
    const [activeTab, setActiveTab] = useState('vc');
    const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [interval, enableInterval] = useState(false)
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(null);
    const [zkSmartAccount, setZkSmartAccount] = useState<ethers.Contract | null>(null); 
    const { magic, provider } = useMagic();
    const router = useRouter();
    let network = useSelector((state: RootState) => state.network.network) ?? provider?.network?.name;
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    const userAddr = useSelector((state: RootState) => state.user.user);
    const loginMethod = useSelector((state: RootState) => state.loginMethod.loginMethod);
    console.log("network: ", network)
    console.log({ magic, provider })
    const dispatch = useDispatch();
    let chainId: number;
    let bundler: IBundler;
    let paymaster: IPaymaster;
    const isBiconomy = network !== 'zksync-era-testnet';
    if (isBiconomy) {
        chainId = getBiconomyChainId(network);
        bundler = new Bundler({
            bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,    // Global bundler
            chainId: getBiconomyChainId(network),
            entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        });
        
        paymaster = new BiconomyPaymaster({
            paymasterUrl: getPaymasterURLPerNetwork(network), 
        });
    }
    

    const currentToken = useSelector((state: RootState) => state.token.token);

    useEffect(() => {
        let configureLogin: NodeJS.Timeout;
        if (interval) {
          configureLogin = setInterval( async () => {
            if (!smartAccount) {
                isBiconomy? setupSmartAccount() : setupZkSyncAccount();
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
            const scAddr = await biconomySmartAccount.getSmartAccountAddress() 
            setAddress(scAddr);
            setSmartAccount(biconomySmartAccount);
            setLoading(false);
            await postLoginInfo(emailOrHandle, userAddr, loginMethod, scAddr, network);
        } catch (error) {
          console.error(error);
        };
    };

    const setupZkSyncAccount = async () => {
        setLoading(true);
        const signer = await provider?.getSigner();
        if (!signer) {
            console.log("Signer not found");
            return;
        };
        if (!emailOrHandle) {
            console.log("Email or handle not found");
            return;
        };
        const aaFactory = new ethers.Contract(
            ZKSYNC_AAFACTORY_ADDRESS,
            AAFactoryAbi,
            provider?.getSigner(),
        );
        const owner = await signer.getAddress();
        // const accountAddress = await aaFactory.callStatic.deployAccount(emailOrHandle, owner);
        const abiCoder = new ethers.utils.AbiCoder();
        const accountAddress = utils.create2Address(
            ZKSYNC_AAFACTORY_ADDRESS,
            await aaFactory.aaBytecodeHash(),
            ethers.utils.formatBytes32String(emailOrHandle),
            abiCoder.encode(["address"], [owner])
        );
        const zkSmartAccount = new ethers.Contract(
            accountAddress,
            AccountAbi,
            provider?.getSigner(),
        );
        setAddress(accountAddress);
        setZkSmartAccount(zkSmartAccount);
        setLoading(false);
        await postLoginInfo(emailOrHandle, userAddr, loginMethod, accountAddress, network);
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

    const handleNFTTab = () => {
        setActiveTab('nft');
    };

    const handleVCTab = () => {
        setActiveTab('vc');
    }

    const isVC = activeTab === 'vc' ? 'active' : '';

    const DashboardTabs = () => {
        return (
            <div className='flex flex-row w-100% mb-10'>
                <button 
                    className={`tabs ${activeTab === 'vc' ? 'active' : ''}`}
                    onClick={handleVCTab}
                >
                    Credentials
                </button>
                <button 
                    className={`tabs ${activeTab === 'nft' ? 'active' : ''}`}
                    onClick={handleNFTTab}
                >
                    NFT
                </button>
            </div>
        )
    }

    return (
            <div>
                <div>
                    <div className='dashboard-header-container'>
                        <h1 className='dashboard-title'>Dashboard</h1>
                        {
                            address && provider && (
                                <div className='flex flex-row'>
                                    <div className='dashboard-header-subject'>
                                        Wallet
                                    </div>
                                    <div className='wallet-text'>
                                        {formatAddress(address)}
                                    </div>
                                    <div className='dashboard-header-subject'>
                                        Blockchain
                                    </div>
                                    <div className='wallet-text'>
                                        {getNetworkName(network)}
                                    </div>
                                    <div className='logout-button' onClick={logoutFromAll}>Change</div>
                                </div>
                            )
                        }
                    </div>
                    <DashboardTabs />
                </div>
                {
                    address && provider && isVC && smartAccount && isBiconomy && (
                        <div className='dashboard-box'>
                            <ClaimVerifiableCredential address={address} smartAccount={smartAccount} />
                        </div>
                    )
                }
                {
                    !!smartAccount && provider && isBiconomy && !isVC && (
                        <div className='dashboard-box'>
                            <MintNFT smartAccount={smartAccount} address={address}/>
                        </div>

                    )
                }
                {
                    !!zkSmartAccount && provider && !isBiconomy && !isVC && (
                        <div className='dashboard-box'>
                            <MintZkSyncNFT address={address}/>
                        </div>
                    )
                }
                {
                    loading && (
                        <LoadingBox login={login}/>
                    )
                }
            </div>
    )
}

