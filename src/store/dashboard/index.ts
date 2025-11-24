import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { instance } from "src/configs/axios";
import Swal from 'sweetalert2'

interface totalStatusType {
    status: string
    total: number
}

interface TopActivosPorPrecioType {
    name: string
    code: string
    price_a: number
}

interface ActivosType {
    name: string
    code: string
}

interface TopActivosPrestadosType {
    total: number
    activo: ActivosType
}

interface InitialStateType {
    totalStatus: totalStatusType[]
    topActivosPorPrecio: TopActivosPorPrecioType[]
    topActivosPrestados: TopActivosPrestadosType[]
}

const initialState: InitialStateType = {
    topActivosPorPrecio: [],
    topActivosPrestados: [],
    totalStatus: []
}

export const fetchData = createAsyncThunk('bitacoras/fetchData', async () => {
    try {
        const response = await instance.get('/dashboard');

        return response.data;
    } catch (e: any) {
        console.log(e);
        Swal.fire({
            title: '¡Error!',
            text: `Error al intentar traer los datos. Código de error: ${e.response?.status ?? 'desconocido'
                }. Por favor, comuníquese con el administrador del sistema.`,
            icon: 'error',
        });

        return null
    }
})

const bitacorasSlice = createSlice({
    name: 'bitacoras',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.totalStatus = action.payload?.totalStatus || []
            state.topActivosPorPrecio = action.payload?.topActivosPorPrecio || []
            state.topActivosPrestados = action.payload?.topActivosPrestados || []
        })
    },
})

export default bitacorasSlice.reducer