import { Box, Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import baseUrl from 'src/configs/environment'
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

interface LocationType {
    _id: string
    name: string
}

interface ResponsableType {
    _id: string
    grade: string
    name: string
    lastName: string
}

interface ActivosType {
    _id: string
    code: string,
    responsable: ResponsableType | null,
    name: string,
    location: LocationType,
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
    otherLocation: string
    description: string
}

interface DataType {
    data: ActivosType[]
    total: number
}


interface CellType {
    row: ActivosType
}

const Activos = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [category, setCategory] = useState<CategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [data, setData] = useState<DataType>({ data: [], total: 0 });

    const toggleDrawer = () => setDrawOpen(!drawOpen)

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
    }, [open])

    useEffect(() => {
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status')
                const data = response.data
                setStatus(data)
            } catch (error) {
                console.error('error al extraer estados', error)
            }
        }
        fectStatus();
    }, [open])

    useEffect(() => {
        const fetchActivosAbailable = async () => {
            const filters = { skip: page * pageSize, limit: pageSize }
            try {
                const response = await instance.get('/activos/activos-available',
                    {
                        params: filters,
                    }
                )
                console.log(data)
                setData({ data: response.data?.result || [], total: response.data?.total || 0 })
            } catch (error) {
                console.error('error al extraer activos validos', error)
            }
        }
        fetchActivosAbailable();
    }, [open, page, pageSize])

    const handleFilters = async (value: string) => {

        const filters = { field: value, skip: page * pageSize, limit: pageSize }
        try {
            const response = await instance.get('/activos/activos-available',
                {
                    params: filters,
                }
            )
            setData(response.data)
        } catch (error) {
            console.error('error al extraer activos validos', error)
        }
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
                    <Typography variant='body2' noWrap>{row.location?.name}</Typography>
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
            minWidth: 190,
            field: 'responsable',
            headerName: 'Responsable',
            renderCell: ({ row }: CellType) => {
                return (
                    <Typography variant='body2' noWrap>{row.responsable?.grade} {row.responsable?.name} {row.responsable?.lastName}</Typography>
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
                                onClick={toggleDrawer}
                                variant="contained"
                                sx={{ p: 3.5 }}
                                color="info"
                            >
                                Realizar entrega
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', p: 5, justifyContent: 'space-between' }}>
                        <Typography variant='subtitle2'>
                            Lista de activos fijos disponibles
                        </Typography>
                    </Box>
                    <DataGrid
                        autoHeight
                        rows={data?.data || []}
                        columns={columns}
                        getRowId={(row: any) => row._id}
                        pagination
                        pageSize={pageSize}
                        disableSelectionOnClick
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[10, 25, 50]}
                        rowCount={data?.total || 0}
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={'Registro del entrega'}>
                {/* <AddActivos
                    toggle={toggleDrawer}
                    page={page}
                    pageSize={pageSize}
                    defaultValues={activos}
                    mode={mode}
                /> */}
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
