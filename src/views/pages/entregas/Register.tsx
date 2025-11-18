import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, FormHelperText, Grid, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon';
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { addEntrega, updateEntrega } from "src/store/entrega";
import { useSelector } from "react-redux";
import AddDraw from "src/components/draw";
import AddInfo from "./AddInfo";
import AddUser from "./AddUser";
import { instance } from "src/configs/axios";
import AddItem from "./AddItem";
import SelectActivos from "./SelectActivos";
import { PDFEntrega } from "src/utils/PDF-entrega";

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

interface UserType {
    _id?: string
    grade: GradeType | null
    name: string
    ci: string
    lastName: string
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

interface InfoEntegaType {
    code: string
    date: string
    time: string
    user_en: UserType | null
    user_rec: UserType | null
    location: LocationType | null
    description: string
    otherLocation: string
}

interface ErrorsType {
    code: string
    date: string
    time: string
    user_en: string
    user_rec: string
    location: string
}

interface CellType {
    row: ActivosType
}

interface CellType {
    row: ActivosType
}

interface Props {
    toggle: () => void
    open: boolean
    limit: number
    page: number
    mode: 'create' | 'update'
    id?: string
}

const Register = ({ page, limit, mode = 'create', id, open, toggle }: Props) => {

    const [pageSize, setPageSize] = useState(10);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [entrega, setEntrega] = useState<InfoEntegaType | null>(null)
    const [selectActivos, setSelectActivos] = useState<ActivosType[]>([])
    const [openInfo, setOpenInfo] = useState<boolean>(false)
    const [openAdduser, setOpenAddUser] = useState<boolean>(false)
    const [openAddItem, setOpenAddItem] = useState<boolean>(false)
    const [openSelectActivos, seOpenSelectActivos] = useState(false)
    const [errors, setErros] = useState<ErrorsType | null>(null)
    const [errorAc, setErrorAc] = useState<string | null>(null)

    const theme = useTheme()

    const toggleInfo = () => setOpenInfo(!openInfo)
    const toggleAdduser = () => setOpenAddUser(!openAdduser)
    const toggleAddItem = () => setOpenAddItem(!openAddItem)
    const toggleSelectActivos = () => seOpenSelectActivos(!openSelectActivos)

    const { user } = useSelector((state: RootState) => state.auth)

    const dispatch = useDispatch<AppDispatch>()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = e.target.files[0];

            if (selected.type !== 'application/pdf') {
                setFileError('Solo se permiten archivos PDF');
                setFile(null);
            } else {
                setFile(selected);
                setFileError(null);
            }
        }
    };

    const handleUploadClick = () => {
        document.getElementById('pdf-upload')?.click();
    };

    const handleOpenPdf = () => {
        if (file) {
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
        }
    };

    const handleSave = () => {
        let error = false
        if (!file) {
            setFileError('Debe adjuntar un documento PDF antes de confirmar.');
            error = true;
        }
        if (!entrega?.code) {
            setErros({ ...errors!, code: 'El codigo es obligatorio' });
            error = true;
        }
        if (!entrega?.date) {
            setErros({ ...errors!, date: 'La fecha de entrega es obligatorio' });
            error = true;
        }
        if (!entrega?.time) {
            setErros({ ...errors!, time: 'La hora de entrega es obligatorio' });
            error = true;
        }
        if (!entrega?.user_en) {
            setErros({ ...errors!, user_en: 'La informacion del usuario que entrega es obligatorio' });
            error = true;
        }
        if (!entrega?.user_rec) {
            setErros({ ...errors!, user_rec: 'El usuario que recibe es obligatorio' });
            error = true;
        }
        if (!entrega?.location) {
            setErros({ ...errors!, location: 'El lugar de donde se entrega el activo es obligatorio' });
            error = true;
        }
        if (selectActivos.length === 0) {
            setErrorAc('Selecione un activo para entregar');
            error = true;
        }

        if (error) {
            return;
        }

        const formData = new FormData();

        formData.append('code', entrega?.code ?? '');
        formData.append('date', entrega?.date ?? '');
        formData.append('time', entrega?.time ?? '');
        formData.append('user_rec', entrega?.user_rec?._id ?? '');
        formData.append('location', entrega?.location?._id ?? '');
        formData.append('user_en', entrega?.user_en?._id || '')
        formData.append('description', entrega?.description?.trim() ?? '');

        selectActivos.forEach(activo => {
            if (activo._id) formData.append('activos[]', activo._id);
        });
        if (file) {
            formData.append('document', file);
        }


        if (entrega?.otherLocation?.trim()) {
            formData.append('otherLocation', entrega?.otherLocation?.trim());
        }


        if (mode === 'create') {
            dispatch(addEntrega({ data: formData, filters: { skip: page * limit, limit } }))
                .unwrap()
                .then(() => {
                    setFile(null);
                    setEntrega(null);
                    setSelectActivos([]);
                    toggle();
                });
        } else {
            dispatch(updateEntrega({ id: id || '', data: formData, filters: { skip: page * limit, limit } }))
                .unwrap()
                .then(() => {
                    setFile(null);
                    setEntrega(null);
                    setSelectActivos([]);
                    toggle();
                });
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const res = await instance.put(`/activos/enable/${id}`)
            if (res.data?.ok) {
                setSelectActivos(prev => prev.filter(item => item._id !== id));
            }
        } catch (e) {
            console.log(e)
        }

    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await instance.get(`/users/${user?._id}`)
                setEntrega(prev => ({
                    ...prev!,
                    user_en: res.data
                }));
            } catch (e) {
                console.log(e)
            }
        }
        if (open) {
            fetchUser()
        }
    }, [open])

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await instance.get(`/entregas/code`)
                setEntrega(prev => ({
                    ...prev!,
                    code: res.data
                }));
            } catch (e) {
                console.log(e)
            }
        }
        if (open && mode === 'create') {
            fetchCode()
        }
    }, [open])

    useEffect(() => {
        const fetchEntrega = async () => {
            try {
                const res = await instance.get(`/entregas/${id}`)
                const { activos, ...rest } = res.data
                setEntrega(rest || null);
                setSelectActivos(activos || [])
            } catch (e) {
                console.log(e)
            }
        }
        if (open && id && mode === 'update') {
            fetchEntrega()
        }
    }, [open, id, mode])

    const handleCancel = () => {
        setFile(null);
        setEntrega(null);
        toggle();
    }

    useEffect(() => {
        if (selectActivos.length > 0) {
            setErrorAc(null)
        }
        if (entrega?.code) {
            setErros(null);
        }
        if (entrega?.date) {
            setErros(null);
        }
        if (!entrega?.time) {
            setErros(null);
        }
        if (!entrega?.user_en) {
            setErros(null);
        }
        if (!entrega?.user_rec) {
            setErros(null);
        }
        if (!entrega?.location) {
            setErros(null);
        }
    }, [entrega, selectActivos])

    const columns = [
        {
            field: 'acctions', headerName: 'Acciones', minWidth: 80, flex: 0.8,
            renderCell: ({ row }: CellType) => (
                <IconButton size='small' onClick={() => handleDelete(row._id || '')}>
                    <Icon icon='ic:outline-delete' fontSize={20} color={theme.palette.error.main} />
                </IconButton>
            )
        },
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
    ]

    return (
        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, pr: 2 }}>
                <Typography variant="h5" sx={{ pl: 2, pt: 2, color: theme.palette.text.secondary }}>AGREGAR ENTREGA DE ACTIVOS</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2 }}>
                    <IconButton size='small' color="secondary" onClick={toggle}>
                        <Icon icon='mdi:close' fontSize={20} />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box sx={{ width: '100%', p: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ backgroundColor: errors || fileError ? theme => hexToRGBA(theme.palette.primary.main, 0.1) : null }}>
                            <CardHeader
                                title="DETALLES DE LA ENTREGA"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '& .MuiCardHeader-title': {
                                        color: theme.palette.primary.contrastText,
                                    },
                                }}
                            />

                            <CardContent>
                                <Typography variant="overline"><strong>Código de la entrega</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Código:</strong> {entrega?.code || ''}
                                </Typography>
                                {errors?.code && <FormHelperText sx={{ color: 'error.main' }}>{errors.code}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que recibe</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {entrega?.user_rec?.otherGrade || entrega?.user_rec?.grade?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {entrega?.user_rec?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {entrega?.user_rec?.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>C.I:</strong> {entrega?.user_rec?.ci}
                                </Typography>
                                {errors?.user_rec && <FormHelperText sx={{ color: 'error.main' }}>{errors.user_rec}</FormHelperText>}
                                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                                    <Button variant="contained" color="success" onClick={toggleAdduser}>{entrega ? 'Editar' : 'Agregar'}</Button>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que entrega</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {entrega?.user_en?.grade?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {entrega?.user_en?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {entrega?.user_en?.lastName || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>C.I.:</strong> {entrega?.user_en?.ci || ''}
                                </Typography>
                                {errors?.user_en && <FormHelperText sx={{ color: 'error.main' }}>{errors.user_en}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Información de la antrega de activo</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Fecha de entrega:</strong>{' '}
                                    {entrega?.date ? (() => {
                                        const date = new Date(entrega?.date)
                                        const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                                        return formatted
                                    })() : null}
                                </Typography>
                                {errors?.date && <FormHelperText sx={{ color: 'error.main' }}>{errors.date}</FormHelperText>}
                                <Typography variant="body2">
                                    <strong>Hora de entrega:</strong> {entrega?.time}
                                </Typography>
                                {errors?.time && <FormHelperText sx={{ color: 'error.main' }}>{errors.time}</FormHelperText>}
                                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                                    <Button variant="contained" color="success" onClick={toggleInfo}>{entrega?.location ? 'Editar' : 'Agregar'}</Button>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Lugar donde se entrega el activo</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>{entrega?.otherLocation || entrega?.location?.name}</Typography>
                                {errors?.location && <FormHelperText sx={{ color: 'error.main' }}>{errors.location}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Descripción</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>{entrega?.description}</Typography>
                                <Divider />
                                <Typography variant="overline"><strong>Acciones</strong></Typography>
                                {file && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Box
                                            onClick={handleOpenPdf}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                width: '100%',
                                                '&:hover': { backgroundColor: hexToRGBA(theme.palette.grey[400], 0.4) }
                                            }}
                                        >
                                            <Icon icon='mdi:file-pdf-box' fontSize={25} style={{ color: theme.palette.error.main }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant='body2'>{file.name}</Typography>
                                                <Typography variant='caption'>{(file.size / 1024).toFixed(2)} KB</Typography>
                                            </Box>

                                        </Box>
                                        <IconButton onClick={() => setFile(null)}>
                                            <Icon icon='ic:outline-close' />
                                        </IconButton>
                                    </Box>
                                )}
                                {fileError && <FormHelperText sx={{ color: 'error.main' }}>{fileError}</FormHelperText>}
                                <CardActions >
                                    <input
                                        type="file"
                                        id="pdf-upload"
                                        accept="application/pdf"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<Icon icon='mdi:upload' />}
                                        onClick={handleUploadClick}
                                    >
                                        Subir Documento
                                    </Button>
                                    <Button variant="contained" onClick={() => PDFEntrega(entrega, selectActivos)} startIcon={<Icon icon='mdi:printer' />}>
                                        Imprimir Documento
                                    </Button>
                                </CardActions>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Card sx={{ backgroundColor: errorAc ? theme => hexToRGBA(theme.palette.primary.main, 0.1) : null }}>
                            <CardHeader
                                title="ACTIVOS A ENTREGAR"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '& .MuiCardHeader-title': {
                                        color: theme.palette.primary.contrastText,
                                    },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                                <Button variant="contained" color="success" onClick={toggleAddItem}>Agregar</Button>
                                <Button variant="contained" color="success" onClick={toggleSelectActivos}>Selecionar</Button>
                            </Box>
                            {errorAc && <FormHelperText sx={{ color: 'error.main' }}>{errorAc}</FormHelperText>}
                            <DataGrid
                                autoHeight
                                rows={selectActivos}
                                columns={columns}
                                getRowId={(row: any) => row._id}
                                pagination
                                pageSize={pageSize}
                                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                rowsPerPageOptions={[10, 25, 50]}
                                disableSelectionOnClick
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
                                }}
                            />
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 4 }}>
                <Button
                    size='large'
                    variant='contained'
                    color='error'
                    onClick={handleCancel}
                    startIcon={<Icon icon='mdi:cancel-circle' />}
                >
                    Cancelar
                </Button>
                <Button
                    size='large'
                    onClick={handleSave}
                    variant='contained'
                    color="success"
                    startIcon={<Icon icon='mdi:content-save' />}
                >
                    Guardar
                </Button>
            </Box>
            <AddDraw
                open={openInfo}
                toggle={toggleInfo}
                title={entrega?.location ?
                    'Editar información de la entrega' :
                    'Agregar información de la entrega'}>
                <AddInfo entrega={entrega} open={openInfo} setEntrega={setEntrega} toggle={toggleInfo} />
            </AddDraw>
            <AddDraw
                open={openAdduser}
                toggle={toggleAdduser}
                title={entrega?.user_rec ?
                    'Editar usuario' :
                    'Agregar información de la entrega'}>
                <AddUser entrega={entrega} open={openAdduser} setEntrega={setEntrega} toggle={toggleAdduser} />
            </AddDraw>
            <AddItem open={openAddItem} toggle={toggleAddItem} setSelectActivos={setSelectActivos} />
            <SelectActivos openpage={openSelectActivos} toggle={toggleSelectActivos} setSelectActivos={setSelectActivos} />
        </Box>
    )
}

export default Register
