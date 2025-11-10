import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { instance } from "src/configs/axios"

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
interface LocationType {
    _id: string
    name: string
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

interface InitialStateType {
    field: string
    pageSize: number
    page: number
    drawOpen: boolean
    isLoading: boolean
    category: ContableType[]
    status: StatusType[]
    selectedCategory: string
    selectedSubCategory: string
    selectedStatus: string
    subcategory: SubCategoryType[]
    data: ActivosType[]
    total: number
    selectedIds: string[]
}

interface FetchParams {
    skip?: number
    limit?: number
    field?: string
    id?: string
}

const initialState: InitialStateType = {
    field: '',
    pageSize: 10,
    page: 0,
    drawOpen: false,
    isLoading: true,
    category: [],
    status: [],
    selectedCategory: '',
    selectedSubCategory: '',
    selectedStatus: '',
    subcategory: [],
    data: [],
    total: 0,
    selectedIds: []
}

export const fetchCategories = createAsyncThunk('borrowing/Categories', async () => {
    try {
        const response = await instance.get('/entregas/categories');
        return response.data || [];
    } catch (error) {
        console.error('error al extraer categorias', error);
        return null
    }
});

export const fetchStatus = createAsyncThunk('borrowing/status', async () => {
    try {
        const response = await instance.get('/entregas/status');
        return response.data || [];
    } catch (error) {
        console.error('error al extraer estados', error);
        return null;
    }
});

export const fectSubcategories = createAsyncThunk('borrowing/subCategories', async () => {
    try {
        const response = await instance.get('/entregas/subcategories');
        return response.data || [];
    } catch (error) {
        console.error('error al extraer la sub categoria', error);
        return null;
    }
});

export const fetchData = createAsyncThunk(
    'borrowing/fetchData',
    async (filters?: FetchParams) => {
        try {
            const response = await instance.get('/entregas/activos-available',
                { params: filters }
            );
            return response.data;
        } catch (error) {
            console.error('error al extraer activos validos', error);
            return null;
        }
    }
);

export const handleFilters = createAsyncThunk(
    'borrowing/handleFilters',
    async (
        { option, filters }: { option: 'category' | 'subcategory' | 'status'; filters: FetchParams },
        { dispatch }
    ) => {
        switch (option) {
            case 'category':
                dispatch(borrowingSlice.actions.setSelectedCategory(filters.field || ''))
                break
            case 'subcategory':
                dispatch(borrowingSlice.actions.setSelectedSubcategory(filters.field || ''))
                break
            case 'status':
                dispatch(borrowingSlice.actions.setSelectedStatus(filters.field || ''))
                break
        }
        await dispatch(fetchData(filters))
    }
)


export const borrowingSlice = createSlice({
    name: 'borrowing',
    initialState,
    reducers: {
        setField: (state, action) => {
            state.field = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
        },
        setPage: (state, action) => {
            state.page = action.payload
        },
        setDrawOpen: (state, action) => {
            state.drawOpen = action.payload
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload
        },
        setSelectedSubcategory: (state, action) => {
            state.selectedSubCategory = action.payload
        },
        setSelectedStatus: (state, action) => {
            state.selectedStatus = action.payload
        },
        setSelectedIds: (state, action) => {
            state.selectedIds = action.payload
        },
        resetBorrowing: () => {
            return { ...initialState }
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload?.result || []
                state.total = action.payload?.total || 0
                state.isLoading = false
            })
            .addCase(fetchData.rejected, (state, action) => {
                state.isLoading = false
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.category = action.payload
            })
            .addCase(fectSubcategories.fulfilled, (state, action) => {
                state.subcategory = action.payload
            })
            .addCase(fetchStatus.fulfilled, (state, action) => {
                state.status = action.payload
            })
    }
})

export const {
    setPage,
    setDrawOpen,
    setPageSize,
    resetBorrowing,
    setSelectedIds,
    setField
} = borrowingSlice.actions

export default borrowingSlice.reducer;





