import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useMemo, useState } from "react"
import Icon from 'src/@core/components/icon'
import AddDraw from "src/components/draw"
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import AddDevolucion from "src/views/pages/devolucion/Register"
import { UserType } from "src/types/types"
import { instance } from "src/configs/axios"
import { useRouter } from "next/router"
import Confirmar from "src/views/pages/devolucion/Confirmed"

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}
interface ContableType {
    _id: string
    name: string
    util: number
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
    code: string
    responsable: ResponsableType | null
    name: string
    location: LocationType | null
    price_a: number
    date_a: string
    imageUrl: string | null
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
    disponibilidad: boolean
}
interface EntregaType {
    _id?: string
    code: string
    date: string
    time: string
    grade: GradeType
    name: string
    lastName: string
    user_en: UserType
    location: LocationType
    activos: ActivosType[]
    documentUrl?: string
    description?: string
}
interface RegisterType {
    date: string
    time: string
    grade: GradeType | null
    name: string
    lastName: string
    code: string
    description: string
}
interface CellType {
    row: ActivosType
}

const columns = [
    {
        field: 'code', headerName: 'Código', flex: 0.1, minWidth: 100,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.code}><Typography variant="body2" noWrap>{row.code}</Typography></Tooltip>
        )
    },
    {
        field: 'name', headerName: 'Nombre del activo', flex: 0.16, minWidth: 160,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.name}><Typography variant="body2" noWrap>{row.name}</Typography></Tooltip>
        )
    },
    {
        field: 'location', headerName: 'Ubicación', flex: 0.16, minWidth: 160,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.location?.name}><Typography variant="body2" noWrap>{row.location?.name}</Typography></Tooltip>
        )
    },
    {
        field: 'price_a', headerName: 'Precio de Adquisición', flex: 0.12, minWidth: 120,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.price_a}</Typography>
    },
    {
        field: 'date_a', headerName: 'Fecha de Adquisición', flex: 0.13, minWidth: 130,
        renderCell: ({ row }: CellType) => {
            const date = new Date(row.date_a)
            const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
            return <Typography variant="body2" noWrap>{formatted}</Typography>
        }
    },
    {
        field: 'photo', headerName: 'Foto', flex: 0.08, minWidth: 80,
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
        field: 'category', headerName: 'Categoría', flex: 0.14, minWidth: 140,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.category?.name}</Typography>
    },
    {
        field: 'subcategory', headerName: 'Sub Categoría', flex: 0.14, minWidth: 140,
        renderCell: ({ row }: CellType) => <Typography variant="body2" noWrap>{row.subcategory?.name}</Typography>
    },
    {
        field: 'status', headerName: 'Estado', flex: 0.15, minWidth: 90,
        renderCell: ({ row }: CellType) => (
            <Tooltip title={row.status?.name || ''} arrow>
                <span>
                    <CustomChip
                        skin='light'
                        size='small'
                        label={row.disponibilidad ? 'Devuelto' : 'Sin Devolver'}
                        rounded
                        color={row.disponibilidad ? 'success' : 'error'}
                    />
                </span>
            </Tooltip>
        )
    }
]

