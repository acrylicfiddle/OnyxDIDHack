import { OAuthProvider } from '@magic-ext/oauth'
import { Dispatch, SetStateAction } from 'react'

export type LoginProps = {
  token: string
  setToken: Dispatch<SetStateAction<string>>
}

export interface OAuthLoginProps {
  network: string;
}

export interface SocialSelectorProps {
  socialProvider: OAuthProvider;
}


export type OptionType = {
  value: string;
  name: string;
};

export type NetworkSelectBoxProps = {
  options: OptionType[];
  currentValue: string;
  onNetworkChange: (selectedNetwork: string) => void;
};

export type { Magic } from '../components/magic/magic-provider'
