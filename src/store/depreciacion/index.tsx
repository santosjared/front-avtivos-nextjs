import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { instance } from "src/configs/axios";
import Swal from 'sweetalert2'


interface FetchParams {
    skip?: number
    limit?: number
    fecha_final: string
    fecha_compra: string
}


interface DepreciacionType {
    _id?: string
    nombre: string
    fecha_a: string
    precio_ac: number
    ufv_inicial: number
    ufv_final: number
    diferencia_ufv: number
    precio_actualizado: number
    deprec_acomulada: number
    neto: number
}

interface InicialStateType {
    data: DepreciacionType[]
    valor_ufv: string
    total: number
}
const initialState: InicialStateType = {
    data: [],
    valor_ufv: '0',
    total: 0,
}


export const fetchData = createAsyncThunk(
    'depreciacion/fetchData',
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/depreciacion', {
                params: filters,
            })
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar traer los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return null
        }
    }
)

const depreciacionSlice = createSlice({
    name: 'depreciacion',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.data = action.payload?.result || [],
                state.total = action.payload?.total || 0
            state.valor_ufv = action.payload?.valor_ufv || '0'
        })
    }
})

export default depreciacionSlice.reducer