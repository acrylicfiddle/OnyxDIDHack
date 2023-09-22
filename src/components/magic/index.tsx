
import { Suspense, useEffect, useState } from 'react';
import OAuthSignUp from './oauth-login';
import { LoginProps, NetworkSelectBoxProps } from '../../utils/types';
import MagicProvider from './magic-provider';

const NETWORKS = [
	{ value: "ethereum-goerli", name: "Goerli Testnet" },
	{ value: "polygon-mumbai", name: "Polygon Mumbai" },
];

const MagicLogin = () =>  {
    const [network, setNetwork] = useState('ethereum-goerli');

    const NetworkSelectBox: React.FC<NetworkSelectBoxProps> = (props) => {
        const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            props.onNetworkChange(event.target.value);
        };

        return (
            <select
                className='network-select-box' 
                onChange={handleChange} 
                defaultValue={props.currentValue}
            >
                {props.options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        );
    };

    
    return (
        <MagicProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <div className="login-page">
                    <div className='login-method-grid-item-container'>
                        <h1 className="login-title">Sign Up</h1>
                        <NetworkSelectBox 
                            options={NETWORKS} 
                            currentValue={network} 
                            onNetworkChange={setNetwork}
                        />                        
                        <div className='login-method-grid'>
                            <OAuthSignUp network={network} socialProvider='google'/>
                            <OAuthSignUp network={network} socialProvider='twitter'/>
                            <OAuthSignUp network={network} socialProvider='discord'/>
                        </div>
                    </div>
                </div>
            </Suspense>
        </MagicProvider>
    )
}

export default MagicLogin;