import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface InitialStateType {
    mode: 'create' | 'update'
}

const initialState: InitialStateType = {
    mode: 'create'
}

export const devolverSlice = createSlice({
    name: 'devolver',
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<'create' | 'update'>) => {
            state.mode = action.payload
        }
    }
})

export const { setState } = devolverSlice.actions

export default devolverSlice.reducer