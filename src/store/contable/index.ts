import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios'
import Swal from 'sweetalert2'

interface SubCategory {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id?: string
    name: string
    util: number
    subcategory: SubCategory[]
    description?: string
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}

interface ActivosState {
    data: ContableType[]
    total: number
}

const initialState: ActivosState = {
    data: [],
    total: 0
}

export const fetchData = createAsyncThunk(
    'contable/fetchData',
    async (filtrs?: FetchParams) => {
        const response = await instance.get('/contables', { params: filtrs })
        return response.data
    }
)

export const addContable = createAsyncThunk(
    'contable/addContable',
    async ({ data, filtrs }: { data: ContableType; filtrs: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.post('/contables', data)
            Swal.fire('¡Éxito!', 'Grupo contable creado exitosamente', 'success')
            dispatch(fetchData(filtrs))
            return response.data
        } catch (e) {
            Swal.fire('¡Error!', 'Error al crear Grupo contable', 'error')
            throw e
        }
    }
)

export const updateContable = createAsyncThunk(
    'contable/updateContable',
    async ({ id, data, filtrs }: { id: string; data: ContableType; filtrs: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.put(`/contables/${id}`, data)
            Swal.fire('¡Éxito!', 'Grupo contable actualizado exitosamente', 'success')
            dispatch(fetchData(filtrs))
            return response.data
        } catch (e) {
            Swal.fire('¡Error!', 'Error al actualizar Grupo contable', 'error')
            console.log(e)
            throw e
        }
    }
)

export const deleteContable = createAsyncThunk(
    'contable/deleteContable',
    async ({ id, filtrs }: { id: string; filtrs: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/contables/${id}`)
            Swal.fire('¡Éxito!', 'Grupo contable eliminado exitosamente', 'success')
            dispatch(fetchData(filtrs))
            return response.data
        } catch (e) {
            Swal.fire('¡Error!', 'Error al eliminar grupo contable', 'error')
            throw e
        }
    }
)

export const contableSlice = createSlice({
    name: 'contable',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.data = action.payload.result || action.payload
            state.total = action.payload.total || action.payload.length || 0
        })
    }
})

export default contableSlice.reducer
