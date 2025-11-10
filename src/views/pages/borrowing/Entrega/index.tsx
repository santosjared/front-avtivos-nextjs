import { Box, Button, Card, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect } from "react"
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { setDrawOpen, handleFilters, setField, fetchData, setPageSize, setPage, setSelectedIds, fetchCategories, fectSubcategories, fetchStatus, resetBorrowing } from "src/store/borrowing";
import { useDispatch } from "react-redux";
import AddBorrowing from "./Register";
import { resetBorrowingRegister } from "src/store/borrowing/register";

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
    setId: (id: string) => void
    mode: 'create' | 'edit'
    id: string
}

const Borrowing = ({ setStep, setRegister, setActivos, mode = 'create', id, setId }: Props) => {

    const dispatch = useDispatch<AppDispatch>()
    const {
        drawOpen,
        data,
        total,
        category,
        field,
        page,
        pageSize,
        selectedCategory,
        selectedIds,
        selectedStatus,
        selectedSubCategory,
        status,
        subcategory,
    } = useSelector((state: RootState) => state.borrowing)

    const toggleDrawer = () => dispatch(setDrawOpen(!drawOpen));

    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize, id }))
    }, [page, pageSize])

    useEffect(() => {
        dispatch(fetchCategories())
        dispatch(fectSubcategories())
        dispatch(fetchStatus())
    }, [])

    const handleSave = (entrega: RegisterType) => {
        const selectedActivos = data.filter(row => selectedIds.includes(row._id || ''))
        setRegister(entrega)
        setActivos(selectedActivos)
        setStep('confirmed')
    }

    const handleBack = () => {
        dispatch(resetBorrowing())
        dispatch(resetBorrowingRegister())
        setStep('borrowing')
        setId('')
    }
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardContent sx={{ border: theme => `1px solid ${theme.palette.divider}`, backgroundColor: theme => theme.palette.primary.main }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={handleBack}
                                startIcon={<Icon icon='ic:baseline-arrow-back-ios' />}
                            >
                                Atras
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={toggleDrawer}
                                startIcon={<Icon icon='mdi:navigate-next' />}
                                disabled={selectedIds.length === 0}
                            >
                                {mode === 'create' ? 'Realizar entrega' : 'Editar entrega'}
                            </Button>
                        </Box>
                    </CardContent>
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
                                        dispatch(handleFilters({
                                            option: 'category',
                                            filters: {
                                                field: selected,
                                                skip: page * pageSize,
                                                limit: pageSize,
                                                id
                                            }
                                        }
                                        ))
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
                                        dispatch(handleFilters({
                                            option: 'subcategory',
                                            filters: {
                                                field: selected,
                                                skip: page * pageSize,
                                                limit: pageSize,
                                                id
                                            }
                                        }
                                        ))
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
                                        dispatch(handleFilters({
                                            option: 'status',
                                            filters: {
                                                field: selected,
                                                skip: page * pageSize,
                                                limit: pageSize,
                                                id
                                            }
                                        }
                                        ))
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
                                    onChange={(e) => dispatch(setField(e.target.value))}
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
                                    onClick={() => dispatch(fetchData({
                                        field: field || selectedCategory || selectedSubCategory || selectedStatus,
                                        skip: page * pageSize,
                                        limit: pageSize,
                                        id
                                    }
                                    ))}
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
                                    onClick={() => {
                                        dispatch(fetchData({
                                            field: '',
                                            skip: page * pageSize,
                                            limit: pageSize,
                                            id
                                        }
                                        ))
                                    }}
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
                        rows={data}
                        columns={columns}
                        getRowId={(row: any) => row._id!}
                        pagination
                        pageSize={pageSize}
                        checkboxSelection
                        selectionModel={selectedIds.filter(id => data.some(row => row._id === id))}
                        onPageSizeChange={(newPageSize) => dispatch(setPageSize(newPageSize))}
                        rowsPerPageOptions={[10, 25, 50]}
                        rowCount={total}
                        paginationMode="server"
                        onPageChange={(newPage) => dispatch(setPage(newPage))}
                        onSelectionModelChange={(newSelection: any) => {
                            const currentPageIds = data.map(row => row._id);
                            const updatedSelection = [
                                ...selectedIds.filter(id => !currentPageIds.includes(id)),
                                ...newSelection,
                            ];
                            dispatch(setSelectedIds(updatedSelection));
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
                <AddBorrowing toggle={toggleDrawer} handleSave={handleSave} mode={mode} />
            </AddDraw>
        </Grid>
    )
}

export default Borrowing
