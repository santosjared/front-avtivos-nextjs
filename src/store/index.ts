import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role'

export const store = configureStore({
    reducer: {
        user,
        rol
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>