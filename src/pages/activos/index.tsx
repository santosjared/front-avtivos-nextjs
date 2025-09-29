import { Box, Button, Card, CardHeader, Grid, TextField, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import AddActivos from "./register";
import { fetchData } from "src/store/activos";
import baseUrl from 'src/configs/environment'

interface ActivosType {
    code: string,
    name: string,
    location: string,
    price_a: number,
    date_a: string,
    date_e: string,
    lote: string,
    cantidad: number,
    image: File | null,
    imageUrl: string | null,
    status: string
    category: string
    otherCategory: string
}

interface Activo {
    _id?: string
    code: string
    name: string
    location: string
    price_a: number
    lote: string
    cantidad: number
    date_a: string
    date_e: string
    status?: string
    imageUrl?: string

}

interface CellType {
    row: Activo
}

const today = new Date().toISOString().split('T')[0]

const defaultValues: ActivosType = {
    code: '',
    name: '',
    location: '',
    price_a: 0,
    date_a: today,
    date_e: today,
    lote: '',
    cantidad: 0,
    status: '',
    image: null,
    imageUrl: null,
    category: '',
    otherCategory: ''
}

const columns = [
    {
        flex: 0.2,
        minWidth: 90,
        field: 'code',
        sortable: false,
        headerName: 'Codigo',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.code}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'name',
        sortable: false,
        headerName: 'Nombre',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.name}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'location',
        headerName: 'Ubicacion',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.location}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'price_a',
        headerName: 'Precio de Adquicion',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.price_a}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'date_a',
        headerName: 'Fecha de Adquicion',
        renderCell: ({ row }: CellType) => {
            const date = new Date(row.date_e)
            const form = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return (
                <Typography variant='body2' noWrap>{form}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'date_e',
        headerName: 'Fecha de expiracion',
        renderCell: ({ row }: CellType) => {
            const date = new Date(row.date_e)
            const form = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            return (
                <Typography variant='body2' noWrap>{form}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'photo',
        headerName: 'Foto',
        renderCell: ({ row }: CellType) => {
            return (
                <Box sx={{ width: 40, height: 40, borderRadius: '3px' }}>
                    <img
                        src={`${baseUrl().backendURI}/images/${row.imageUrl}`}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '3px'
                        }}
                        alt="im"
                    />
                </Box>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'cantidad',
        headerName: 'Cantidad',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.cantidad}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'category',
        headerName: 'Categoria',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.cantidad}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'status',
        headerName: 'Estado',
        renderCell: ({ row }: CellType) => {
            return (
                <Typography variant='body2' noWrap>{row.status}</Typography>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 90,
        field: 'Actions',
        headerName: 'Acciones'
    }
]

const Activos = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [activos, setActivos] = useState<ActivosType>(defaultValues)

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const store = useSelector((state: RootState) => state.activos)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const handleFilters = () => {

    }

    const handleCreate = () => {
        toggleDrawer()
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
                                gap: 5,
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
                                sx={{ p: 3.5 }}
                            >
                                Entrega de activos
                            </Button>
                            <Button
                                onClick={handleCreate}
                                variant="contained"
                                sx={{ p: 3.5 }}
                            >
                                Devolucion de activos
                            </Button>
                            <Button
                                onClick={handleCreate}
                                variant="contained"
                                startIcon={<Icon icon='mdi:add' />}
                                sx={{ p: 3.5 }}
                                color="success"
                            >
                                Nuevo Activo
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ p: 5 }}>
                        <Typography variant='subtitle2'>
                            Lista de activos fijos
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
                <AddActivos
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={activos}
                    mode={mode}
                />
            </AddDraw>
        </Grid>
    )
}

Activos.acl = {
    action: 'read',
    subject: 'activos'
}

Activos.authGuard = true;

export default Activos
