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
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/contables', { params: filters })
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar traer grupos contables. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const addContable = createAsyncThunk(
    'contable/addContable',
    async ({ data, filters }: { data: ContableType; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.post('/contables', data)
            Swal.fire('¡Éxito!', 'Grupo contable creado exitosamente', 'success')
            dispatch(fetchData(filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear grupos contables. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const updateContable = createAsyncThunk(
    'contable/updateContable',
    async ({ id, data, filters }: { id: string; data: ContableType; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.put(`/contables/${id}`, data)
            Swal.fire('¡Éxito!', 'Grupo contable actualizado exitosamente', 'success')
            dispatch(fetchData(filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar actualizar grupos contables. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const deleteContable = createAsyncThunk(
    'contable/deleteContable',
    async ({ id, filters }: { id: string; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/contables/${id}`)
            Swal.fire('¡Éxito!', 'Grupo contable eliminado exitosamente', 'success')
            dispatch(fetchData(filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar Eliminar grupos contables. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const contableSlice = createSlice({
    name: 'contable',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.data = action.payload?.result ?? []
            state.total = action.payload?.total ?? 0
        })
    }
})

export default contableSlice.reducer
