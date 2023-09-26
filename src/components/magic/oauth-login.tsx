import { useMagic } from './magic-provider';
import { OAuthLoginProps } from '../../utils/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setNetwork, setToken, setLoginMethod, setEmailOrHandle } from '../../store/features/rootSlice';
import { OAuthProvider } from '@magic-ext/oauth';
import { getSVGPath, capitalize } from '../../utils/social';
import { SocialSelectorProps } from '@/utils/types';
import { RootState } from '@/store/store';


const OAuthSignUp: React.FC<OAuthLoginProps> = ({ network }) => {
    const { magic } = useMagic();
    const router = useRouter();
    const { provider, state, scope, magic_oauth_request_id, magic_credential } = router.query;
    const dispatch = useDispatch();
    let [socialProvider, setSocialProvider] = useState<OAuthProvider | null>(null);
    const selectedSocialProvider = useSelector((state: RootState) => state.loginMethod.loginMethod);

    useEffect(() => {
        if (router.isReady && provider && state && scope && magic_oauth_request_id && magic_credential) {
            const processOAuthResult = async () => {
                try {
                    const result = await magic?.oauth.getRedirectResult();
                    if (!result) {
                        console.log('OAuth result is null');
                        throw new Error('OAuth result is null');
                    }
                    if (!result.oauth.provider) {
                        console.log('Social Provider is null');
                        throw new Error('Social Provider is null');
                    }
                    console.log("Result: ", result);
                    dispatch(setUser(result.magic.userMetadata.publicAddress));
                    dispatch(setToken(result.oauth.accessToken));
                    dispatch(setLoginMethod(result.oauth.provider));
                    if (socialProvider === 'twitter' && result.oauth.userInfo.preferredUsername !== undefined) {
                        dispatch(setEmailOrHandle(result.oauth.userInfo.preferredUsername));
                    } else if (result.oauth.userInfo.email !== undefined) {
                        dispatch(setEmailOrHandle(result.oauth.userInfo.email));
                    }

                } catch (e) {
                    console.log('OAuth result processing error: ' + JSON.stringify(e));
                }
            };

            processOAuthResult();
          
            router.push('/dashboard');

        }
    }, [router, provider, state, scope, magic_oauth_request_id, magic_credential]);
    
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
            dispatch(setLoginMethod(socialProvider));
            dispatch(setNetwork(network));
            await magic?.oauth.loginWithRedirect({
                provider: socialProvider,
                // for local testing
                // redirectURI: 'http://localhost:3000/sign-up/', 
                redirectURI: 'https://onyx-did-hack.vercel.app/sign-up/',
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