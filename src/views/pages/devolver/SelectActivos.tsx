import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Fade,
    FadeProps,
    IconButton,
    Typography,
    Box,
    TextField,
    Card,
    CardContent,
    Grid,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Tooltip,
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { GradeType } from 'src/types/types'
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { instance } from 'src/configs/axios'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { DataGrid } from '@mui/x-data-grid'

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

interface LocationType {
    _id: string
    name: string
}

interface UserType {
    _id?: string
    grade: GradeType | null
    name: string
    lastName: string
    ci: string
    otherGrade?: string
}

interface ActivosType {
    _id?: string
    code: string,
    responsable: UserType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
}

interface CellType {
    row: ActivosType
}


interface Props {
    openpage: boolean
    toggle: () => void
    activos: ActivosType[]
    selectActivos: ActivosType[]
    setSelectActivos: React.Dispatch<React.SetStateAction<ActivosType[]>>;
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {

    return <Fade ref={ref} {...props} />
})

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3, 4),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}))

const SelectActivos = ({ openpage, toggle, setSelectActivos, activos, selectActivos }: Props) => {

    const [field, setField] = useState<string>('')
    const [category, setCategory] = useState<ContableType[]>([])
    const [subcategory, setSubCategory] = useState<SubCategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubcategory] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState<ActivosType[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [message, setMessage] = useState<string[]>([])

    const handleFilters = async (field: string) => {
        const result = activos?.filter(item => {
            const texto = JSON.stringify(item).toLowerCase();

            return texto.includes(field.toLowerCase())
        })
        const actAbilaibles = result.filter(a => !selectActivos.some(s => s._id === a._id))
        setData(actAbilaibles)
    }
    const fetchStatus = async () => {
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
    const fetchSubCategory = async () => {
        try {
            const response = await instance.get('/contables/subcategories')
            const data = response.data
            setSubCategory(data || [])
        } catch (error) {
            console.error('error al extraer la sub categoria', error)
        }
    }
    const fetchCategory = async () => {
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

    const handleCancel = () => {
        setSelectedIds([])
        toggle()
    }

    useEffect(() => {
        if (openpage) {
            fetchStatus()
            fetchCategory()
            fetchSubCategory()
            const actAbilaibles = activos.filter(a => !selectActivos.some(s => s._id === a._id))
            setMessage([])
            setData(actAbilaibles)
        }
    }, [openpage])


    const handleAddActivo = async () => {
        setMessage([])
        let err = false
        const act = activos.filter(a => selectedIds.includes(a._id || ''))
        const actAvalaibles = act.filter(a => {
            const exists = selectActivos.some(s => s._id === a._id)
            if (exists) {
                setMessage(prev => [...prev, `El Activo ya esta agregado, Codigo del activo: ${a.code}`])
                err = true;
            }

            return !exists;
        })
        if (!err) {
            setSelectActivos(prev => [...prev, ...(actAvalaibles || [])])
            setSelectedIds([])
            toggle()
        }
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
    ];

    return (
        <Dialog
            fullWidth
            open={openpage}
            maxWidth='lg'
            scroll='body'
            onClose={toggle}
            TransitionComponent={Transition}
        >
            <Header>
                <Typography variant='h6' color={theme => theme.palette.primary.contrastText}>
                    Agregar activos
                </Typography>
                <IconButton
                    size='small'
                    onClick={handleCancel}
                    sx={{ color: theme => theme.palette.primary.contrastText }}
                >
                    <Icon icon='mdi:close' fontSize={20} />
                </IconButton>
            </Header>

            <DialogContent>
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
                                </Box>
                            </Box>
                            {message.length > 0 && <Card sx={{ mt: 6, mb: 3, backgroundColor: theme => hexToRGBA(theme.palette.error.main, 0.7) }} >
                                <CardContent>
                                    {message.map((m, index) => (
                                        <Box sx={{ width: '100%' }} key={index}>
                                            <Typography variant='overline' sx={{ color: theme => theme.palette.error.contrastText, mb: 3 }}>{m}</Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>}
                            <Box sx={{ display: 'flex', p: 5, justifyContent: 'space-between' }}>
                                <Typography variant='subtitle2'>
                                    Lista de activos fijos prestados
                                </Typography>
                            </Box>
                            <DataGrid
                                autoHeight
                                rows={data}
                                columns={columns}
                                getRowId={(row: any) => row._id!}
                                pagination
                                pageSize={pageSize}
                                checkboxSelection
                                selectionModel={selectedIds.filter(id => data.some(row => row._id === id))}
                                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                rowsPerPageOptions={[10, 25, 50]}
                                onPageChange={(newPage) => setPageSize(newPage)}
                                onSelectionModelChange={(newSelection: any) => {
                                    const currentPageIds = data.map(row => row._id);
                                    const updatedSelection = [
                                        ...selectedIds.filter(id => !currentPageIds.includes(id)),
                                        ...newSelection,
                                    ];
                                    setSelectedIds(updatedSelection)
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
                </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={handleAddActivo} variant='contained' color='success' disabled={selectedIds.length > 0 ? false : true}>
                    Agregar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SelectActivos
