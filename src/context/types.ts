import { GradeType } from "src/types/types"

export type ErrCallbackType = (err: { [key: string]: string }) => void

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'permissions' | 'details' | 'print' | 'calcular' | 'up' | 'dow'
export type Subjects = 'dashboard' | 'users' | 'roles' | 'activos' | 'contable' | 'entrega' | 'devolucion' | 'bitacora' | 'depreciacion'

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type Permission = {
  subject: Subjects
  action: Actions[]
}

export type Rol = {
  name: string,
  permissions: Permission[],
  description: string
  _id: string
}

export type UserDataType = {
  roles: Rol[]
  fullName: string
  profile?: string
  email: string
  rememberMe?: boolean
  _id?: string
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  setLoading: (value: boolean) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}

export type ApiValuesType = {
  get: (endpoint: string, param?: {}) => Promise<any>
  put: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  post: (endpoint: string, data: { [key: string]: any; }) => Promise<any>
  delete: (endpoint: string, param?: {}) => Promise<any>
}
