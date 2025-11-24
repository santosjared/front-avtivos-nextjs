import React, { useState, useEffect } from 'react'
import { Box, Button, Card, FormControl, Grid, TextField, Tooltip, Typography } from '@mui/material'
import { DataGrid } from "@mui/x-data-grid"
import { useDispatch } from 'react-redux'
import Icon from 'src/@core/components/icon'
import { RootState, AppDispatch } from 'src/store'
import { useSelector } from 'react-redux'
import { UserType } from 'src/types/types'
import { format } from 'date-fns'
import { fetchData } from 'src/store/bitacoras'


interface BitacorasType {
    user: UserType | null
    action: string
    method: string
    logs: string
    createdAt: string
}

interface CellType {
    row: BitacorasType
}

const safe = (txt?: string) => txt || "";
const fullName = (u: UserType | null) => {

    return [
        safe(u?.grade?.name),
        safe(u?.name),
        safe(u?.lastName),
    ].join(" ").trim();
};

const columns = [
    {
        flex: 0.15,
        minWidth: 90,
        field: 'date',
        headerName: 'Fecha y hora',
        renderCell: ({ row }: CellType) => {

            return (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6" noWrap>
                        {format(new Date(row?.createdAt), 'HH:mm')}
                    </Typography>
                    <Typography variant="body2" noWrap>
                        {format(new Date(row?.createdAt), 'dd/MM/yyyy')}
                    </Typography>
                </Box>
            )
        }
    },
    {
        flex: 0.2,
        minWidth: 200,
        field: 'user',
        headerName: 'usuario',
        renderCell: ({ row }: CellType) => {

            return (
                <Tooltip title={fullName(row.user) || 'No Identificado'}>
                    <Typography variant='body2' noWrap>{fullName(row.user) || 'No Identificado'}</Typography>
                </Tooltip>
            )
        }
    },
    {
        flex: 0.15,
        minWidth: 90,
        field: 'action',
        headerName: 'Accion',
        renderCell: ({ row }: CellType) => {

            return (
                <Tooltip title={row.action}>
                    <Typography variant='body2' noWrap>{row.action}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.15,
        minWidth: 90,
        field: 'metod',
        headerName: 'Metodo',
        renderCell: ({ row }: CellType) => {

            return (
                <Tooltip title={row.method}>
                    <Typography variant='body2' noWrap>{row.method}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.15,
        minWidth: 90,
        field: 'tipo',
        sortable: false,
        headerName: 'tipo de usuario',
        renderCell: ({ row }: CellType) => {

            return (
                <Tooltip title={row.user?.tipo}>
                    <Typography variant='body2' noWrap>{row.user?.tipo || 'Externo'}</Typography>
                </Tooltip>

            )
        }
    },
    {
        flex: 0.17,
        minWidth: 170,
        field: 'rol',
        headerName: 'Rol de usuario',
        renderCell: ({ row }: CellType) => {

            return (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    py: 1,
                }}>
                    {row.user?.roles?.length === 0 ? (
                        <Typography variant='body2'>Ninguno</Typography>
                    ) : (
                        row.user?.roles?.map?.((rol, index) => (
                            <Typography key={index}
                                noWrap={false}
                                variant='body2'
                                sx={{ textTransform: 'capitalize' }}
                            >
                                {rol.name}
                            </Typography>
                        ))
                    )}
                </Box>

            )
        }
    },
    {
        flex: 0.25,
        minWidth: 250,
        field: 'logs',
        headerName: 'Logs',
        renderCell: ({ row }: CellType) => {

            return (
                <Tooltip title={row.logs}>
                    <Typography variant='body2' noWrap>{row.logs}</Typography>
                </Tooltip>
            )
        }
    },
]

const today = new Date().toISOString().split('T')[0]
const Bitacoras = () => {

    const [pageSize, setPageSize] = useState<number>(10)
    const [page, setPage] = useState<number>(0)
    const [field, setField] = useState<string>('')
    const [date, setDate] = useState<string>(today)

    const dispatch = useDispatch<AppDispatch>()

    const store = useSelector((state: RootState) => state.bitacora)
    useEffect(() => {
        dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
    }, [pageSize, page])

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
                                alignItems: { xs: 'stretch', sm: 'center' },
                                flexWrap: 'nowrap',
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            <FormControl>
                                <TextField
                                    fullWidth
                                    label="Buscar por fecha"
                                    variant="outlined"
                                    type='date'
                                    autoComplete="off"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
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
                                    onClick={() => handleFilters(field || date)}
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
Bitacoras.acl = {
    action: 'read',
    subject: 'bitacora'
}

Bitacoras.authGuard = true;
export default Bitacoras