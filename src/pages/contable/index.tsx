import { Box, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import Icon from 'src/@core/components/icon';
import AddDraw from "src/components/draw";
import { AppDispatch, RootState } from "src/store";
import Swal from 'sweetalert2'
import { instance } from "src/configs/axios";
import { deleteContable, fetchData } from "src/store/contable";
import { DataGrid } from "@mui/x-data-grid";
import AddConatble from "src/views/pages/contable/Register";
import SubCategory from "src/views/pages/contable/SubCategory";
import Can from "src/layouts/components/acl/Can";

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id?: string
    name: string,
    util: number,
    subcategory: SubCategoryType[]
    description?: string
}

interface CellType {
    row: ContableType
}

const Contable = () => {

    const [field, setField] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [drawOpen, setDrawOpen] = useState<boolean>(false)
    const [mode, setMode] = useState<'create' | 'update'>('create')
    const [id, setId] = useState<string>('')
    const [category, setCategory] = useState<ContableType[]>([])
    const [subcategory, setSubCategory] = useState<SubCategory[]>([])
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [openSub, setOpenSub] = useState<boolean>(false)

    const toggleDrawer = () => setDrawOpen(!drawOpen)
    const toggleSub = () => setOpenSub(!openSub)

    const store = useSelector((state: RootState) => state.contable)
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
                const data = response.data.result
                setCategory(data || [])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [mode, store])

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
    }, [mode, store])

    const handleFilters = (value: string) => {
        dispatch(fetchData({ field: value, skip: page * pageSize, limit: pageSize }))
    }

    const handleCreate = () => {
        setId('')
        setMode('create')
        toggleDrawer()
    }

    const RowOptions = ({ contable }: { contable: ContableType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const theme = useTheme()

        const handleEdit = () => {
            setId(contable._id || '')
            setMode('update')
            toggleDrawer()
        }

        const handleDelete = async () => {

            const confirme = await Swal.fire({
                title: '¿Estas seguro de eliminar?',
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: theme.palette.info.main,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: theme.palette.error.main,
                confirmButtonText: 'Eliminar',
            }).then(async (result) => { return result.isConfirmed });
            if (confirme) {
                dispatch(deleteContable({ id: contable._id || '', filters: { field: '', skip: page * pageSize, limit: pageSize } }))
            }
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                <Can I="update" a="contable">
                    <IconButton size='small' onClick={handleEdit}>
                        <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                    </IconButton>
                </Can>
                <Can I="delete" a="contable">
                    <IconButton size='small' onClick={handleDelete}>
                        <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                    </IconButton>
                </Can>
            </Box>
        )
    }

    const columns = [
        {
            flex: 0.2,
            minWidth: 90,
            field: 'name',
            headerName: 'Categoría',
            renderCell: ({ row }: CellType) => {

                return (
                    <Typography variant='body2'>{row.name}</Typography>
                )
            }
        },
        {
            flex: 0.15,
            minWidth: 90,
            field: 'util',
            headerName: 'Vida útil',
            renderCell: ({ row }: CellType) => {

                return (
                    <Typography variant='body2'>{row.util}</Typography>
                )
            }
        },
        {
            flex: 0.290,
            minWidth: 290,
            field: 'description',
            headerName: 'Descripción',
            renderCell: ({ row }: CellType) => {

                return (
                    <Typography variant='body2'>{row.description}</Typography>
                )
            }
        },
        {
            flex: 0.15,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {

                return (<RowOptions contable={row} />)
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
                                    value={selectedSubcategory}
                                    disabled={subcategory.length == 0}
                                    onChange={(e) => {
                                        const selected = e.target.value
                                        setSelectedSubcategory(selected)
                                        handleFilters(selected)
                                    }}
                                >
                                    {subcategory.map((st, index) => (
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
                                Grupo Contable
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', p: 5, justifyContent: 'space-between' }}>
                        <Typography variant='subtitle2'>
                            Lista de Grupos Contables
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
                            toggleSub()
                        }}
                        getRowHeight={() => 'auto'}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': { borderRadius: 0 },
                            '& .MuiDataGrid-cell': {
                                alignItems: 'start',
                                py: 1,
                            },
                        }}
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }
                        }
                    />
                </Card>
            </Grid>
            <Can I={mode} a="contable">
                <AddDraw open={drawOpen} toggle={toggleDrawer} title={mode === 'create' ? 'Registro del grupo contable' : 'Editar grupo contable'}>
                    <AddConatble
                        toggle={toggleDrawer}
                        open={drawOpen}
                        page={page}
                        pageSize={pageSize}
                        id={id}
                        mode={mode}
                    />
                </AddDraw>
            </Can>
            <SubCategory open={openSub} toggle={toggleSub} id={id} />
        </Grid>
    )
}

Contable.acl = {
    action: 'read',
    subject: 'contable'
}

Contable.authGuard = true;

export default Contable
