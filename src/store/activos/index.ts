import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { instance } from 'src/configs/axios'
import Swal from 'sweetalert2'

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

interface StatusType {
    _id: string
    name: string
}

interface LocationType {
    _id: string
    name: string
}

interface GradeType {
    name: string
    _id: string
}

interface ResponsableType {
    _id: string
    grade: GradeType
    name: string
    lastName: string
}

interface ActivosType {
    _id?: string
    code: string,
    name: string,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    responsable: ResponsableType,
    grade: GradeType
    location: LocationType,
    status: StatusType
    category: ContableType
    subcategory: SubCategoryType
    description: string
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
}

interface ActivosState {
    data: ActivosType[]
    total: number
}

const initialState: ActivosState = {
    data: [],
    total: 0,
}

export const fetchData = createAsyncThunk(
    'activos/fetchData',
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/activos', {
                params: filters,
            })
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar traer los activos. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const addActivos = createAsyncThunk(
    'activos/addActivos',
    async (
        data: { data: FormData; filters: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.post('/activos', data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo creado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar crear el activo. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const updateActivos = createAsyncThunk(
    'activos/updateActivos',
    async (
        data: { id: string; data: FormData; filters: FetchParams },
        { dispatch }
    ) => {
        try {
            const response = await instance.put(`/activos/${data.id}`, data.data)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo actualizado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar actualizar el activo. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const deleteActivos = createAsyncThunk(
    'activos/deleteActivos',
    async (data: { id: string; filters: FetchParams }, { dispatch }) => {
        try {
            const response = await instance.delete(`/activos/${data.id}`)

            Swal.fire({
                title: '¡Éxito!',
                text: 'Activo eliminado exitosamente',
                icon: 'success',
            })

            dispatch(fetchData(data.filters))
            return response.data
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar eliminar el activo. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
            return null
        }
    }
)

export const activosSlice = createSlice({
    name: 'activos',
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

export default activosSlice.reducer
