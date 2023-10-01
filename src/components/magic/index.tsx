
import { Suspense, useState } from 'react';
import OAuthSignUp from './oauth-login';
import { NetworkSelectBoxProps } from '../../utils/types';
import MagicProvider from './magic-provider';

const NETWORKS = [
	{ value: "ethereum-goerli", name: "Ethereum Goerli" },
	{ value: "polygon-mumbai", name: "Polygon Mumbai" },
    { value: "zksync-era-testnet", name: "zkSync Era Testnet"}
];

const MagicLogin = () =>  {
    const [network, setNetwork] = useState('');

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
                        <div className='login-box'>
                            <p className='login-description-1'>Blockchain</p>
                            <NetworkSelectBox 
                                options={NETWORKS} 
                                currentValue={network} 
                                onNetworkChange={setNetwork}
                            />
                            <p className='login-description-2'>Sign in with</p>                        
                            <OAuthSignUp network={network} />
                        </div>
                    </div>
                </div>
            </Suspense>
        </MagicProvider>
    )
}

export default MagicLogin;