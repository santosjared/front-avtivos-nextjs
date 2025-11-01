import { Rol } from "src/context/types"


export type GradeType = {
    name: string
    _id: string
}
export type UserType = {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    grade: GradeType,
    exp: string
    password: string,
    rol: Rol[]
    status: string
    _id: string
    __v?: string
}

