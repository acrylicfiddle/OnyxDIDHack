export interface NetworkState {
    network: string;
};

export interface userState {
    user: string | null;
};

export interface tokenState {
    token: string | null;
};

export interface loginMethodState {
    loginMethod: string | null;
};


export const initialNetworkState: NetworkState = {
    network: 'ethereum-goerli'
};

export const initialUserState: userState = {
    user : null
};

export const initialTokenState: tokenState = {
    token : null
};

export const initialLoginMethodState: loginMethodState = {
    loginMethod : null
};