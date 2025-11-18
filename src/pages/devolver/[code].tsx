import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, FormHelperText, Grid, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon';
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import { useSelector } from "react-redux";
import AddDraw from "src/components/draw";
import { instance } from "src/configs/axios";
import AddInfo from "src/views/pages/devolver/AddInfo";
import AddItem from "src/views/pages/devolver/AddItem";
import SelectActivos from "src/views/pages/devolver/SelectActivos";
import { useRouter } from "next/router";
import { PDFDevuelto } from "src/utils/PDF-devuelto";
import { addDevolucion, updateDevolucion } from "src/store/devolucion";
import Swal from 'sweetalert2'
import { setState } from "src/store/devolver";
import Can from "src/layouts/components/acl/Can";


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

interface InfoDevolverType {
    _id?: string
    code: string
    date: string
    time: string
    user_dev: UserType | null
    user_rec: UserType | null
    description: string
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

const Devolver = () => {

    const [pageSize, setPageSize] = useState(10);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [devolucion, setDevolucion] = useState<InfoDevolverType | null>(null)
    const [selectActivos, setSelectActivos] = useState<ActivosType[]>([])
    const [openInfo, setOpenInfo] = useState<boolean>(false)
    const [openAddItem, setOpenAddItem] = useState<boolean>(false)
    const [openSelectActivos, seOpenSelectActivos] = useState(false)
    const [errors, setErros] = useState<ErrorsType | null>(null)
    const [errorAc, setErrorAc] = useState<string | null>(null)
    const [activos, setActivos] = useState<ActivosType[]>([])

    const theme = useTheme()

    const toggleInfo = () => setOpenInfo(!openInfo)
    const toggleAddItem = () => setOpenAddItem(!openAddItem)
    const toggleSelectActivos = () => seOpenSelectActivos(!openSelectActivos)

    const { user } = useSelector((state: RootState) => state.auth)
    const { mode } = useSelector((state: RootState) => state.devolver)

    const router = useRouter()

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
        let error = false;
        const newErrors: any = {};

        if (!file) {
            setFileError('Debe adjuntar un documento PDF antes de confirmar.');
            error = true;
        }
        if (!devolucion?.code) newErrors.code = 'El código es obligatorio';
        if (!devolucion?.date) newErrors.date = 'La fecha de entrega es obligatoria';
        if (!devolucion?.time) newErrors.time = 'La hora de entrega es obligatoria';
        if (!devolucion?.user_dev) newErrors.user_dev = 'El usuario que entrega es obligatorio';
        if (!devolucion?.user_rec) newErrors.user_rec = 'El usuario que recibe es obligatorio';
        if (selectActivos.length === 0) {
            setErrorAc('Seleccione un activo para entregar');
            error = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErros({ ...errors, ...newErrors });
            error = true;
        }

        if (error) return;

        const formData = new FormData();
        formData.append('code', devolucion?.code ?? '');
        formData.append('date', devolucion?.date ?? '');
        formData.append('time', devolucion?.time ?? '');
        formData.append('user_rec', devolucion?.user_rec?._id ?? '');
        formData.append('user_dev', devolucion?.user_dev?._id ?? '');
        formData.append('description', devolucion?.description?.trim() ?? '');
        selectActivos.forEach(activo => activo._id && formData.append('activos[]', activo._id));
        if (file) formData.append('document', file);

        if (mode === 'update' && devolucion?._id) {
            dispatch(updateDevolucion({ data: formData, id: devolucion._id }))
                .unwrap()
                .then(() => {
                    limpiar();
                    router.back();
                })
            return;
        }

        dispatch(addDevolucion({ data: formData }))
            .unwrap()
            .then(() => {
                limpiar();
                router.back();
            })
    };

    const limpiar = () => {
        setFile(null);
        setDevolucion(null);
        setSelectActivos([]);
    };

