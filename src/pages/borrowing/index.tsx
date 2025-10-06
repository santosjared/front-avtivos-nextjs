import React, { useState, useEffect } from 'react'
import { Box, Button, Card, Grid, IconButton, TextField, Typography } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { UserType } from 'src/types/types'
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import { fetchData } from 'src/store/entrega'

interface LocationType {
    _id: string
    name: string
}

interface EntregaType {
    date: string
    time: string
    user_en: UserType
    user_rec: string
    location: LocationType
}

interface CellType {
    row: EntregaType
}

const columns = [
    {
        flex: 0.2,
        minWidth: 90,
        field: 'date',
        headerName: 'Fecha de entrega',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2'>{row.date}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 190,
        field: 'hrs',
        headerName: 'Hora de la entrega ',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2'>{row.time}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 220,
        field: 'user_entrega',
        headerName: 'Usuario que entrega',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2'>{row.user_en?.grade || ''} {row.user_en?.name || ''} {row.user_en?.lastName || ''}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 110,
        field: 'user_recibe',
        sortable: false,
        headerName: 'Usuario que recibe',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.user_rec}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 50,
        field: 'location',
        headerName: 'ubicacion',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2'>{row.location?.name}</Typography>
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
            return (<RowOptions entrega={row} />)
        }
    }
]
const RowOptions = ({ entrega }: { entrega: any }) => {

    const dispatch = useDispatch<AppDispatch>()

    const handleEdit = () => {
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
        }).then(async (result) => { return result.isConfirmed });
        if (confirme) {
            // dispatch(deleteActivos({ id: activo._id, filtrs: { field: '', skip: page * pageSize, limit: pageSize } }))
        }
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton size='small' onClick={handleEdit}>
                <Icon icon='mdi:pencil-outline' fontSize={20} color='#00a0f4' />
            </IconButton>
            <IconButton size='small' onClick={handleDelete}>
                <Icon icon='mdi:help-circle-outline' fontSize={20} color='#00a0f4' />
            </IconButton>
            <IconButton size='small' onClick={handleDelete}>
                <Icon icon='ic:outline-delete' fontSize={20} color='#ff4040' />
            </IconButton>
        </Box>
    )
}

const Borrowing = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')

    const router = useRouter()

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.entrega)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

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
                                onClick={() => router.replace('entrega')}
                                variant="contained"
                                color='success'
                                startIcon={<Icon icon='mdi:add' />}
                                sx={{ p: 3.5 }}
                            >
                                Nuevo entrega
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ p: 5 }}>
                        <Typography variant='subtitle2'>
                            Lista de entregados
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
        </Grid>
    )
}
Borrowing.acl = {
    action: 'read',
    subject: 'entrega'
}

Borrowing.authGuard = true;
export default Borrowing