import { Box, Button, Card, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { instance } from "src/configs/axios";
import AddEntrega from "./Register";

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id: string
    name: string,
    util: number,
    subcategory: SubCategoryType[]
    description?: string
}

interface StatusType {
    _id: string
    name: string
}

interface LocationType {
    _id: string
    name: string
}

interface GradeType {
    name: string
    _id: string
}

interface ResponsableType {
    _id: string
    grade: GradeType
    name: string
    lastName: string
}

interface ActivosType {
    _id?: string
    code: string,
    responsable: ResponsableType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
}

interface RegisterType {
    date: string
    time: string
    grade: GradeType | null
    name: string
    lastName: string
    location: LocationType | null
    description: string
    otherLocation: string
    otherGrade: string

}


interface CellType {
    row: ActivosType
}

interface DataType {
    data: ActivosType[]
    total: number
}


interface CellType {
    row: ActivosType
}

const columns = [
    {
        field: 'code', headerName: 'Código', minWidth: 100, flex: 0.1,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.code}><Typography variant="body2" noWrap>{row.code}</Typography></Tooltip>
        )
    },
    {
        field: 'name', headerName: 'Nombre del activo', minWidth: 160, flex: 0.16,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.name}><Typography variant="body2" noWrap>{row.name}</Typography></Tooltip>
        )
    },
    {
        field: 'location', headerName: 'Ubicación', minWidth: 160, flex: 0.16,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.location?.name}><Typography variant="body2" noWrap>{row.location?.name}</Typography></Tooltip>
        )
    },
    {
        field: 'price_a', headerName: 'Precio de Adquisición', minWidth: 120, flex: 0.12,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.price_a}</Typography>
    },
    {
        field: 'date_a', headerName: 'Fecha de Adquisición', minWidth: 130, flex: 0.13,
        renderCell: ({ row }: CellType) => {
            const date = new Date(row.date_a)
            const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
            return <Typography variant="body2" noWrap>{formatted}</Typography>
        }
    },
    {
        field: 'photo', headerName: 'Foto', minWidth: 80, flex: 0.08,
        renderCell: ({ row }: CellType) => (
            <Box sx={{ width: 40, height: 40 }}>
                <img
                    src={`${baseUrl().backendURI}/images/${row.imageUrl}`}
                    alt='Activo'
                    style={{ width: 40, height: 40, borderRadius: 3 }}
                />
            </Box>
        )
    },
    {
        field: 'category', headerName: 'Categoría', minWidth: 140, flex: 0.14,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.category?.name}</Typography>
    },
    {
        field: 'subcategory', headerName: 'Sub Categoría', minWidth: 140, flex: 0.14,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.subcategory?.name}</Typography>
    },
    {
        field: 'responsable', headerName: 'Responsable', minWidth: 190, flex: 0.19,
        renderCell: ({ row }: CellType) => {
            const text = `${row.responsable?.grade?.name || ''} ${row.responsable?.name || ''} ${row.responsable?.lastName || ''}`
            return (
                <Tooltip title={text}>
                    <Typography variant="body2" noWrap>{text}</Typography>
                </Tooltip>
            )
        }
    },
    {
        field: 'status',
        headerName: 'Estado',
        minWidth: 90,
        flex: 0.09,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.status?.name || ''} arrow>
                <span>
                    <CustomChip
                        skin='light'
                        size='small'
                        label={row.status?.name}
                        rounded
                        color={
                            row.status?.name === 'Bueno' ? 'success' :
                                row.status?.name === 'Regular' ? 'warning' :
                                    row.status?.name === 'Malo' ? 'error' : 'info'
                        }
                    />
                </span>
            </Tooltip>
        )
    },
]

interface Props {
    setStep: (step: 'borrowing' | 'add' | 'confirmed') => void
    setRegister: (data: RegisterType) => void
    setActivos: (data: ActivosType[]) => void
}

const Entrega = ({ setStep, setRegister, setActivos }: Props) => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [category, setCategory] = useState<ContableType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubcategory] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState('');
    const [subcategory, setSubCategory] = useState<SubCategoryType[]>([])
    const [data, setData] = useState<DataType>({ data: [], total: 0 });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleDrawer = () => setDrawOpen(!drawOpen)

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/contables')
                const data = response.data
                setCategory(data || [])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [])

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
    }, [])

    useEffect(() => {
        const fectSubCategory = async () => {
            try {
                const response = await instance.get('/contables/subcategories')
                const data = response.data
                setSubCategory(data || [])
            } catch (error) {
                console.error('error al extraer la sub categoria', error)
            }
        }
        fectSubCategory();
    }, [])

    useEffect(() => {
        const fetchActivosAbailable = async () => {
            const filters = { skip: page * pageSize, limit: pageSize }
            try {
                const response = await instance.get('/activos/activos-available',
                    {
                        params: filters,
                    }
                )
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
            setData({ data: response.data?.result || [], total: response.data?.total || 0 })
        } catch (error) {
            console.error('error al extraer activos validos', error)
        }
    }

    const handleSave = (entrega: RegisterType) => {
        const selectedActivos = data.data.filter(row => selectedIds.includes(row._id || ''))
        setRegister(entrega)
        setActivos(selectedActivos)
        setStep('confirmed')
    }


    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ display: "flex", justifyContent: 'space-between', p: 5, pb: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={() => setStep('borrowing')} startIcon={<Icon icon='ic:baseline-arrow-back-ios' />}>Atras</Button>
                        <Button
                            onClick={toggleDrawer}
                            variant="contained"
                            sx={{ p: 3.5 }}
                            disabled={selectedIds.length <= 0}
                            color="info"
                        >
                            Realizar entrega
                        </Button>
                    </Box>
                    <Divider />
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
                                <InputLabel id="category-select">Categoría</InputLabel>
                                <Select
                                    labelId="category-select"
                                    id="select-category"
                                    label="Categoría"
                                    disabled={category.length === 0}
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
                                <InputLabel id="subcategory-select">Sub Categoría</InputLabel>
                                <Select
                                    labelId="subcategory-select"
                                    id="select-subcategory"
                                    label="Sub Categoría"
                                    disabled={subcategory.length === 0}
                                    value={selectedSubCategory}
                                    onChange={(e) => {
                                        const selected = e.target.value
                                        setSelectedSubcategory(selected)
                                        handleFilters(selected)
                                    }}
                                >
                                    {subcategory.map((cat, index) => (
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
                        checkboxSelection
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[10, 25, 50]}
                        rowCount={data?.total || 0}
                        paginationMode="server"
                        onPageChange={(newPage) => setPage(newPage)}
                        onSelectionModelChange={(newSelection: any) => {
                            setSelectedIds(newSelection);
                        }}
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }}
                    />


                </Card>
            </Grid>
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={'Registro del entrega'}>
                <AddEntrega toggle={toggleDrawer} handleSave={handleSave} />
            </AddDraw>
        </Grid>
    )
}

export default Entrega
