import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role';
import auth from './auth';
import activos from './activos'
import entrega from './entrega'
import contable from './contable'

export const store = configureStore({
    reducer: {
        user,
        rol,
        auth,
        activos,
        entrega,
        contable
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store