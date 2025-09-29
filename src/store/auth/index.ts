import { createSlice } from '@reduxjs/toolkit';
import { UserDataType } from 'src/context/types';

interface AuthState {
    user: UserDataType | null;
    token: string | null;
    refresh_token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refresh_token: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.refresh_token = action.payload.refresh_token
        }
    }
})

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
