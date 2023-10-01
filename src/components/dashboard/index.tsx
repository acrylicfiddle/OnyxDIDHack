import React, { useEffect, useState } from 'react';
import SideBar from './sidebar';
import BiconomyAuth from './biconomy-social-login';
import ZkSyncAuth from './zksync-login';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUser, setNetwork, setToken, setLoginMethod, setEmailOrHandle } from '../../store/features/rootSlice';
import { useMagic } from '../magic/magic-provider';

export default function DashboardPage() {
    const socialProvider = useSelector((state: RootState) => state.loginMethod.loginMethod);
    const dispatch = useDispatch();
    const network = useSelector((state: RootState) => state.network.network);
    const isZkSync = network === 'zksync-era-testnet';
    const router = useRouter();
    const { magic } = useMagic();
    useEffect(() => {
        const processOAuthResult = async () => {
            try {
                const result = await magic?.oauth.getRedirectResult();
                if (!result) {
                    console.log('No OAuth result ');
                    return;
                }
                console.log("Result: ", result);
                
                dispatch(setUser(result.magic.userMetadata.publicAddress));
                dispatch(setToken(result.oauth.accessToken));
                dispatch(setLoginMethod(result.oauth.provider));

                if (socialProvider === 'twitter' && result.oauth.userInfo.preferredUsername !== undefined) {
                    dispatch(setEmailOrHandle(result.oauth.userInfo.preferredUsername));
                } else if (socialProvider !== 'twitter' && result.oauth.userInfo.email !== undefined) {
                    dispatch(setEmailOrHandle(result.oauth.userInfo.email));
                }
                
            } catch (e) {
                console.log('OAuth result processing error: ' + JSON.stringify(e));
            } finally {
                if (Object.keys(router.query).length > 0) {
                    router.replace('/dashboard');
                }
            }
        }
        processOAuthResult();        
    }, []);

    return (
        <div className='dashboard-page'>
            <SideBar />
            <div className='dashboard-container'>
                <h1 className='dashboard-title'>Dashboard</h1>
                <div className='dashboard-content-container'>
                    {!isZkSync && <BiconomyAuth />}
                    {isZkSync && <ZkSyncAuth />}
                </div>
            </div>
        </div>
    )
}