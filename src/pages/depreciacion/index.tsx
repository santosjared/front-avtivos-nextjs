import React, { useState, useEffect, MouseEvent } from 'react'
import { Box, Button, Card, CardContent, Divider, Grid, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { GradeType, UserType } from 'src/types/types'
import Swal from 'sweetalert2'
import { deleteEntrega, fetchData } from 'src/store/entrega'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { instance } from 'src/configs/axios'

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

const columns = [
    {
        flex: 0.2,
        minWidth: 150,
        field: 'nombre',
        headerName: 'Nombre del activo',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.code}>
                    <Typography variant='body2' noWrap>{row.code}</Typography>
                </Tooltip>
            )
        }
    },
    {
        flex: 0.15,
        minWidth: 100,
        field: 'fecha_a',
        headerName: 'fecha de adquisición',
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
        flex: 0.1,
        minWidth: 90,
        field: 'pricio_ac',
        headerName: 'Precio del activo',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.time}>
                    <Typography variant='body2' noWrap>{row.time}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.1,
        minWidth: 90,
        field: 'ufv_inicial',
        headerName: 'UFV inicial',
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
        flex: 0.1,
        minWidth: 90,
        field: 'ufv_final',
        sortable: false,
        headerName: 'UFV final',
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
        flex: 0.1,
        minWidth: 90,
        field: 'diferencia_ufv',
        headerName: 'Diferencia UFV',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.location?.name}>
                    <Typography variant='body2' noWrap>{row.location?.name}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.1,
        minWidth: 90,
        field: 'precio_actualizado',
        headerName: 'precio Actualizado',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.location?.name}>
                    <Typography variant='body2' noWrap>{row.location?.name}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.1,
        minWidth: 90,
        field: 'deprec_acomulada',
        headerName: 'Depreciación acomulada',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.location?.name}>
                    <Typography variant='body2' noWrap>{row.location?.name}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.1,
        minWidth: 90,
        field: 'neto',
        headerName: 'Valor Neto',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.location?.name}>
                    <Typography variant='body2' noWrap>{row.location?.name}</Typography>
                </Tooltip>

            )
        }
    },
]

const today = new Date().toISOString().split('T')[0]
const Depreciacion = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [fechaCompra, setFechaCompra] = useState<string>(today)
    const [fechaFinal, setFechaFinal] = useState<string>(today)

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.entrega)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    useEffect(() => {
        const fetch = async () => {
            const res = await instance.get('/depreciacion')
        }
        fetch()
    }, [fechaCompra, fechaFinal])

    const handleFilters = (field: string) => {
        dispatch(fetchData({ field, skip: page * pageSize, limit: pageSize }))
    }


    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ p: 5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'flex-start' },
                                justifyContent: 'space-between',
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 5 }}>
                                <TextField
                                    label="Fecha de compra"
                                    variant="outlined"
                                    autoComplete="off"
                                    type='date'
                                    value={fechaCompra}
                                    onChange={(e) => setFechaCompra(e.target.value)}
                                />
                                <TextField
                                    label="fecha final"
                                    variant="outlined"
                                    autoComplete="off"
                                    type='date'
                                    value={fechaFinal}
                                    onChange={(e) => setFechaFinal(e.target.value)}
                                />
                                <Button variant='contained'>Calcular</Button>
                            </Box>

                            <Card sx={{ backgroundColor: theme => hexToRGBA(theme.palette.secondary.main, 0.3) }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', pr: 3, pl: 3 }}>
                                    <Typography variant='overline'><strong>Unidad de fomento a la vivienda</strong></Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3, pt: 0 }}>
                                    <Typography variant='subtitle1'>29 noviembre 2025</Typography>
                                    <Typography variant='h6'>Bs. 2.470559</Typography>
                                </Box>
                            </Card>
                        </Box>
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
Depreciacion.acl = {
    action: 'read',
    subject: 'depreciacion'
}

Depreciacion.authGuard = true;
export default Depreciacion