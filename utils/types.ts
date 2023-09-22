import { Dispatch, SetStateAction } from 'react'

export type LoginProps = {
  token: string
  setToken: Dispatch<SetStateAction<string>>
}

export type SocialLoginProps = {
  socialProvider: string
  network: string
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
