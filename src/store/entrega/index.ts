import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios'
import { GradeType, UserType } from 'src/types/types'
import Swal from 'sweetalert2'

interface LocationType {
    _id: string
    name: string
}
interface StatusType {
    _id: string
    name: string
}
interface ResponsableType {
    _id: string
    grade: GradeType
    name: string
    lastName: string
}

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id: string
    name: string,
    util: number,
    subcategory: SubCategoryType[]
    description?: string
}

interface ActivosType {
    _id?: string
    code: string,
    responsable: ResponsableType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
}

interface EntregaType {
    _id: string
    code: string
    date: string
    time: string
    user_en: UserType | null
    user_rec: UserType | null
    location: LocationType
    documentUrl?: string
    description?: string
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
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/entregas', {
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

export const addEntrega = createAsyncThunk(
    'entrega/addentrega',
    async (
        data: { data: FormData; filters: FetchParams },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await instance.post('/entregas', data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo creado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar crear los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return rejectWithValue(e.response?.data);
        }
    }
)

export const updateEntrega = createAsyncThunk(
    'entrega/updateEntregas',
    async (
        data: { id: string; data: FormData; filters: FetchParams },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await instance.put(`/entregas/${data.id}`, data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo actualizado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar actualizar los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return rejectWithValue(e.response?.data);
        }
    }
)

export const deleteEntrega = createAsyncThunk(
    'entrega/deleteEntrega',
    async (data: { id: string; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/entregas/${data.id}`)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo eliminado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar eliminar los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return null
        }
    }
)

export const entregaSlice = createSlice({
    name: 'entrega',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload?.result || []
                state.total = action.payload?.total || 0
            })
    },
})

export default entregaSlice.reducer
