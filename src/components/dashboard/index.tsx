import React, { useEffect, useState } from 'react';
import SideBar from './sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUser, setToken, setLoginMethod, setEmailOrHandle } from '../../store/features/rootSlice';
import { useMagic } from '../magic/magic-provider';
import SocialAuth from './social-login';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('vc');
    const socialProvider = useSelector((state: RootState) => state.loginMethod.loginMethod);
    const dispatch = useDispatch();
    const network = useSelector((state: RootState) => state.network.network);
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
                let emailOrHandle: string = '';
                if (socialProvider === 'twitter' && result.oauth.userInfo.preferredUsername !== undefined) {
                    emailOrHandle = result.oauth.userInfo.preferredUsername;
                    dispatch(setEmailOrHandle(emailOrHandle));
                } else if (socialProvider !== 'twitter' && result.oauth.userInfo.email !== undefined) {
                    emailOrHandle = result.oauth.userInfo.email;
                    dispatch(setEmailOrHandle(emailOrHandle));
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
                <div>
                    <SocialAuth />
                </div>
            </div>
        </div>
    )
}