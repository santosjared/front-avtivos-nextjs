import { Box, Button, Card, CardHeader, Grid, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React, { useState, MouseEvent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'src/@core/components/icon';
import AddDraw from 'src/components/draw';
import { AppDispatch, RootState } from 'src/store';
import { deleteRol, fetchData } from 'src/store/role';
import Swal from 'sweetalert2';
import { Rol } from 'src/context/types';
import AddRol from 'src/views/pages/roles/Register';
import Permissions from 'src/views/pages/roles/Permissions';

interface CellType {
    row: Rol
}

const defaultValues: Rol = {
    name: '',
    description: '',
    permissions: [],
    _id: '',
    __v: ''
}

const Roles = () => {

    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [rolData, setRolData] = useState<Rol>(defaultValues)
    const [openPermissons, setOpenPermissions] = useState<boolean>(false)

    const RowOptions = ({ rol }: { rol: Rol }) => {

        const dispatch = useDispatch<AppDispatch>()
        const handleEdit = () => {
            setRolData(rol)
            setMode('edit')
            toggleDrawer()
        }
        const handlePermissions = () => {
            setRolData(rol)
            togglePermissions()
        }
        const handleDelete = async () => {

            const confirme = await Swal.fire({
                title: '¿Estas seguro de eliminar?',
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ff4040',
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return await result.isConfirmed });
            if (confirme) {
                dispatch(deleteRol({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: rol._id }))
            }
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <IconButton size='small' onClick={handleEdit}>
                    <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
                </IconButton>
                <IconButton size='small' onClick={handleDelete}>
                    <Icon icon='ic:outline-delete' fontSize={20} color='#ff4040' />
                </IconButton>
                <IconButton size='small' onClick={handlePermissions}>
                    <Icon icon='material-symbols:key-vertical-rounded' fontSize={20} color='#9f9f0baa' />
                </IconButton>
            </Box>
        )
    }
    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'rol',
            sortable: false,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'decription',
            sortable: false,
            headerName: 'Descripcion',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.description}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {
                return (<RowOptions rol={row} />)
            }
        }
    ]

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.rol)
    useEffect(() => {
        dispatch(fetchData({ filter: '', skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const togglePermissions = () => setOpenPermissions(!openPermissons)

    const handleCreate = () => {
        setMode('create')
        setRolData(defaultValues)
        toggleDrawer()
    }

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
                                    InputProps={{
                                        endAdornment: <Icon icon="mdi:search" />,
                                    }}
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
                                startIcon={<Icon icon='mdi:add' />}
                                color='success'
                                sx={{ p: 3.5 }}
                            >
                                Nuevo Rol
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ p: 5 }}>
                        <Typography variant='subtitle2'>
                            Lista de roles
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del rol' : 'Editar rol'}>
                <AddRol
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={rolData}
                    mode={mode}
                />
            </AddDraw>
            <Permissions open={openPermissons} toggle={togglePermissions} rol={rolData} />
        </Grid>
    )
}

Roles.acl = {
    action: 'read',
    subject: 'roles'
}

Roles.authGuard = true;
export default Roles;