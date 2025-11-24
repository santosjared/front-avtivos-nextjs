import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, FormControlLabel,
    Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Icon from 'src/@core/components/icon';
import LoadingButton from '@mui/lab/LoadingButton';
import Swal from 'sweetalert2';
import { instance } from 'src/configs/axios';
import { Actions, Permission, Rol, Subjects } from 'src/context/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { fetchData } from 'src/store/role';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface Props {
    open: boolean;
    toggle: () => void;
    id: string;
    page: number
    pageSize: number
}

export const permissions: Permission[] = [
    { subject: 'dashboard', action: ['read'] },
    { subject: 'users', action: ['read', 'create', 'update', 'delete', 'up', 'dow'] },
    { subject: 'roles', action: ['read', 'create', 'update', 'delete', 'permissions'] },
    { subject: 'activos', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'contable', action: ['read', 'create', 'update', 'delete'] },
    { subject: 'entrega', action: ['read', 'create', 'update', 'delete', 'details', 'print'] },
    { subject: 'devolucion', action: ['read', 'create', 'update', 'delete', 'details', 'print'] },
    { subject: 'depreciacion', action: ['read', 'calcular'] },
    { subject: 'bitacora', action: ['read'] },
];

const Permissions = ({ open, toggle, id, page, pageSize }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [per, setPer] = useState<Permission[]>([]);
    const [rol, setRol] = useState<Rol | null>(null)
    const [allSelect, setAllSelect] = useState<boolean>(false);

    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const response = await instance.get(`/roles/permissions/${id}`)
                setRol(response.data || null)
                setPer(response.data.permissions || [])
            } catch (e) {
                console.log(e)
            }
        }
        if (open) {
            fetchPermission()
        }
    }, [id, open])

    const isActionEnabled = useCallback((action: Actions, subject: Subjects): boolean => {
        const permission = per.find(p => p.subject === subject);

        return permission?.action.includes(action) || false;
    }, [per]);

    const dispatch = useDispatch<AppDispatch>()
    const handleToggle = (action: Actions, subject: Subjects) => {
        setPer(prev => {
            const idx = prev.findIndex(p => p.subject === subject);
            if (idx !== -1) {
                const subjectPerm = prev[idx];
                const newActions = subjectPerm.action.includes(action)
                    ? subjectPerm.action.filter(a => a !== action)
                    : [...subjectPerm.action, action];

                const updated = [...prev];
                updated[idx] = { subject, action: newActions };

                return updated;
            } else {

                return [...prev, { subject, action: [action] }];
            }
        });
        setAllSelect(false);
    };

    const handleAllSelect = () => {
        if (!allSelect) {
            setPer(permissions)
        } else {
            setPer([])
        }
        setAllSelect(!allSelect)
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            await instance.put(`/roles/asigne-permissions/${rol?._id}`, { permissions: per });

            dispatch(fetchData({ skip: page * pageSize, limit: pageSize }))
            Swal.fire({
                title: '¡Éxito!',
                text: `Permisos asignados exitosamente al rol ${rol?.name}`,
                icon: "success"
            });
        } catch (e) {
            console.log(e);
            Swal.fire({
                title: '¡Error!',
                text: `Se produjo un error al asignar permisos al rol ${rol?.name}. Contacta al desarrollador.`,
                icon: "error"
            });
        }
        setLoading(false);
        toggle();
    };

    const handleCancel = () => {
        toggle();
    };

    return (
        <BootstrapDialog
            onClose={toggle}
            open={open}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Asignar permisos al rol {rol?.name}
            </DialogTitle>

            <IconButton
                aria-label="close"
                onClick={toggle}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main
                })}
            >
                <Icon icon='mdi:close' fontSize={10} />
            </IconButton>

            <DialogContent dividers>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <FormControlLabel
                        label={<Typography variant='h5'>Seleccionar Todos</Typography>}
                        control={<Checkbox checked={allSelect} onChange={handleAllSelect} />}
                    />

                </Box>

                <TableContainer component={Paper} sx={{ p: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Módulos</Typography></TableCell>
                                <TableCell colSpan={6} align='center'><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Permisos</Typography></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Dashboard</Typography></TableCell>
                                <TableCell colSpan={6}>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'dashboard')}
                                            onChange={() => handleToggle('read', 'dashboard')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>

                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Usuarios</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'users')}
                                            onChange={() => handleToggle('read', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'users')}
                                            onChange={() => handleToggle('create', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'users')}
                                            onChange={() => handleToggle('update', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Dar de alta'
                                        control={<Checkbox
                                            checked={isActionEnabled('up', 'users')}
                                            onChange={() => handleToggle('up', 'users')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <FormControlLabel
                                        label='Dar de baja'
                                        control={<Checkbox
                                            checked={isActionEnabled('dow', 'users')}
                                            onChange={() => handleToggle('dow', 'users')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Roles y Permisos</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'roles')}
                                            onChange={() => handleToggle('read', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'roles')}
                                            onChange={() => handleToggle('create', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'roles')}
                                            onChange={() => handleToggle('update', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'roles')}
                                            onChange={() => handleToggle('delete', 'roles')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <FormControlLabel
                                        label='Asignar permisos'
                                        control={<Checkbox
                                            checked={isActionEnabled('permissions', 'roles')}
                                            onChange={() => handleToggle('permissions', 'roles')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Activos</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'activos')}
                                            onChange={() => handleToggle('read', 'activos')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'activos')}
                                            onChange={() => handleToggle('create', 'activos')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'activos')}
                                            onChange={() => handleToggle('update', 'activos')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3}>
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'activos')}
                                            onChange={() => handleToggle('delete', 'activos')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de grupos contables</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'contable')}
                                            onChange={() => handleToggle('read', 'contable')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'contable')}
                                            onChange={() => handleToggle('create', 'contable')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'contable')}
                                            onChange={() => handleToggle('update', 'contable')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={3} >
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'contable')}
                                            onChange={() => handleToggle('delete', 'contable')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Entregas</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'entrega')}
                                            onChange={() => handleToggle('read', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'entrega')}
                                            onChange={() => handleToggle('create', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'entrega')}
                                            onChange={() => handleToggle('update', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell >
                                    <FormControlLabel
                                        label='Eliminar'
                                        control={<Checkbox
                                            checked={isActionEnabled('delete', 'entrega')}
                                            onChange={() => handleToggle('delete', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='imprimir documento'
                                        control={<Checkbox
                                            checked={isActionEnabled('print', 'entrega')}
                                            onChange={() => handleToggle('print', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='subir documento'
                                        control={<Checkbox
                                            checked={isActionEnabled('upload', 'entrega')}
                                            onChange={() => handleToggle('upload', 'entrega')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Administración de Devolución</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'devolucion')}
                                            onChange={() => handleToggle('read', 'devolucion')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Crear'
                                        control={<Checkbox
                                            checked={isActionEnabled('create', 'devolucion')}
                                            onChange={() => handleToggle('create', 'devolucion')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='Editar'
                                        control={<Checkbox
                                            checked={isActionEnabled('update', 'devolucion')}
                                            onChange={() => handleToggle('update', 'devolucion')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell >
                                    <FormControlLabel
                                        label='imprimir documento'
                                        control={<Checkbox
                                            checked={isActionEnabled('print', 'devolucion')}
                                            onChange={() => handleToggle('print', 'devolucion')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={2}>
                                    <FormControlLabel
                                        label='subir documento'
                                        control={<Checkbox
                                            checked={isActionEnabled('upload', 'devolucion')}
                                            onChange={() => handleToggle('upload', 'devolucion')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Depreciación</Typography></TableCell>
                                <TableCell>
                                    <FormControlLabel
                                        label='leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'depreciacion')}
                                            onChange={() => handleToggle('read', 'depreciacion')}
                                        />}
                                    />
                                </TableCell>
                                <TableCell colSpan={5}>
                                    <FormControlLabel
                                        label='Calcular'
                                        control={<Checkbox
                                            checked={isActionEnabled('calcular', 'depreciacion')}
                                            onChange={() => handleToggle('calcular', 'depreciacion')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><Typography sx={{ fontWeight: 'bold', fontSize: 15 }}>Bitacoras</Typography></TableCell>
                                <TableCell colSpan={6}>
                                    <FormControlLabel
                                        label='Leer'
                                        control={<Checkbox
                                            checked={isActionEnabled('read', 'bitacora')}
                                            onChange={() => handleToggle('read', 'bitacora')}
                                        />}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        p: 5
                    }}
                >
                    <Button
                        size='large'
                        disabled={loading}
                        variant='contained'
                        color='error'
                        onClick={handleCancel}
                        startIcon={<Icon icon='mdi:cancel-circle' />}
                    >
                        Cancelar
                    </Button>

                    {loading ? (
                        <LoadingButton
                            color="secondary"
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<Icon icon='mdi:content-save' />}
                            variant="contained"
                        >
                            <span>Guardando...</span>
                        </LoadingButton>
                    ) : (
                        <Button
                            size='large'
                            onClick={handleSave}
                            variant='contained'
                            color='success'
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Guardar
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </BootstrapDialog>
    );
};

export default Permissions;
