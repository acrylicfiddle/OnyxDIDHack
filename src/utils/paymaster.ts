import { BytesLike } from 'ethers';
export declare type Address = string;

export interface PaymasterInput {
    paymasterInput: BytesLike;
}

export declare type PaymasterParams = {
    paymaster: Address;
    paymasterInput: BytesLike;
};

export declare function getPaymasterParams(paymasterAddress: Address, paymasterInput: PaymasterInput): PaymasterParams;
