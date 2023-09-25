import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const SideBar = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const emailOrHandle = useSelector((state: RootState) => state.emailOrHandle.emailOrHandle);
    const isTwitter = useSelector((state: RootState) => state.loginMethod.loginMethod) === 'twitter';

    return (
        <div className="sidebar">
            <div className='login-hr'/>
            {
                isTwitter && <p>@{emailOrHandle}</p>
            }
            {
                !isTwitter && <p>{emailOrHandle}</p>
            }
            <div className='login-hr'/>

        </div>
    );
}

export default SideBar;