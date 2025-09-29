import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios'
import Swal from 'sweetalert2'

interface Activo {
    _id?: string
    code: string
    name: string
    location: string
    price_a: number
    lote: string
    cantidad: number
    date_a: string
    date_e: string
    status?: string
    imageUrl?: string
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}

interface ActivosState {
    data: Activo[]
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
    'activos/fetchData',
    async (filtrs?: FetchParams) => {
        const response = await instance.get('/activos', {
            params: filtrs,
        })
        return response.data
    }
)

export const addActivos = createAsyncThunk(
    'activos/addActivos',
    async (
        data: { data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.post('/activos', data.data)

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
                text: 'Error al crear activo',
                icon: 'error',
            })
            throw e
        }
    }
)

export const updateActivos = createAsyncThunk(
    'activos/updateActivos',
    async (
        data: { id: string; data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.put(`/activos/${data.id}`, data.data)

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
                text: 'Error al actualizar activo',
                icon: 'error',
            })
            throw e
        }
    }
)

export const deleteActivos = createAsyncThunk(
    'activos/deleteActivos',
    async (data: { id: string; filtrs: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/activos/${data.id}`)

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
                text: 'Error al eliminar activo',
                icon: 'error',
            })
            throw e
        }
    }
)

export const activosSlice = createSlice({
    name: 'activos',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
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

            .addCase(addActivos.pending, (state) => {
                state.loading = true
            })
            .addCase(addActivos.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(addActivos.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Error al crear activo'
            })

            .addCase(updateActivos.pending, (state) => {
                state.loading = true
            })
            .addCase(updateActivos.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateActivos.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Error al actualizar activo'
            })

            // Delete
            .addCase(deleteActivos.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteActivos.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteActivos.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Error al eliminar activo'
            })
    },
})

export default activosSlice.reducer
