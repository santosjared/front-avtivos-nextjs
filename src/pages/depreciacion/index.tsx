import React, { useState, useEffect } from 'react'
import { Box, Button, Card, Divider, Grid, TextField, Tooltip, Typography } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";
import { fetchData } from 'src/store/depreciacion'
import Can from 'src/layouts/components/acl/Can'

interface DepreciaCionType {
    _id?: string
    nombre: string
    fecha_a: string
    precio_ac: number
    ufv_inicial: number
    ufv_final: number
    diferencia_ufv: number
    precio_actualizado: number
    deprec_acomulada: number
    neto: number
}

interface CellType {
    row: DepreciaCionType
}

const columns = [
    {
        flex: 0.2,
        minWidth: 150,
        field: 'nombre',
        headerName: 'Nombre del activo',
        renderCell: ({ row }: CellType) => {
            return (
                <Tooltip title={row.nombre}>
                    <Typography variant='body2' noWrap>{row.nombre}</Typography>
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
            const date = new Date(row.fecha_a)
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
                <Tooltip title={row.precio_ac}>
                    <Typography variant='body2' noWrap>{row.precio_ac}</Typography>
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
            return (
                <Tooltip title={row.ufv_inicial}>
                    <Typography variant='body2' noWrap>{row.ufv_inicial}</Typography>
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

            return (
                <Tooltip title={row.ufv_final}>
                    <Typography variant='body2' noWrap>{row.ufv_final}</Typography>
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
                <Tooltip title={row.diferencia_ufv}>
                    <Typography variant='body2' noWrap>{row.diferencia_ufv}</Typography>
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
                <Tooltip title={row.precio_actualizado}>
                    <Typography variant='body2' noWrap>{row.precio_actualizado}</Typography>
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
                <Tooltip title={row.deprec_acomulada}>
                    <Typography variant='body2' noWrap>{row.deprec_acomulada}</Typography>
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
                <Tooltip title={row.neto}>
                    <Typography variant='body2' noWrap>{row.neto}</Typography>
                </Tooltip>

            )
        }
    },
]

const formatearConDia = (f: string | Date) => {
    const fecha = new Date(
        typeof f === "string" ? f + "T00:00:00-04:00" : f
    );

    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const diaSemana = dias[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${diaSemana} ${diaMes} de ${mes} de ${anio}`;
};

const today = new Date().toISOString().split('T')[0]
const Depreciacion = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [fechaCompra, setFechaCompra] = useState<string>(today)
    const [fechaFinal, setFechaFinal] = useState<string>(today)

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.depreciacion)
    useEffect(() => {
        dispatch(fetchData({ fecha_compra: fechaCompra, fecha_final: fechaFinal, skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

    const handleCalcular = () => {
        dispatch(fetchData({ fecha_compra: fechaCompra, fecha_final: fechaFinal, skip: page * pageSize, limit: pageSize }))
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
                                <Can I='calcular' a='depreciacion'>
                                    <Button variant='contained' onClick={handleCalcular}>Calcular</Button>
                                </Can>
                            </Box>

                            <Card sx={{ backgroundColor: theme => hexToRGBA(theme.palette.secondary.main, 0.3) }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', pr: 3, pl: 3 }}>
                                    <Typography variant='overline'><strong>Unidad de fomento a la vivienda</strong></Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ p: 3, pt: 0 }}>
                                    <Typography variant='subtitle1'>{formatearConDia(fechaCompra)}</Typography>
                                    <Typography variant='h6'>{store.valor_ufv}</Typography>
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