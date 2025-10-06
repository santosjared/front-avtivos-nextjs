import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios'
import { UserType } from 'src/types/types'
import Swal from 'sweetalert2'

interface LocationType {
    _id: string
    name: string
}

interface EntregaType {
    date: string
    time: string
    user_en: UserType
    user_rec: string
    location: LocationType
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}

interface ActivosState {
    data: EntregaType[]
    total: number
    loading: boolean
    error: string | null
}

const initialState: ActivosState = {
    data: [],
    total: 0,
    loading: false,
    error: null,
}

export const fetchData = createAsyncThunk(
    'entrega/fetchData',
    async (filtrs?: FetchParams) => {
        const response = await instance.get('/entregas', {
            params: filtrs,
        })
        return response.data
    }
)

export const addEntrega = createAsyncThunk(
    'entrega/addentrega',
    async (
        data: { data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.post('/entregas', data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo creado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filtrs))
            return response.data
        } catch (e) {
            Swal.fire({
                title: '¡Error!',
                text: 'Error al crear Entrega',
                icon: 'error',
            })
            console.log(e)
            throw e
        }
    }
)

export const updateEntrega = createAsyncThunk(
    'entrega/updateEntregas',
    async (
        data: { id: string; data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.put(`/entrega/${data.id}`, data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo actualizado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filtrs))
            return response.data
        } catch (e) {
            Swal.fire({
                title: '¡Error!',
                text: 'Error al actualizar entrega',
                icon: 'error',
            })
            console.log(e)
            throw e
        }
    }
)

export const deleteEntrega = createAsyncThunk(
    'entrega/deleteEntrega',
    async (data: { id: string; filtrs: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/entrega/${data.id}`)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo eliminado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filtrs))
            return response.data
        } catch (e) {
            Swal.fire({
                title: '¡Error!',
                text: 'Error al eliminar entrega',
                icon: 'error',
            })
            throw e
        }
    }
)

export const entregaSlice = createSlice({
    name: 'entrega',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchData.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload.result
                state.total = action.payload.total
                state.loading = false
            })
            .addCase(fetchData.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Error al cargar activos'
            })
    },
})

export default entregaSlice.reducer
