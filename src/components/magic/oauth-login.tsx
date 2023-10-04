import { useMagic } from './magic-provider';
import { OAuthLoginProps } from '../../utils/types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setNetwork, setLoginMethod } from '../../store/features/rootSlice';
import { OAuthProvider } from '@magic-ext/oauth';
import { getSVGPath, capitalize } from '../../utils/social';
import { SocialSelectorProps } from '@/utils/types';


const OAuthSignUp: React.FC<OAuthLoginProps> = ({ network }) => {
    const { magic } = useMagic();
    const router = useRouter();
    const dispatch = useDispatch();
    let [socialProvider, setSocialProvider] = useState<OAuthProvider | null>(null);

    function isSelected(selectedSocialProvider: OAuthProvider) {
        return socialProvider === selectedSocialProvider;
    }
    const handleLogin = async () => {
        try {
            console.log('Social Provider: ', socialProvider)
            if (!socialProvider) {
                console.log('Social Provider is null');
                throw new Error('Social Provider is null');
            }
            await dispatch(setLoginMethod(socialProvider));
            await dispatch(setNetwork(network));
            console.log("This is the network: ", network);
            await magic?.oauth.loginWithRedirect({
                provider: socialProvider,
                // for local testing
                // redirectURI: 'http://localhost:3000/dashboard/', 
                redirectURI: 'https://onyx-did-hack.vercel.app/dashboard/',
            })
        } catch (e) {
            console.log('login error: ' + JSON.stringify(e));
        }
    };

    const handleLogout = async () => {
        try {
            router.push('/');
        } catch (e) {
            console.log('logout error: ' + JSON.stringify(e));
        }
    }
    
    const SocialSelector: React.FC<SocialSelectorProps> = ({socialProvider}) => {
        const svgPath = getSVGPath(socialProvider);        
        const selectSocialProvider = async () => {
            try {
                setSocialProvider(socialProvider);
                console.log( "Saved social provider: ", socialProvider)
            } catch (e) {
                console.log('login error: ' + JSON.stringify(e));
            }
        };
        
        return (
            <div>
                <button 
                    onClick={selectSocialProvider}
                    className={`oauth-button ${isSelected(socialProvider) ? 'selected' : ''}`}
                >
                    <img
                        src={svgPath}
                        height="auto"
                        width="auto"
                        alt={`login-${socialProvider}`}
                    />
                    <span>{capitalize(socialProvider)}</span>
                </button>
            </div>
        );
    };


    return (
        
        <div>
            <div className='login-method-grid'>
                <SocialSelector socialProvider='google'/>
                <SocialSelector socialProvider='twitter'/>
                <SocialSelector socialProvider='discord'/>
            </div>
            <div className='login-hr'/>
            <div className='login-method-grid-2'>
                <button 
                    onClick={handleLogin}
                    className="login-continue-button"
                >
                    <span>Continue →</span>
                </button>
                <button 
                    onClick={handleLogout}
                    className="login-cancel-button"
                >
                    <span>Cancel</span>
                </button>
            </div>
        </div>
    );
};

export default OAuthSignUp;