import { Box, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, useTheme } from "@mui/material"
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
    image: File | null,
    imageUrl: string | null,
    status: StatusType | null
    otherStatus: string,
    category: ContableType | null
    subcategory: SubCategoryType | null
    otherLocation: string
    description: string
}


interface CellType {
    row: ActivosType
}

const today = new Date().toISOString().split('T')[0]

const defaultValues: ActivosType = {
    code: '',
    responsable: null,
    name: '',
    location: null,
    price_a: 0,
    date_a: today,
    status: null,
    otherStatus: '',
    image: null,
    imageUrl: null,
    category: null,
    subcategory: null,
    otherLocation: '',
    description: ''
}



const Activos = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'create' | 'edit'>('create')
    const [activos, setActivos] = useState<ActivosType>(defaultValues)
    const [category, setCategory] = useState<ContableType[]>([])
    const [subcategory, setSubCategory] = useState<SubCategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubcategory] = useState<string>('')
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
                const response = await instance.get('/contables/subcategories')
                const data = response.data
                setSubCategory(data || [])
            } catch (error) {
                console.error('error al extraer la sub categoria', error)
            }
        }
        fectStatus();
    }, [])

    useEffect(() => {
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status')
                const data = response.data
                setStatus(data || [])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectStatus();
    }, [mode, drawOpen])

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

        const theme = useTheme()

        const handleEdit = () => {

            const date_a = new Date(activo.date_a)
            const form_a = `${date_a.getFullYear()}-${String(date_a.getMonth() + 1).padStart(2, '0')}-${String(date_a.getDate()).padStart(2, '0')}`

            setActivos({ ...activo, date_a: form_a })
            setMode('edit')
            toggleDrawer()
        }

        const handleDelete = async () => {

            const confirme = await Swal.fire({
                title: `¿Estas seguro de eliminar el activo ${activo.name} - Código: ${activo.code}?`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: theme.palette.info.main,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deleteActivos({ id: activo._id || '', filtrs: { field: '', skip: page * pageSize, limit: pageSize } }))
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
        {
            field: 'description', headerName: 'Descripción', minWidth: 200, flex: 0.2,
            renderCell: ({ row }: CellType) => (
                <Tooltip title={row.description}>
                    <Typography
                        variant='body2'
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {row.description}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'actions', headerName: 'Acciones', minWidth: 90, flex: 0.09, sortable: false,
            renderCell: ({ row }: CellType) => <RowOptions activo={row} />
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
            <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del activo fijo' : 'Editar activo fijo'}>
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
