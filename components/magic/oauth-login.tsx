
import { useMagic } from './magic-provider';
import { SocialLoginProps } from '../../utils/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSVGPath } from '../../utils/social';
import { useDispatch } from 'react-redux';
import { setUser, setNetwork, setToken, setLoginMethod } from '../../store/features/rootSlice';

const OAuthSignUp = ({ socialProvider, network }: SocialLoginProps) => {
    const { magic } = useMagic();
    const router = useRouter();
    const { provider, state, scope, magic_oauth_request_id, magic_credential } = router.query;
    const svgPath = getSVGPath(socialProvider);
    const dispatch = useDispatch();
    
    useEffect(() => {
        console.log('Router is Ready? ' + router.isReady)
        if (router.isReady && provider && state && scope && magic_oauth_request_id && magic_credential) {
            const processOAuthResult = async () => {
                try {
                    const result = await magic?.oauth.getRedirectResult();
                    if (!result) {
                        console.log('OAuth result is null');
                        throw new Error('OAuth result is null');
                    }
                    console.log("Result: ", result);
                    dispatch(setUser(result.magic.userMetadata.publicAddress));
                    dispatch(setToken(result.oauth.accessToken));
                    dispatch(setLoginMethod('SOCIAL'));
                } catch (e) {
                    console.log('OAuth result processing error: ' + JSON.stringify(e));
                }
            };

            processOAuthResult();
          
            router.push('/dashboard');

        }
    }, [router, provider, state, scope, magic_oauth_request_id, magic_credential]);
    
    const handleLogin = async () => {
        try {
            dispatch(setNetwork(network));
            await magic?.oauth.loginWithRedirect({
                provider: socialProvider,
                redirectURI: 'http://localhost:3000/sign-up/',
            })           
        } catch (e) {
            console.log('login error: ' + JSON.stringify(e));
        }
    };
    
    return (
        <div>
            <button 
                onClick={handleLogin}
                className="oauth-button"
            >
                <img
                    src={svgPath}
                    height="auto"
                    width="auto"
                    alt={`login-${socialProvider}`}
                />
            </button>
        </div>
    );
};

export default OAuthSignUp;