import React, { useState, useEffect, } from 'react'
import { Box, Button, Card, Divider, Grid, IconButton, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { GradeType, UserType } from 'src/types/types'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import getConfig from 'src/configs/environment'
import { useRouter } from 'next/router'
import { fetchData } from 'src/store/entrega'
import Can from 'src/layouts/components/acl/Can'
import { setState } from 'src/store/devolver'

interface LocationType {
    _id: string
    name: string
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

interface EntregaType {
    _id?: string
    code: string
    date: string
    time: string
    user_en: UserType | null
    user_rec: UserType | null
    location: LocationType
    documentUrl?: string
    description?: string
}


interface CellType {
    row: EntregaType
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

interface Props {
    toggle: () => void
}

const Entregas = ({ toggle }: Props) => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')

    const dispatch = useDispatch<AppDispatch>()

    const router = useRouter()

    const theme = useTheme()

    const store = useSelector((state: RootState) => state.entrega)
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
            headerName: 'Fecha de entrega',
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
            headerName: 'Hora de la entrega ',
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
            field: 'user_entrega',
            headerName: 'Usuario que entrega',
            renderCell: ({ row }: CellType) => {
                const fullname = `${row.user_en?.grade?.name || ''} ${row.user_en?.name || ''} ${row.user_en?.lastName || ''}`
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
            field: 'user_recibe',
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
            flex: 0.20,
            minWidth: 200,
            field: 'location',
            headerName: 'ubicacion',
            renderCell: ({ row }: CellType) => {
                return (
                    <Tooltip title={row.location?.name}>
                        <Typography variant='body2' noWrap>{row.location?.name}</Typography>
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
                const theme = useTheme()
                return (
                    <>
                        {row.documentUrl ? <Typography noWrap variant='body2' component={StyledLink}
                            href={`${getConfig().backendURI}/documents/${row.documentUrl}`}
                            target='_blank'
                        >
                            <Icon icon='teenyicons:pdf-solid' fontSize={25} color={theme.palette.error.main} /></Typography>
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
            flex: 0.15,
            minWidth: 100,
            field: 'actions',
            sortable: false,
            headerName: 'Acciones',
            renderCell: ({ row }: CellType) => {
                const handleDevolver = () => {

                    dispatch(setState('create'))
                    router.push(`/devolver/${row.code}`)
                }
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%'
                        }}
                    >
                        <Button
                            variant='contained'
                            size='small'
                            onClick={handleDevolver}
                            startIcon={<Icon icon='mdi:clipboard-arrow-up' fontSize={20} />}
                            sx={{
                                minWidth: { xs: 35, sm: 90 },
                                px: { xs: 1, sm: 2 },
                                py: { xs: 0.5, sm: 1 },
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                textTransform: 'none',
                                gap: 0.5,
                                '& .MuiButton-startIcon': {
                                    margin: 0,
                                },
                            }}
                        >
                            <Can I='create' a='devolucion'>
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Devolver
                                </Box>
                            </Can>
                        </Button>
                    </Box>
                )
            }
        }

    ]
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, pr: 2 }}>
                        <Typography variant="h5" sx={{ pl: 2, pt: 2, color: theme.palette.text.secondary }}>ACTIVOS PRESTADOS</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2 }}>
                            <IconButton size='small' color="secondary" onClick={toggle}>
                                <Icon icon='mdi:close' fontSize={20} />
                            </IconButton>
                        </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 5, pb: 0 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                flexWrap: 'nowrap',
                                gap: 5,
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
                        </Box>
                    </Box>
                    <Box sx={{ p: 5 }}>
                        <Typography variant='subtitle2'>
                            Lista de entregados
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
    )
}
export default Entregas