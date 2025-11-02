import React, { useState, MouseEvent, useEffect, Fragment } from 'react'
import { Box, Button, Card, Grid, IconButton, TextField, Typography } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import AddDraw from 'src/components/draw'
import { RootState, AppDispatch } from 'src/store'
import { dowUser, fetchData, upUser } from 'src/store/user'
import { useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { UserType } from 'src/types/types'
import Swal from 'sweetalert2'
import AddUser from 'src/views/pages/users/Register'

interface UserRoleType {
    [key: string]: { icon: string; color: string }
}
const userRoleObj: UserRoleType = {
    admin: { icon: 'mdi:laptop', color: 'error.main' },
    user: { icon: 'mdi:user', color: 'warning.main' },
    other: { icon: 'mdi:account-outline', color: 'info.main' }
}

interface GradeType {
    name: string
    _id: string
}
interface DefaultUserType {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    exp: string,
    grade: GradeType | null,
    otherGrade: string
    password: string,
    rol: string[]
    _id?: string
}

const defaultValues: DefaultUserType = {
    name: '',
    lastName: '',
    gender: '',
    email: '',
    ci: '',
    phone: '',
    address: '',
    exp: '',
    grade: null,
    otherGrade: '',
    password: '',
    rol: []
}

interface CellType {
    row: UserType
}

const Users = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [userData, setUserData] = useState<DefaultUserType>(defaultValues)

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'grade',
            headerName: 'Grado',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2'>{row.grade?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 150,
            field: 'name',
            headerName: 'Nombres',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2'>{row.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 220,
            field: 'lastname',
            headerName: 'Apellidos',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2'>{row.lastName}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 110,
            field: 'ci',
            sortable: false,
            headerName: 'CI',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.ci}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 50,
            field: 'exp',
            headerName: 'Expedido',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2'>{row.exp}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 160,
            field: 'address',
            sortable: false,
            headerName: 'Dirección',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.address}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'phone',
            sortable: false,
            headerName: 'Celular',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography noWrap variant='body2'>{row.phone}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'gender',
            sortable: false,
            headerName: 'Género',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography noWrap variant='body2'>{row.gender}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 200,
            field: 'email',
            sortable: false,
            headerName: 'email',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography noWrap variant='body2'>{row.email}</Typography>
                )
            }
        },
        {
            flex: 0.15,
            field: 'rol',
            minWidth: 150,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    py: 1,
                }}>
                    {row.rol.length === 0 ? (
                        <Typography variant='body2'>Ninguno</Typography>
                    ) : (
                        row.rol.map((rol) => (
                            <Box
                                key={rol.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    '& svg': {
                                        mr: 1,
                                        color: userRoleObj[
                                            rol.name !== 'admin' && rol.name !== 'user' ? 'other' : rol.name
                                        ].color
                                    },
                                }}
                            >
                                <Icon
                                    icon={userRoleObj[
                                        rol.name !== 'admin' && rol.name !== 'user' ? 'other' : rol.name
                                    ].icon}
                                    fontSize={18}
                                />
                                <Typography
                                    noWrap={false}
                                    variant='body2'
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {rol.name}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
            )
        },
        {
            flex: 0.15,
            field: 'status',
            minWidth: 150,
            headerName: 'Estado',
            renderCell: ({ row }: CellType) => (
                <CustomChip
                    skin='light'
                    size='small'
                    label={row.status}
                    color={row.status === 'activo' ? 'success' : 'secondary'}
                    sx={{ textTransform: 'capitalize' }}
                />
            )
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {
                return (<RowOptions user={row} />)
            }
        }
    ]
    const RowOptions = ({ user }: { user: UserType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
        const rowOptionsOpen = Boolean(anchorEl)

        const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
        }
        const handleRowOptionsClose = () => {
            setAnchorEl(null)
        }

        const handleDow = async () => {
            setAnchorEl(null)
            const confirme = await Swal.fire({
                title: `¿Estas seguro dar de baja a ${user.name} ${user.lastName}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ff4040',
                confirmButtonText: 'Dar de baja',
            }).then((result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(dowUser({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: user._id }))
            }
        }

        const handleUp = async () => {
            setAnchorEl(null)
            const confirme = await Swal.fire({
                title: `¿Estas seguro de reincorporar ${user.name} ${user.lastName}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#72E128',
                confirmButtonText: 'reincorporar',
            }).then((result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(upUser({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: user._id }))
            }
        }

        const handleEdit = () => {
            const rol = user.rol?.map(role => role._id) || [];

            setUserData({
                ...user,
                rol,
                otherGrade: ''
            });

            setMode('edit');
            setAnchorEl(null);
            toggleDrawer();
        };


        return (
            <>
                <IconButton size='small' onClick={handleRowOptionsClick}>
                    <Icon icon='mdi:dots-vertical' />
                </IconButton>
                <Menu
                    keepMounted
                    anchorEl={anchorEl}
                    open={rowOptionsOpen}
                    onClose={handleRowOptionsClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    PaperProps={{ style: { minWidth: '8rem' } }}
                >
                    <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                        <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
                        Editar
                    </MenuItem>
                    {user.status === 'activo' ?
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleDow}>
                            <Icon icon='mdi:arrow-down-thick' fontSize={20} color='#ff4040' />
                            Dar de baja
                        </MenuItem> :
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleUp}>
                            <Icon icon='mdi:arrow-up-thick' fontSize={20} color='#72E128' />
                            Reincorporar
                        </MenuItem>
                    }

                </Menu>
            </>
        )
    }

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.user)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const handleCreate = () => {
        setMode('create')
        setUserData(defaultValues)
        toggleDrawer()
    }


    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const handleFilters = (field: string) => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ p: 5, pb: 0 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                flexWrap: 'nowrap',
                                gap: 10,
                                width: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Buscar"
                                    variant="outlined"
                                    name="search"
                                    autoComplete="off"
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                    sx={{
                                        flex: 1,
                                        '& .MuiInputBase-root': {
                                            borderTopRightRadius: 0,
                                            borderBottomRightRadius: 0,
                                        }
                                    }}
                                />

                                <Button
                                    variant="outlined"
                                    onClick={() => handleFilters(field)}
                                    startIcon={<Icon icon='mdi:search' />}
                                    sx={{
                                        borderRadius: 0,
                                        borderLeft: 1
                                    }}
                                >
                                    Buscar
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={() => handleFilters('')}
                                    sx={{
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0
                                    }}
                                >
                                    Todos
                                </Button>
                            </Box>
                            <Button
                                onClick={handleCreate}
                                variant="contained"
                                color='success'
                                startIcon={<Icon icon='mdi:add' />}
                                sx={{ p: 3.5 }}
                            >
                                Nuevo usuario
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ p: 5 }}>
                        <Typography variant='subtitle2'>
                            Lista de usuarios
                        </Typography>
                    </Box>
                    <DataGrid
                        autoHeight
                        rows={store.data}
                        columns={columns}
                        getRowId={(row: any) => row._id}
                        pagination
                        pageSize={pageSize}
                        disableSelectionOnClick
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[10, 25, 50]}
                        rowCount={store.total}
                        paginationMode="server"
                        onPageChange={(newPage) => setPage(newPage)}
                        getRowHeight={() => 'auto'}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': { borderRadius: 0 },
                            '& .MuiDataGrid-cell': {
                                alignItems: 'start',
                                py: 1,
                            },
                        }}
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }
                        }
                    />
                </Card>
            </Grid>
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del usuario' : 'Editar usuario'}>
                <AddUser
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={userData}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    )
}
Users.acl = {
    action: 'read',
    subject: 'users'
}

Users.authGuard = true;
export default Users