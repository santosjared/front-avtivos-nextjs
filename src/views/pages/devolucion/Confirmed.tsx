import { Box, Button, Card, CardActions, CardContent, Divider, FormHelperText, Grid, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useState } from "react"
import Icon from 'src/@core/components/icon';
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { RootState } from "src/store";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2'
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
    code: string
    description: string
}

interface CellType {
    row: ActivosType
}

interface CellType {
    row: ActivosType
}

interface Props {
    activos: ActivosType[]
    register: RegisterType | null
    toggle: () => void
    close: () => void
}

const Confirmar = ({ activos, register, toggle, close }: Props) => {

    const [pageSize, setPageSize] = useState(10);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const theme = useTheme()

    const { user } = useSelector((state: RootState) => state.auth)

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

    const handleSave = async () => {
        if (!file) {
            setFileError('Debe adjuntar un documento PDF antes de confirmar.');
            return;
        }

        const formData = new FormData();

        formData.append('date', register?.date ?? '');
        formData.append('time', register?.time ?? '');
        formData.append('grade', register?.grade?._id ?? '');
        formData.append('name', register?.name.trim() ?? '');
        formData.append('lastName', register?.lastName.trim() ?? '');
        formData.append('user_en', user?._id || '')

        activos.forEach(activo => {
            if (activo._id) formData.append('activos[]', activo._id);
        });

        formData.append('document', file);

        if (register?.description?.trim()) {
            formData.append('description', register?.description?.trim());
        }
        try {
            const response = await instance.post('/devolucion', formData)
            Swal.fire({
                title: '¡Éxito!',
                text: 'Devolución creado exitosamente',
                icon: 'success',
            })
            close();
        } catch (e: any) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Error al intentar crear los datos. Código de error: ${e.response?.status ?? 'desconocido'
                    }. Por favor, comuníquese con el administrador del sistema.`,
                icon: 'error',
            });
        }
    };

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
    ]

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} >
                <Card>
                    <CardContent sx={{ border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.primary.main }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" color="info" onClick={toggle} startIcon={<Icon icon='ic:baseline-arrow-back-ios' />}>Atras</Button>
                            <Button variant="contained" color="success" onClick={handleSave} startIcon={<Icon icon='mdi:content-save' />}>Confirmar Entrega</Button>
                        </Box>
                    </CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <CardContent sx={{
                                border: fileError ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
                                backgroundColor: fileError && hexToRGBA(theme.palette.error.light, 0.1)
                            }}>
                                <Typography variant="overline"><strong>Información de devolución de activo</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Fecha de devolución:</strong>{' '}
                                    {register?.date ? (() => {
                                        const date = new Date(register.date)
                                        const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                                        return formatted
                                    })() : null}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Hora de devolución:</strong> {register?.time}
                                </Typography>
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que devuleve</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {register?.grade?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {register?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {register?.lastName}
                                </Typography>
                                <Divider />
                                <Typography variant="overline"><strong>Información de usuario que recibe</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Grado:</strong> {user?.grade?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>nombres:</strong> {user?.name || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    <strong>Apellidos:</strong> {user?.lastName || ''}
                                </Typography>
                                <Divider />
                                <Typography variant="overline"><strong>Descripción</strong></Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>{register?.description}</Typography>
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
                                            <Icon icon='mdi:file-pdf-box' fontSize={25} style={{ color: '#E53935' }} />
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
                                        Documento
                                    </Button>
                                    <Button variant="contained" startIcon={<Icon icon='mdi:printer' />}>
                                        Documento
                                    </Button>
                                </CardActions>
                            </CardContent>
                        </Grid>

                        <Grid item xs={12} sm={8}>

                            <Box sx={{ border: `1px solid ${theme.palette.divider}` }}>
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 3 }}>ACTIVOS SELECCIONADOS</Typography>
                                </Box>
                                <DataGrid
                                    autoHeight
                                    rows={activos}
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

                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    )
}

export default Confirmar
