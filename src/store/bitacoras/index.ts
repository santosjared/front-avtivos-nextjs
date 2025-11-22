import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { instance } from "src/configs/axios";
import { UserType } from "src/types/types";
import Swal from 'sweetalert2'


interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}

interface BitacorasType {
    user: UserType | null
    action: string
    method: string
    logs: string
    createdAt: string
}

interface InitialStateType {
    data: BitacorasType[]
    total: number
}

const initialState: InitialStateType = {
    data: [],
    total: 0
}

export const fetchData = createAsyncThunk('bitacoras/fetchData', async (filters: FetchParams) => {
    try {
        const response = await instance.get('/bitacoras', {
            params: filters
        });
        return response.data
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
            state.data = action.payload?.result || []
            state.total = action.payload?.total || 0
        })
    },
})

export default bitacorasSlice.reducer