    const handleDelete = async (id: string) => {
        setSelectActivos(prev => prev.filter(item => item._id !== id));
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await instance.get(`/users/${user?._id}`)
                setDevolucion(prev => ({
                    ...prev!,
                    user_rec: res.data
                }));
            } catch (e) {
                console.log(e)
            }
        }
        if (router.query.code) {
            fetchUser()
        }
    }, [router.query.code])

    useEffect(() => {
        const fetchEntrega = async () => {
            try {
                const res = await instance.get(`/entregas/${router.query.code}`)
                const dev = await instance.get(`/devolucion/${router.query.code}`)


                const { activos, user_rec, code } = res.data;
                const devolucionBase = {
                    user_dev: user_rec,
                    code
                };

                if (dev.data && mode !== 'update') {
                    Swal.fire({
                        title: "Registro existente",
                        text: "Esta entrega ya fue registrada como devuelta. ¿Desea editar la información?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: theme.palette.success.main,
                        cancelButtonColor: theme.palette.error.main,
                        confirmButtonText: "Sí, editar"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            dispatch(setState('update'));
                            setDevolucion(prev => ({
                                ...prev!, ...devolucionBase,
                                date: dev.data.date,
                                time: dev.data.time,
                                _id: dev.data._id,
                                description: dev.data.description
                            }));
                            setActivos(activos || []);
                            setSelectActivos(dev.data?.activos || []);
                            return;
                        }
                        router.back()

                    });
                    return;
                }

                if (mode === 'update') {
                    setSelectActivos(dev.data?.activos || []);
                    setDevolucion(prev => ({
                        ...prev!, ...devolucionBase,
                        date: dev.data.date,
                        time: dev.data.time,
                        _id: dev.data._id,
                        description: dev.data.description
                    }));
                    setActivos(activos || []);
                    return;
                }

                setDevolucion(prev => ({ ...prev!, ...devolucionBase }));
                setActivos(activos || []);

            } catch (e) {
                console.log(e)
            }
        }
        if (router.query.code) {
            fetchEntrega()
        }
    }, [router.query.code])

    const handleCancel = () => {
        setFile(null);
        setDevolucion(null);
        router.back();
    }

    useEffect(() => {
        if (selectActivos.length > 0) {
            setErrorAc(null)
        }
        if (devolucion?.code) {
            setErros(null);
        }
        if (devolucion?.date) {
            setErros(null);
        }
        if (!devolucion?.time) {
            setErros(null);
        }
        if (!devolucion?.user_rec) {
            setErros(null);
        }
        if (!devolucion?.user_dev) {
            setErros(null);
        }
    }, [devolucion, selectActivos])

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
                <Typography variant="h5" sx={{ pl: 2, pt: 2, color: theme.palette.text.secondary }}>AGREGAR DEVOLUCION DE ACTIVOS</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2 }}>
                    <IconButton size='small' color="secondary" onClick={() => router.back()}>
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
                                title="DETALLES DE DEVOLUCION"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '& .MuiCardHeader-title': {
                                        color: theme.palette.primary.contrastText,
                                    },
                                }}
                            />

                            <CardContent>
                                <Typography variant="overline"><strong>Código de la devolución</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Código:</strong> {devolucion?.code || ''}
                                </Typography>
                                {errors?.code && <FormHelperText sx={{ color: 'error.main' }}>{errors.code}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que recibe</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {devolucion?.user_rec?.grade?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {devolucion?.user_rec?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {devolucion?.user_rec?.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>C.I:</strong> {devolucion?.user_rec?.ci}
                                </Typography>
                                {errors?.user_rec && <FormHelperText sx={{ color: 'error.main' }}>{errors.user_rec}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que devuelve</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {devolucion?.user_dev?.grade?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {devolucion?.user_dev?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {devolucion?.user_dev?.lastName || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>C.I.:</strong> {devolucion?.user_dev?.ci || ''}
                                </Typography>
                                {errors?.user_en && <FormHelperText sx={{ color: 'error.main' }}>{errors.user_en}</FormHelperText>}
                                <Divider />
                                <Typography variant="overline"><strong>Información de la devolución de activo</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Fecha de entrega:</strong>{' '}
                                    {devolucion?.date ? (() => {
                                        const date = new Date(devolucion?.date)
                                        const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                                        return formatted
                                    })() : null}
                                </Typography>
                                {errors?.date && <FormHelperText sx={{ color: 'error.main' }}>{errors.date}</FormHelperText>}
                                <Typography variant="body2">
                                    <strong>Hora de entrega:</strong> {devolucion?.time}
                                </Typography>
                                {errors?.time && <FormHelperText sx={{ color: 'error.main' }}>{errors.time}</FormHelperText>}
                                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                                    <Button variant="contained" color="success" onClick={toggleInfo}>{devolucion?.date ? 'Editar' : 'Agregar'}</Button>
                                </Box>
                                <Divider />
                                <Typography variant="overline"><strong>Descripción</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>{devolucion?.description}</Typography>
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
                                    <Can I="upload" a="devolucion">
                                        <Button
                                            variant="outlined"
                                            startIcon={<Icon icon='mdi:upload' />}
                                            onClick={handleUploadClick}
                                        >
                                            Subir Documento
                                        </Button>
                                    </Can>
                                    <Can I="print" a="devolucion">
                                        <Button variant="contained" onClick={() => PDFDevuelto(devolucion, selectActivos)} startIcon={<Icon icon='mdi:printer' />}>
                                            Imprimir Documento
                                        </Button>
                                    </Can>
                                </CardActions>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Card sx={{ backgroundColor: errorAc ? theme => hexToRGBA(theme.palette.primary.main, 0.1) : null }}>
                            <CardHeader
                                title="ACTIVOS A DEVOLVER"
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
                <Can I={mode} a="devolucion">
                    <Button
                        size='large'
                        onClick={handleSave}
                        variant='contained'
                        color="success"
                        startIcon={<Icon icon='mdi:content-save' />}
                    >
                        {mode === 'create' ? 'Guardar' : 'Actualizar'}
                    </Button>
                </Can>
            </Box>
            <AddDraw
                open={openInfo}
                toggle={toggleInfo}
                title={devolucion?.date ?
                    'Editar información de la devolución' :
                    'Agregar información de la devolución'}>
                <AddInfo devolucion={devolucion} open={openInfo} setDevolucion={setDevolucion} toggle={toggleInfo} />
            </AddDraw>
            <AddItem open={openAddItem} toggle={toggleAddItem} setSelectActivos={setSelectActivos} activos={activos} selectActivos={selectActivos} />
            <SelectActivos openpage={openSelectActivos} toggle={toggleSelectActivos} setSelectActivos={setSelectActivos} activos={activos} selectActivos={selectActivos} />
        </Box>
    )
}

Devolver.acl = {
    action: 'create',
    subject: 'devolucion'
}

Devolver.authGuard = true;

export default Devolver


