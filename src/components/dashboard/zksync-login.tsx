import { useState, useEffect } from 'react';
import { ZKSYNC_AAFACTORY_ADDRESS, ZKSYNC_PAYMASTER_ADDRESS } from '@/utils/address';
import { utils, Wallet, Provider, EIP712Signer, types } from "zksync-web3";
import { useMagic } from '../magic/magic-provider';
import { css } from '@emotion/css';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { clearUser, clearToken, clearLoginMethod, clearEmailOrHandle } from '../../store/features/rootSlice';
import MintZkSyncNFT from '../nft/zksync-nft-mint';
import Button from '../Button';
import ClaimVerifiableCredential from '../claimVerifiableCredential/claim-verifiable-credential';
import { ethers } from 'ethers';
import AAFactoryAbi from '@/utils/abi/aafactory-abi.json';
import AccountAbi from '@/utils/abi/account-abi.json';

export default function ZkSyncAuth() {
    const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [interval, enableInterval] = useState(false)
    const [smartAccount, setSmartAccount] = useState<ethers.Contract | null>(null);
    const { magic, provider } = useMagic();
    const router = useRouter();
    const network = useSelector((state: RootState) => state.network.network);
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    console.log({ magic, provider })
    const dispatch = useDispatch();
    
    const currentToken = useSelector((state: RootState) => state.token.token);

    useEffect(() => {
        let configureLogin: NodeJS.Timeout;
        if (interval) {
            configureLogin = setInterval(() => {
                if (!smartAccount) {
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
        const smartAccount = new ethers.Contract(
            accountAddress,
            AccountAbi,
            provider?.getSigner(),
        );
        setAddress(accountAddress);
        setSmartAccount(smartAccount);
        setLoading(false);
        // const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        //     signer: signer,
        //     chainId: getBiconomyChainId(network),
        //     bundler: bundler,
        //     paymaster: paymaster
        // };
        // try {
        //     let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
        //     biconomySmartAccount =  await biconomySmartAccount.init();
        //     setAddress( await biconomySmartAccount.getSmartAccountAddress());
        //     setSmartAccount(biconomySmartAccount);
        //     setLoading(false);
        // } catch (error) {
        //   console.error(error);
        // };
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
                            <MintZkSyncNFT address={address}/>
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

