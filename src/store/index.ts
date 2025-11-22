import { configureStore } from '@reduxjs/toolkit';
import user from './user';
import rol from './role';
import auth from './auth';
import activos from './activos'
import entrega from './entrega'
import contable from './contable'
import devolucion from './devolucion'
import devolver from './devolver'
import depreciacion from './depreciacion'
import bitacora from './bitacoras'

export const store = configureStore({
    reducer: {
        user,
        rol,
        auth,
        activos,
        entrega,
        contable,
        devolucion,
        devolver,
        depreciacion,
        bitacora

    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store