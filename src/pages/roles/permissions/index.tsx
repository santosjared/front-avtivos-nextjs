import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Icon from 'src/@core/components/icon';
import { ActionType, RolType, SubjectType } from 'src/types/types';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { instance } from 'src/configs/axios';
import LoadingButton from '@mui/lab/LoadingButton';
import Swal from 'sweetalert2';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface props {
    open: boolean;
    toggle: () => void;
    rol: RolType
}
function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number,
) {
    return { name, calories, fat, carbs, protein };
}
const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                // Usar solo una definición de backgroundColor
                backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466', // Condicional
                opacity: 1,
                border: 0,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.grey[100],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

interface PermissionState {
    subject: string
    action: string[]
}

const Permissions = ({ open, toggle, rol }: props) => {

    const [subjects, setSubjects] = React.useState<SubjectType[]>([])
    const [actions, setActions] = React.useState<ActionType[]>([])
    const [permissions, setPermissions] = React.useState<PermissionState[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false)


    React.useEffect(() => {
        const fecth = async () => {
            try {
                const response = await instance.get('/subject')
                setSubjects(response.data)
            } catch (e) {
                console.log(e)
            }
        }
        fecth();
    }, [])
    React.useEffect(() => {
        const fecth = async () => {
            try {
                const response = await instance.get('/action')
                setActions(response.data)
            } catch (e) {
                console.log(e)
            }
        }
        fecth();
    }, [])

    React.useEffect(() => {
        if (open && rol.permissions) {
            const mappedPermissions = rol.permissions.map(p => ({
                subject: p.subject._id,
                action: p.action.map(a => a._id)
            }))
            setPermissions(mappedPermissions)
        }
    }, [open, rol.permissions])

    const isActionEnabled = (subjectId: string, actionId: string) => {
        const subjectPermissions = permissions.find(p => p.subject === subjectId);
        return subjectPermissions?.action.includes(actionId) || false;
    }
    const handleToggle = (subjectId: string, actionId: string) => {
        setPermissions(prev => {
            const subjectIndex = prev.findIndex(p => p.subject === subjectId);
            if (subjectIndex !== -1) {
                const subjectPerm = prev[subjectIndex];
                const hasAction = subjectPerm.action.includes(actionId);

                const newActions = hasAction
                    ? subjectPerm.action.filter(id => id !== actionId)
                    : [...subjectPerm.action, actionId];

                const updated = [...prev];
                updated[subjectIndex] = { subject: subjectId, action: newActions };
                return updated;
            } else {
                return [...prev, { subject: subjectId, action: [actionId] }];
            }
        });
    }

    console.log(permissions)

    const handleSave = async () => {
        setLoading(true);
        try {
            await instance.put(`/roles/asigne-permissions/${rol._id}`, { permissions })
            Swal.fire({
                title: '¡Éxito!',
                text: `Permisos asignado exitosamente al rol ${rol.name}`,
                icon: "success"
            });
        } catch (e) {
            console.log(e)
            Swal.fire({
                title: '¡Error!',
                text: `Se ha producido un error al intentar asignar permisos al rol ${rol.name}. Contacte al desarrollador del sistema para más asistencia.`,
                icon: "error"
            });

        }
        setLoading(false)
        setPermissions([])
        toggle()

    }
    const handleCancel = () => {
        setPermissions([])
        toggle()
    }


    return (
        <BootstrapDialog
            onClose={toggle}
            aria-labelledby="customized-dialog-title"
            open={open}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Asignar permisos al rol {rol.name}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={toggle}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
            </IconButton>
            <DialogContent dividers>
                <TableContainer component={Paper} sx={{ p: 5 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Módulo</Typography></TableCell>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Ver</Typography></TableCell>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Crear</Typography></TableCell>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Actualizar</Typography></TableCell>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Eliminar</Typography></TableCell>
                                <TableCell ><Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 15 }}>Administrar</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subjects.map((subject) => (
                                <TableRow key={subject._id}>
                                    <TableCell>{subject.name}</TableCell>
                                    {actions.map((action) => (
                                        <TableCell key={action._id} align="center">
                                            <FormControlLabel
                                                control={
                                                    <IOSSwitch
                                                        checked={isActionEnabled(subject._id, action._id)}
                                                        onChange={() => handleToggle(subject._id, action._id)}
                                                    />
                                                }
                                                label={null}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
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
                        variant='outlined'
                        color='secondary'
                        onClick={handleCancel}
                        startIcon={<Icon icon='mdi:cancel-circle' />}
                    >
                        Cancelar
                    </Button>
                    {loading ?
                        <LoadingButton
                            color="secondary"
                            loading={loading}
                            loadingPosition="start"
                            startIcon={<Icon icon='mdi:content-save' />}
                            variant="contained"
                        >
                            <span>Save</span>
                        </LoadingButton> : <Button
                            size='large'
                            onClick={handleSave}
                            variant='contained'
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Guardar
                        </Button>}
                </Box>
            </DialogActions>
        </BootstrapDialog>
    );
}
export default Permissions
