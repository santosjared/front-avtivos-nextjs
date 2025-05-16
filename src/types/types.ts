
export type UserType = {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    password: string,
    otherGender: string,
    rol: string
    _id?: string
    __v?: string
}

interface Permission {
    _id: string
    subject: {
        _id: string
        name: string
    }
    action: {
        _id: string
        name: string
    }[]
}
export type RolType = {
    name: string,
    description: string,
    permissions?: Permission[],
    _id?: string
    __v?: string
}

export type SubjectType = {
    name: string
    _id: string
}
export type ActionType = {
    name: string
    _id: string
}
