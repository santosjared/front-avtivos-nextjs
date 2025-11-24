import { Box, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import { deleteActivos, fetchData } from "src/store/activos";
import baseUrl from 'src/configs/environment'
import Swal from 'sweetalert2'
import CustomChip from 'src/@core/components/mui/chip'
import { instance } from "src/configs/axios";
import AddActivos from "src/views/pages/activos/Register";
import Can from "src/layouts/components/acl/Can";
import Trazabildad from "src/views/pages/activos/Trazabildad";

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
    name: string
    lastName: string
}

interface ActivosType {
    _id?: string
    code: string,
    name: string,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    responsable: ResponsableType,
    grade: GradeType
    location: LocationType,
    status: StatusType
    category: ContableType
    subcategory: SubCategoryType
    description: string
}


interface CellType {
    row: ActivosType
}

const Activos = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'create' | 'update'>('create')
    const [id, setId] = useState<string>('')
    const [category, setCategory] = useState<ContableType[]>([])
    const [subcategory, setSubCategory] = useState<SubCategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubcategory] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState('');
    const [openTrazabildad, setOpenTrazabilidad] = useState<boolean>(false)

    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const toggleTrazabildad = () => setOpenTrazabilidad(!openTrazabildad)

    const store = useSelector((state: RootState) => state.activos)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/contables', {
                    params: { skip: 0, limit: 50 }
                })
                const data = response.data
                setCategory(data.result || [])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
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
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status', {
                    params: { skip: 0, limit: 50 }
                })
                const data = response.data
                setStatus(data.result || [])
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
        setId('')
        setMode('create')
        toggleDrawer()
    }

    const RowOptions = ({ activo }: { activo: ActivosType }) => {

        const dispatch = useDispatch<AppDispatch>()

        const theme = useTheme()

        const handleEdit = () => {
            setId(activo?._id ?? '')
            setMode('update')
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
                dispatch(deleteActivos({ id: activo._id || '', filters: { field: '', skip: page * pageSize, limit: pageSize } }))
            }
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Can I="update" a="activos">
                    <IconButton size='small' onClick={handleEdit}>
                        <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                    </IconButton>
                </Can>
                <Can I="delete" a="activos">
                    <IconButton size='small' onClick={handleDelete}>
                        <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                    </IconButton>
                </Can>

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
                const text = `${row.grade?.name || ''} ${row.responsable?.name || ''} ${row.responsable?.lastName || ''}`

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
                                    {category?.map?.((cat, index) => (
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
                                    {status?.map?.((st, index) => (
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
                            <Can I="create" a="activos">
                                <Button
                                    onClick={handleCreate}
                                    variant="contained"
                                    startIcon={<Icon icon='mdi:add' />}
                                    sx={{ p: 3.5 }}
                                    color="success"
                                >
                                    Nuevo Activo
                                </Button>
                            </Can>
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
                        onCellClick={(params) => {
                            if (params.field === 'actions') {
                                return
                            }
                            setId(params.row._id)
                            toggleTrazabildad()
                        }}
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
            <Can I={mode} a="activos">
                <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del activo fijo' : 'Editar activo fijo'}>
                    <AddActivos
                        toggle={toggleDrawer}
                        open={drawOpen}
                        page={page}
                        pageSize={pageSize}
                        id={id}
                        mode={mode}
                    />
                </AddDraw>
            </Can>
            <Trazabildad
                id={id}
                open={openTrazabildad}
                toggle={toggleTrazabildad}
            />
        </Grid>
    )
}

Activos.acl = {
    action: 'read',
    subject: 'activos'
}

Activos.authGuard = true;

export default Activos
