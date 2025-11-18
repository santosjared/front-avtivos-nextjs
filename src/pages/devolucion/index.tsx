import React, { useState, useEffect, MouseEvent } from 'react'
import { Box, Button, Card, Grid, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { GradeType, UserType } from 'src/types/types'
import Swal from 'sweetalert2'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import getConfig from 'src/configs/environment'
import Entregas from 'src/views/pages/devolucion/entregas'
import { deleteDevolucion, fetchData } from 'src/store/devolucion'
import { instance } from 'src/configs/axios'
import { PDFDevuelto } from 'src/utils/PDF-devuelto'
import { setState } from 'src/store/devolver'
import { useRouter } from 'next/router'
import Can from 'src/layouts/components/acl/Can'

interface LocationType {
    _id: string
    name: string
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

interface DevolucionType {
    _id?: string
    code: string
    date: string
    time: string
    user_dev: UserType
    user_rec: UserType
    activos: ActivosType[]
    documentUrl?: string
    description?: string
}

interface CellType {
    row: DevolucionType
}
const StyledLink = styled(Link)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main
    }
}))

const Devolucion = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [openEntrega, setOpenEntrega] = useState<boolean>(false)

    const router = useRouter()

    const dispatch = useDispatch<AppDispatch>()

    const toggle = () => setOpenEntrega(!openEntrega)

    const store = useSelector((state: RootState) => state.devolucion)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const handleFilters = (field: string) => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }

    const columns = [
        {
            flex: 0.09,
            minWidth: 90,
            field: 'code',
            headerName: 'Código de entrega',
            renderCell: ({ row }: CellType) => {
                return (
                    <Tooltip title={row.code}>
                        <Typography variant='body2' noWrap>{row.code}</Typography>
                    </Tooltip>
                )
            }
        },
        {
            flex: 0.1,
            minWidth: 100,
            field: 'date',
            headerName: 'Fecha de devolución',
            renderCell: ({ row }: CellType) => {
                const date = new Date(row.date)
                const formatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                return (
                    <Tooltip title={formatted}>
                        <Typography variant='body2' noWrap>{formatted}</Typography>
                    </Tooltip>
                )
            }
        },
        {
            flex: 0.09,
            minWidth: 90,
            field: 'hrs',
            headerName: 'Hora de devolución',
            renderCell: ({ row }: CellType) => {
                return (
                    <Tooltip title={row.time}>
                        <Typography variant='body2' noWrap>{row.time}</Typography>
                    </Tooltip>

                )
            }
        },
        {
            flex: 0.22,
            minWidth: 220,
            field: 'user_dev',
            headerName: 'Usuario que devuelve',
            renderCell: ({ row }: CellType) => {
                const fullname = `${row.user_dev?.grade?.name || ''} ${row.user_dev?.name || ''} ${row.user_dev?.lastName || ''}`
                return (
                    <Tooltip title={fullname}>
                        <Typography variant='body2' noWrap>{fullname}</Typography>
                    </Tooltip>
                )
            }
        },
        {
            flex: 0.22,
            minWidth: 220,
            field: 'user_rec',
            sortable: false,
            headerName: 'Usuario que recibe',
            renderCell: ({ row }: CellType) => {
                const fullname = `${row.user_rec?.grade?.name || ''} ${row.user_rec?.name || ''} ${row.user_rec?.lastName || ''}`
                return (
                    <Tooltip title={fullname}>
                        <Typography variant='body2' noWrap>{fullname}</Typography>
                    </Tooltip>

                )
            }
        },
        {
            flex: 0.09,
            minWidth: 90,
            field: 'document',
            headerName: 'Documento',
            renderCell: ({ row }: CellType) => {
                return (
                    <>
                        {row.documentUrl ? <Typography noWrap variant='body2' component={StyledLink}
                            href={`${getConfig().backendURI}/documents/${row.documentUrl}`}
                            target='_blank'
                        >
                            <Icon icon='teenyicons:pdf-solid' fontSize={25} color='#ff3b19' /></Typography>
                            :
                            <Tooltip title={`Sin Documento`}>
                                <Typography noWrap variant='body2'>Sin Documento</Typography>
                            </Tooltip>

                        }
                    </>

                )
            }
        },
        {
            flex: 0.25,
            minWidth: 250,
            field: 'description',
            headerName: 'Descripción',
            renderCell: ({ row }: CellType) => {
                return (
                    <Tooltip title={row.description}>
                        <Typography variant='body2' noWrap>{row.description}</Typography>
                    </Tooltip>

                )
            }
        },
        {
            flex: 0.09,
            minWidth: 90,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {
                return (<RowOptions devolucion={row} />)
            }
        }
    ]
    const RowOptions = ({ devolucion }: { devolucion: DevolucionType }) => {

        const dispatch = useDispatch<AppDispatch>()
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
        const rowOptionsOpen = Boolean(anchorEl)
        const theme = useTheme()
        const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
        }
        const handleRowOptionsClose = () => {
            setAnchorEl(null)
        }

        const print = async () => {
            setAnchorEl(null)
            try {
                const res = await instance.get(`/devolucion/${devolucion.code}`)
                const { activos, ...rest } = res.data
                PDFDevuelto(rest || null, activos || [])
            } catch (e) {
                console.log(e);
                Swal.fire({
                    title: '¡Error!',
                    text: 'Se ha producido un error al intentar imprimir la entrega. Contacte al desarrollador del sistema para más asistencia.',
                    icon: "error"
                });
            }
        }


        const handleEdit = () => {
            setAnchorEl(null);
            dispatch(setState('update'))
            router.push(`/devolver/${devolucion.code}`)
        }

        return (
            <>
                <IconButton size='small' onClick={handleRowOptionsClick}>
                    <Icon icon='mdi:dots-vertical' />
                </IconButton>
                <Menu
                    keepMounted
                    anchorEl={anchorEl}
                    open={rowOptionsOpen}
                    onClose={handleRowOptionsClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                    PaperProps={{ style: { minWidth: '8rem' } }}
                >
                    <Can I='update' a='devolucion'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={handleEdit}>
                            <Icon icon='mdi:pencil-outline' fontSize={20} color={theme.palette.info.main} />
                            Editar
                        </MenuItem>
                    </Can>
                    <Can I='print' a='devolucion'>
                        <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={print}>
                            <Icon icon='mdi:printer' fontSize={20} color={theme.palette.error.main} />
                            generar pdf
                        </MenuItem>
                    </Can>

                </Menu>
            </>
        )
    }
    return (
        <>
            {openEntrega ? <Entregas toggle={toggle} /> :
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
                                        gap: 10,
                                        width: '100%',
                                    }}
                                >
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
                                    <Can I='create' a='devolucion'>
                                        <Button
                                            onClick={toggle}
                                            variant="contained"
                                            color='success'
                                            startIcon={<Icon icon='mdi:add' />}
                                            sx={{ p: 3.5 }}
                                        >
                                            Nuevo devolucion
                                        </Button>
                                    </Can>
                                </Box>
                            </Box>
                            <Box sx={{ p: 5 }}>
                                <Typography variant='subtitle2'>
                                    Lista de devueltos
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
                </Grid>
            }
        </>
    )
}
Devolucion.acl = {
    action: 'read',
    subject: 'devolucion'
}

Devolucion.authGuard = true;
export default Devolucion