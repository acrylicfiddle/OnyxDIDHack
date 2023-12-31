import { createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { 
    initialNetworkState, 
    initialUserState, 
    initialTokenState, 
    initialLoginMethodState,
    initialEmailOrHandleState 
} from './types';
import { OAuthProvider } from '@magic-ext/oauth';

export const networkSlice = createSlice({
    name: 'network',
    initialState: initialNetworkState,
    reducers: {
        setNetwork: (state, action: PayloadAction<string>) => {
            state.network = action.payload;
        }
    }
});

export const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        }
    }
});

export const tokenSlice = createSlice({
    name: 'token',
    initialState: initialTokenState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        clearToken: (state) => {
            state.token = null;
        }
    }
});

export const loginMethodSlice = createSlice({
    name: 'loginMethod',
    initialState: initialLoginMethodState,
    reducers: {
        setLoginMethod: (state, action: PayloadAction<OAuthProvider>) => {
            state.loginMethod = action.payload;
        },
        clearLoginMethod: (state) => {
            state.loginMethod = null;
        }
    }
}); 

export const emailOrHandleSlice = createSlice({
    name: 'emailOrHandle',
    initialState: initialEmailOrHandleState,
    reducers: {
        setEmailOrHandle: (state, action: PayloadAction<string>) => {
            state.emailOrHandle = action.payload;
        },
        clearEmailOrHandle: (state) => {
            state.emailOrHandle = undefined;
        }
    }
});

const rootReducer = combineReducers({
    network: networkSlice.reducer,
    user: userSlice.reducer,
    token: tokenSlice.reducer,
    loginMethod: loginMethodSlice.reducer,
    emailOrHandle: emailOrHandleSlice.reducer
});

export const { setNetwork } = networkSlice.actions;
export const { setUser, clearUser } = userSlice.actions;
export const { setToken, clearToken } = tokenSlice.actions;
export const { setLoginMethod, clearLoginMethod } = loginMethodSlice.actions;
export const { setEmailOrHandle, clearEmailOrHandle } = emailOrHandleSlice.actions;

// export const selectNetwork = (state: RootState) => state.network.network;
// export const selectUser = (state: RootState) => state.user.user;
// export const selectToken = (state: RootState) => state.token.token;
// export const selectLoginMethod = (state: RootState) => state.loginMethod.loginMethod;

export default rootReducer;