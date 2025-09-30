import { Box, Button, Card, CardHeader, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import AddActivos from "./register";
import { deleteActivos, fetchData } from "src/store/activos";
import baseUrl from 'src/configs/environment'
import Swal from 'sweetalert2'
import CustomChip from 'src/@core/components/mui/chip'
import { instance } from "src/configs/axios";

interface CategoryType {
    _id: string
    name: string
}

interface StatusType {
    _id: string
    name: string
}

interface ActivosType {
    code: string,
    name: string,
    location: string,
    price_a: number,
    date_a: string,
    date_e: string,
    cantidad: number,
    image: File | null,
    imageUrl: string | null,
    status: StatusType
    otherStatus: string,
    category: CategoryType
    otherCategory: string
    description: string
}


interface CellType {
    row: ActivosType
}

const today = new Date().toISOString().split('T')[0]

const defaultValues: ActivosType = {
    code: '',
    name: '',
    location: '',
    price_a: 0,
    date_a: today,
    date_e: today,
    cantidad: 0,
    status: {
        _id: '',
        name: ''
    },
    otherStatus: '',
    image: null,
    imageUrl: null,
    category: {
        _id: '',
        name: ''
    },
    otherCategory: '',
    description: ''
}



const Activos = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [activos, setActivos] = useState<ActivosType>(defaultValues)
    const [category, setCategory] = useState<CategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    const store = useSelector((state: RootState) => state.activos)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/activos/category')
                const data = response.data
                setCategory(data)
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [mode, open])

    useEffect(() => {
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status')
                const data = response.data
                setStatus(data)
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectStatus();
    }, [mode, open])

    const handleFilters = (value: string) => {
        dispatch(fetchData({ field: value, skip: page * pageSize, limit: pageSize }))
    }

    const handleCreate = () => {
        setActivos(defaultValues)
        setMode('create')
        toggleDrawer()
    }

    const RowOptions = ({ activo }: { activo: ActivosType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const handleEdit = () => {
            setActivos(activo)
            setMode('edit')
            toggleDrawer()
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
                // dispatch(deleteActivos({ filters: { filter: '', skip: page * pageSize, limit: pageSize }, id: rol._id }))
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
            </Box>
        )
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
            minWidth: 120,
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
            minWidth: 120,
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
            minWidth: 50,
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
            minWidth: 10,
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
                    <Typography variant='body2' noWrap>{row.category?.name}</Typography>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 90,
            field: 'status',
            headerName: 'Estado',
            renderCell: ({ row }: CellType) => (
                <CustomChip
                    skin='light'
                    size='small'
                    label={row.status?.name}
                    color={row.status?.name === 'Bueno' ? 'success' : row.status?.name === 'Regular' ? 'warning' : row.status?.name === 'Malo' ? 'error' : 'info'}
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
                return (<RowOptions activo={row} />)
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
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            <FormControl>
                                <InputLabel id="category-select">Categoria</InputLabel>
                                <Select
                                    labelId="category-select"
                                    id="select-category"
                                    label="Categoria"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        const selected = e.target.value
                                        setSelectedCategory(selected)
                                        handleFilters(selected)
                                    }}
                                >
                                    {category.map((cat, index) => (
                                        <MenuItem value={cat.name} key={index}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <InputLabel id="status-select">Estado</InputLabel>
                                <Select
                                    labelId="status-select"
                                    id="select-status"
                                    label="Estado"
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        const selected = e.target.value
                                        setSelectedStatus(selected)
                                        handleFilters(selected)
                                    }}
                                >
                                    {status.map((st, index) => (
                                        <MenuItem value={st.name} key={index}>{st.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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
                                startIcon={<Icon icon='mdi:add' />}
                                sx={{ p: 3.5 }}
                                color="success"
                            >
                                Nuevo Activo
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', p: 5, justifyContent: 'space-between' }}>
                        <Typography variant='subtitle2'>
                            Lista de activos fijos
                        </Typography>
                        <Button variant="outlined" >DETALLES</Button>
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
