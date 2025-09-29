import React, { useState, MouseEvent, useEffect, ChangeEvent, Fragment } from 'react'
import { Box, Button, Card, CardHeader, FormControl, Grid, IconButton, TextField, Typography } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import AddDraw from 'src/components/draw'
import { RootState, AppDispatch } from 'src/store'
import { dowUser, fetchData, upUser } from 'src/store/user'
import { useSelector } from 'react-redux'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import CustomChip from 'src/@core/components/mui/chip'
import AddUser from './register'
import { UserType } from 'src/types/types'
import Swal from 'sweetalert2'



interface CellType {
    row: UserType
}
interface UserRoleType {
    [key: string]: { icon: string; color: string }
}
const userRoleObj: UserRoleType = {
    admin: { icon: 'mdi:laptop', color: 'error.main' },
    user: { icon: 'mdi:user', color: 'warning.main' },
    other: { icon: 'mdi:account-outline', color: 'info.main' }
}



const renderClient = (row: UserType) => {

    return (
        <CustomAvatar
            skin='light'
            color='primary'
            sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
        >
            {getInitials(row.name && row.lastName ? `${row.name} ${row.lastName}` : row.name ? row.name : 'Desconocido')}
        </CustomAvatar>
    )
}

interface DefaultUserType {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    ci: string,
    phone: string,
    address: string,
    password: string,
    rol: string[]
}

const defaultValues: DefaultUserType = {
    name: '',
    lastName: '',
    gender: '',
    email: '',
    ci: '',
    phone: '',
    address: '',
    password: '',
    rol: []
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
            minWidth: 230,
            field: 'fullName',
            headerName: 'Nombres y Apellidos',
            renderCell: ({ row }: CellType) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {renderClient(row)}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: theme => `${theme.palette.text.secondary}` }}>{`${row.name} ${row.lastName}`}</Typography>
                            <Typography noWrap variant='caption'>
                                {row.email}
                            </Typography>
                        </Box>
                    </Box>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
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
            minWidth: 90,
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
            flex: 0.15,
            field: 'rol',
            minWidth: 150,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => {
                return (
                    <Box>
                        {row.rol.length == 0 ? 'Niguno' :
                            <Fragment>
                                {
                                    row.rol.map((rol) => (
                                        <Box key={rol.name} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            '& svg': { mr: 3, color: userRoleObj[rol.name || 'other'].color }
                                        }}>
                                            <Icon icon={userRoleObj[rol.name || 'other'].icon} fontSize={20} />
                                            <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                                {rol.name}
                                            </Typography>
                                        </Box>
                                    ))
                                }
                            </Fragment>
                        }
                    </Box>
                )
            }
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
                rol
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
    const handleFilters = () => {
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
                                    onClick={handleFilters}
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
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
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