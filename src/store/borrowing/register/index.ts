import { createSlice } from "@reduxjs/toolkit";
import { GradeType } from "src/types/types";

interface LocationType {
    _id: string;
    name: string;
}

interface defaultValuesType {
    date: string;
    time: string;
    grade: GradeType | null;
    name: string;
    lastName: string;
    location: LocationType | null;
    description: string;
    otherLocation: string;
    otherGrade: string;
}

const now = new Date();

const today = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().slice(0, 5);

interface InitialStateType {
    defaultValues: defaultValuesType;
}

export const initialState: InitialStateType = {
    defaultValues: {
        date: today,
        time: currentTime,
        grade: null,
        name: '',
        lastName: '',
        location: null,
        description: '',
        otherLocation: '',
        otherGrade: ''
    }
}

export const registerSlice = createSlice({
    name: 'BorrowingRegister',
    initialState,
    reducers: {
        setData: (state, action) => {
            const { date, time, ...rest } = action.payload;
            state.defaultValues = {
                ...rest,
                date: typeof date === 'string' ? date : today,
                time: typeof time === 'string' ? time : currentTime
            };
        },
        resetBorrowingRegister: () => ({ ...initialState })
    }
})

export const { setData, resetBorrowingRegister } = registerSlice.actions;
export default registerSlice.reducer;
export type { defaultValuesType };