const Devolver = () => {
    const [data, setData] = useState<EntregaType | null>(null)
    const [categories, setCategories] = useState<ContableType[]>([])
    const [subcategories, setSubcategories] = useState<SubCategoryType[]>([])
    const [statuses, setStatuses] = useState<StatusType[]>([])

    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedSubCategory, setSelectedSubCategory] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("")
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [drawOpen, setDrawOpen] = useState(false)
    const [openNextPage, setOpenNextPage] = useState<boolean>(false)
    const [register, setRegister] = useState<RegisterType | null>(null)
    const [activos, setActivos] = useState<ActivosType[]>([])

    const router = useRouter()

    const toogleNext = () => setOpenNextPage(!openNextPage)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const entrega = await instance.get(`devolucion/entregas/${router.query.id}`)
                setData(entrega.data || null)
                const options = await instance.get('devolucion/options')
                setCategories(options.data.categories)
                setSubcategories(options.data.subcategories)
                setStatuses(options.data.status)
            } catch (error) {
                console.error(error)
            }
        }
        fetchData()
    }, [router.query.id])

    const filteredRows = useMemo(() => {
        if (!data?.activos) return []

        return data.activos.filter((item) => {
            const matchCategory = !selectedCategory || item.category?.name === selectedCategory
            const matchSub = !selectedSubCategory || item.subcategory?.name === selectedSubCategory
            const matchStatus = !selectedStatus || item.status?.name === selectedStatus
            const searchLower = search.toLowerCase()
            const matchSearch =
                !search ||
                item.code.toLowerCase().includes(searchLower) ||
                item.name.toLowerCase().includes(searchLower) ||
                `${item.responsable?.name || ''} ${item.responsable?.lastName || ''}`.toLowerCase().includes(searchLower) ||
                item.responsable?.grade?.name.toLowerCase().includes(searchLower) ||
                item.location?.name.toLowerCase().includes(searchLower)

            return matchCategory && matchSub && matchStatus && matchSearch
        })
    }, [data, selectedCategory, selectedSubCategory, selectedStatus, search])


    const paginatedRows = useMemo(() => {
        const start = page * pageSize
        const end = start + pageSize
        return filteredRows.slice(start, end)
    }, [filteredRows, page, pageSize])

    const handleReset = () => {
        setSelectedCategory('')
        setSearch('')
        setSelectedSubCategory('')
        setSelectedStatus('')
    }

    const handleSave = (register: { date: string, time: string, description: string }) => {

        const registerData: RegisterType = {
            date: register.date,
            time: register.time,
            description: register.description,
            grade: data?.grade || null,
            name: data?.name || '',
            lastName: data?.lastName || '',
            code: data?.code || ''
        }
        const selectedActivos = data?.activos?.filter(row => selectedIds.includes(row._id || ''))
        setRegister(registerData)
        setActivos(selectedActivos || [])
        toogleNext()
    }

    const handleClose = () => {
        router.back()
    }

    return (
        <>
            {openNextPage ? <Confirmar activos={activos} register={register} toggle={toogleNext} close={handleClose} /> :
                (<Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ border: theme => `1px solid ${theme.palette.divider}`, backgroundColor: theme => theme.palette.primary.main }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        variant="contained"
                                        color="info"
                                        onClick={() => router.back()}
                                        startIcon={<Icon icon='ic:baseline-arrow-back-ios' />}
                                    >
                                        Atrás
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => setDrawOpen(true)}
                                        startIcon={<Icon icon='mdi:navigate-next' />}
                                        disabled={selectedIds.length === 0}
                                    >
                                        Devolver Activo
                                    </Button>
                                </Box>
                            </CardContent>
                            <Box sx={{ p: 5, pb: 0, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <FormControl>
                                    <InputLabel>Categoría</InputLabel>
                                    <Select
                                        label="Categoría"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <MenuItem value="">Todas</MenuItem>
                                        {categories.map(cat => (
                                            <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <InputLabel>Sub Categoría</InputLabel>
                                    <Select
                                        label="Sub Categoría"
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    >
                                        <MenuItem value="">Todas</MenuItem>
                                        {subcategories.map(sub => (
                                            <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        label="Estado"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        {statuses.map(st => (
                                            <MenuItem key={st._id} value={st.name}>{st.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Buscar"
                                    variant="outlined"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <Button variant="contained" onClick={handleReset}>Todos</Button>

                            </Box>

                            <Box sx={{ display: 'flex', p: 5, justifyContent: 'space-between' }}>
                                <Typography variant='subtitle2'>
                                    Lista de activos fijos prestados
                                </Typography>
                            </Box>
                            <DataGrid
                                autoHeight
                                rows={paginatedRows}
                                columns={columns}
                                getRowId={(row) => row._id!}
                                pagination
                                pageSize={pageSize}
                                rowsPerPageOptions={[10, 25, 50]}
                                rowCount={filteredRows.length}
                                page={page}
                                onPageChange={(newPage) => setPage(newPage)}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize)
                                    setPage(0)
                                }}
                                checkboxSelection
                                selectionModel={selectedIds.filter(id =>
                                    paginatedRows.some(row => row._id === id)
                                )}
                                onSelectionModelChange={(newSelection) => {
                                    const visibleIds = paginatedRows.map(row => row._id)
                                    const updatedSelection = [
                                        ...selectedIds.filter(id => !visibleIds.includes(id)),
                                        ...newSelection,
                                    ]

                                    setSelectedIds(updatedSelection as string[])
                                }}
                                sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                            />

                        </Card>
                    </Grid>
                    <AddDraw open={drawOpen} toggle={() => setDrawOpen(false)} title="Registro de devolución">
                        <AddDevolucion
                            toggle={() => setDrawOpen(false)}
                            handleSave={handleSave}
                        />
                    </AddDraw>
                </Grid>)}
        </>
    )
}

Devolver.acl = { action: 'read', subject: 'devolucion' }
Devolver.authGuard = true
export default Devolver
