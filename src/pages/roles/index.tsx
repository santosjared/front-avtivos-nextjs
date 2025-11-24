import { Box, Button, Card, Grid, IconButton, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'src/@core/components/icon';
import AddDraw from 'src/components/draw';
import { AppDispatch, RootState } from 'src/store';
import { deleteRol, fetchData } from 'src/store/role';
import Swal from 'sweetalert2';
import { Rol } from 'src/context/types';
import AddRol from 'src/views/pages/roles/Register';
import Permissions from 'src/views/pages/roles/Permissions';
import Can from 'src/layouts/components/acl/Can';

interface CellType {
    row: Rol
}

const Roles = () => {

    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [mode, setMode] = useState<'create' | 'update'>('create')
    const [id, setId] = useState<string>('')
    const [openPermissons, setOpenPermissions] = useState<boolean>(false)

    const theme = useTheme();

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.rol)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const togglePermissions = () => setOpenPermissions(!openPermissons)

    const handleCreate = () => {
        setMode('create')
        setId('')
        toggleDrawer()
    }

    const handleFilters = (field: string) => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }

    const RowOptions = ({ rol }: { rol: Rol }) => {

        const dispatch = useDispatch<AppDispatch>()
        const handleEdit = () => {
            setId(rol._id)
            setMode('update')
            toggleDrawer()
        }
        const handlePermissions = () => {
            setId(rol._id)
            togglePermissions()
        }
        const handleDelete = async () => {

            const confirme = await Swal.fire({
                title: '¿Estas seguro de eliminar?',
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: theme.palette.info.main,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'Eliminar',
            }).then((result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deleteRol({ filters: { skip: page * pageSize, limit: pageSize }, id: rol._id }))
            }
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Can I='update' a='roles'>
                    <IconButton size='small' onClick={handleEdit}>
                        <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                    </IconButton>
                </Can>
                <Can I='delete' a='roles'>
                    <IconButton size='small' onClick={handleDelete}>
                        <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                    </IconButton>
                </Can>
                <Can I='permissions' a='roles'>
                    <IconButton size='small' onClick={handlePermissions}>
                        <Icon icon='material-symbols:key-vertical-rounded' fontSize={20} color={theme.palette.warning.main} />
                    </IconButton>
                </Can>
            </Box>
        )
    }

    const columns = [
        {
            flex: 0.22,
            minWidth: 220,
            field: 'rol',
            sortable: false,
            headerName: 'Rol',
            renderCell: ({ row }: CellType) => {

                return (
                    <Tooltip title={row.name}>
                        <Typography variant='body2' noWrap>{row.name}</Typography>
                    </Tooltip>
                )
            }
        },
        {
            flex: 0.35,
            minWidth: 300,
            field: 'decription',
            sortable: false,
            headerName: 'Descripción',
            renderCell: ({ row }: CellType) => {

                return (
                    <Tooltip title={row.description}>
                        <Typography variant='body2' noWrap>{row.description}</Typography>
                    </Tooltip>
                )
            }
        },
        {
            flex: 0.15,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {

                return (<RowOptions rol={row} />)
            }
        }
    ]

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
                                    sx={{
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0
                                    }}
                                    onClick={() => handleFilters('')}
                                >
                                    Todos
                                </Button>
                            </Box>
                            <Can I='create' a='roles'>
                                <Button
                                    onClick={handleCreate}
                                    variant="contained"
                                    startIcon={<Icon icon='mdi:add' />}
                                    color='success'
                                    sx={{ p: 3.5 }}
                                >
                                    Nuevo Rol
                                </Button>
                            </Can>
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
            <Can I={mode} a='roles'>
                <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del rol' : 'Editar rol'}>
                    <AddRol
                        toggle={toggleDrawer}
                        page={page}
                        pageSize={pageSize}
                        id={id}
                        mode={mode}
                    />
                </AddDraw>
            </Can>
            <Can I='permissions' a='roles'>
                <Permissions open={openPermissons} toggle={togglePermissions} id={id} page={page} pageSize={pageSize} />
            </Can>
        </Grid>
    )
}

Roles.acl = {
    action: 'read',
    subject: 'roles'
}

Roles.authGuard = true;
export default Roles;