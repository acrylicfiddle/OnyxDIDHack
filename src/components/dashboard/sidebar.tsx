import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import SideBarToggle from '@/ui/SideBarToggle';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { clearUser, clearToken, clearLoginMethod, clearEmailOrHandle } from '../../store/features/rootSlice';
import { useMagic } from '../magic/magic-provider';
import Image from 'next/image';

const SideBar = () => {
    const { magic } = useMagic();
    const dispatch = useDispatch();
    const router = useRouter();
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    const isTwitter = useSelector((state: RootState) => state.loginMethod.loginMethod) === 'twitter';
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => {
        setIsOpen(!isOpen);
    };
    const handleLogout = async () => {
        try {
            if (await magic?.user.isLoggedIn()) {
                await magic?.user.logout();
            }
              
            dispatch(clearUser());
            dispatch(clearToken());
            dispatch(clearLoginMethod());
            dispatch(clearEmailOrHandle());
            router.push('/sign-up');
            router.push('/sign-up');
        } catch (e) {
            console.log('logout error: ' + JSON.stringify(e));
        }
    }

    const handleToHome = () => {
        router.push('/');
    }

    return (
        <div className="sidebar">
            <Image src='/seamless-header.png' alt='header-logo' width={182} height={52} onClick={handleToHome}/>
            <div className='login-hr'/>
            <div onClick={handleToggle}>
                {
                    isTwitter && 
                    <div className='sidebar-email'>
                        @{emailOrHandle}
                        <SideBarToggle isOpen={isOpen}/>
                    </div>
                }
                {
                    !isTwitter && 
                    <div className='sidebar-email'>
                        {emailOrHandle}
                        <SideBarToggle isOpen={isOpen}/>
                    </div>
                }
                {isOpen && (
                    <ul>
                        <div className='logout-button-sidebar' onClick={handleLogout}>
                            Logout
                        </div>
                    </ul>
                )}
            </div>
            <div className='login-hr'/>

        </div>
    );
}

export default SideBar;