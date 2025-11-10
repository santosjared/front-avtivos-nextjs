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

interface DevolucionType {
    _id?: string
    code: string
    date: string
    time: string
    grade: GradeType
    name: string
    lastName: string
    user_en: UserType
    activos: ActivosType[]
    documentUrl?: string
    description?: string
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}
interface EntregaType {
    code: string
    date: string
    time: string
    grade: GradeType
    name: string
    lastName: string
    user_en: UserType
    location: LocationType
    activos: ActivosType[]
    documentUrl?: string
    description?: string
}

interface InicialStateType {
    data: DevolucionType[]
    total: number
    entregas: EntregaType[]
    totalEntregas: number
}

const initialState: InicialStateType = {
    data: [],
    entregas: [],
    totalEntregas: 0,
    total: 0,
}

export const fetchData = createAsyncThunk(
    'devolucion/fetchData',
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/devolucion', {
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

export const fetchDataEntrega = createAsyncThunk(
    'devolucion/fetchDataEntrega',
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/devolucion/entregas', {
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

export const addDevolucion = createAsyncThunk(
    'devolucion/addDevolucion',
    async (
        data: { data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.post('/devolucion', data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Devolución creado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filtrs))
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar crear los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return null
        }
    }
)

export const updateDevolucion = createAsyncThunk(
    'devolucion/updateDevolucion',
    async (
        data: { id: string; data: FormData; filtrs: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.put(`/devolucin/${data.id}`, data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Devolución actualizado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filtrs))
            return response.data
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar actualizar los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
            return null
        }
    }
)

export const deleteDevolucion = createAsyncThunk(
    'devolucion/deleteDevolucion',
    async (data: { id: string; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/devolucion/${data.id}`)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Devolución eliminado exitosamente',
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

export const devolucionSlice = createSlice({
    name: 'devolucion',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload?.result || []
                state.total = action.payload?.total || 0
            })
            .addCase(fetchDataEntrega.fulfilled, (state, action) => {
                state.entregas = action.payload?.result || []
                state.totalEntregas = action.payload?.total || 0
            })
    },
})

export default devolucionSlice.reducer
