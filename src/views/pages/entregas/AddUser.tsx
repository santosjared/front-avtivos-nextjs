import {
    Autocomplete,
    Box,
    Button,
    Card,
    CircularProgress,
    debounce,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Icon from 'src/@core/components/icon';
import * as yup from 'yup';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { instance } from "src/configs/axios";
import { GradeType } from "src/types/types";
import Swal from 'sweetalert2';

interface LocationType {
    _id: string;
    name: string;
}

interface UserType {
    _id?: string;
    grade: GradeType | null;
    name: string;
    lastName: string;
    ci: string;
    otherGrade?: string;
}

interface InfoEntegaType {
    code: string;
    date: string;
    time: string;
    user_en: UserType | null;
    user_rec: UserType | null;
    location: LocationType | null;
    description: string;
    otherLocation: string;
}

const defaultValues: UserType = {
    grade: null,
    name: '',
    lastName: '',
    ci: '',
    otherGrade: ''
};

interface Props {
    toggle: () => void;
    open: boolean;
    entrega: InfoEntegaType | null;
    setEntrega: React.Dispatch<React.SetStateAction<InfoEntegaType | null>>;
}

const schema = yup.object().shape({
    grade: yup.object({
        _id: yup.string().required(),
        name: yup.string().required(),
    })
        .nullable()
        .required('Debe seleccionar el grado del usuario que recibe'),

    otherGrade: yup.string()
        .trim()
        .when('grade.name', {
            is: (val: string | undefined) => val === 'Otro',
            then: (s) =>
                s.required('Por favor, especifique el grado del usuario que recibe')
                    .min(2, 'El grado debe tener al menos 2 caracteres')
                    .max(50, 'El grado no debe exceder los 50 caracteres'),
            otherwise: (s) => s.notRequired()
        }),

    name: yup.string()
        .trim()
        .required('El nombre del usuario que recibe es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no debe superar los 50 caracteres'),

    lastName: yup.string()
        .trim()
        .required('El apellido del usuario que recibe es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no debe superar los 50 caracteres'),

    ci: yup
        .string()
        .trim()
        .required('la cédula de indentidad es requerido')
        .min(4, 'La cédula de identidad debe tener al menos 4 caracteres')
        .max(10, 'La cédula de identidad no debe exceder los 10 caracteres'),
});

const AddUser = ({ toggle, open, entrega, setEntrega }: Props) => {
    const [grades, setGrades] = useState<GradeType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [moreGrade, setMoreGrade] = useState<boolean>(true);
    const [pageGrade, setPageGrade] = useState<number>(0);
    const [selectUser, setSelectUser] = useState<UserType | null>(null);
    const [enableEdit, setEnableEdit] = useState<boolean>(true);

    const limit = 10;
    const theme = useTheme();

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const response = await instance.get('/users/grades', {
                params: { skip: pageGrade * limit, limit }
            });

            const data = response.data;
            if (data.result?.length < limit) {
                setMoreGrade(false);
            }

            setGrades(prev => {
                const merged = [...prev, ...(data.result || [])];

                return merged.filter(
                    (item, index, arr) =>
                        index === arr.findIndex(i => i._id === item._id)
                );
            });
        } catch (error) {
            console.error('Error al extraer grados', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await instance.get('/users/allUsers');
                const data = response.data;
                setUsers(data.result ?? []);
            } catch (error) {
                console.error('Error al extraer los usuarios', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (pageGrade > 0) fetchGrades();
    }, [pageGrade]);

    useEffect(() => {
        if (open) {
            setGrades([]);
            setMoreGrade(true);
            setPageGrade(0);
            fetchGrades();
        }
        if (open && entrega?.user_rec) {
            reset({ ...entrega.user_rec })
        }
    }, [open]);

    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<UserType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const searchUsers = useCallback(
        debounce(async (field: string) => {
            try {
                const res = await instance.get('/users/allUsers', {
                    params: { field, skip: 0, limit: 10 }
                });
                setUsers(res.data?.result ?? []);
            } catch (error) {
                console.error("Error buscando usuarios:", error);
            }
        }, 400),
        []
    );

    const handleScrollGrade = (event: any) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isBottom = scrollHeight - scrollTop <= clientHeight + 5;
        if (isBottom && moreGrade) {
            setPageGrade(prev => prev + 1);
        }
    };

    const onSubmit = async (data: UserType) => {

        try {
            const res = await instance.post('/users/create', { ...data, grade: data.grade?._id });
            setEntrega(prev => ({
                ...prev!,
                user_rec: res.data
            }));
            Swal.fire({
                title: '¡Éxito!',
                text: 'Datos guardados exitosamente',
                icon: "success"
            });
            handleOnclickCancel();
        } catch (e) {
            console.error(e);
            Swal.fire({
                title: '¡Error!',
                text: 'Se ha producido un error al intentar agregar usuario. Contacte al desarrollador del sistema para más asistencia.',
                icon: "error"
            });
        }

        toggle();
    };


    const handleOnclickCancel = () => {
        reset(defaultValues);
        setSelectUser(null);
        toggle();
    };

    const handleSelect = (selected: UserType | null) => {
        reset({ ...selected || defaultValues });
        setSelectUser(selected);
    };

    const otherGrade = watch('grade');

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Información del usuario</Typography>
                    </legend>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(option) =>
                                        option ? `${option.grade?.name || ''} ${option.name || ''} ${option.lastName || ''} - C.I.: ${option.ci ?? ''}` : ''
                                    }
                                    value={selectUser}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                    onInputChange={(_, newInput) => searchUsers(newInput)}
                                    onChange={(_, newValue) => handleSelect(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Usuario que recibe"
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Card elevation={0} sx={{ borderColor: 'divider', borderRadius: 2, p: 3, mb: 2, backgroundColor: 'background.paper' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'end', p: 2 }}>
                                    <Button
                                        onClick={() => setEnableEdit(!enableEdit)}
                                        startIcon={<Icon icon={enableEdit ? 'mdi:pencil-outline' : 'mdi:close'} />}
                                    >
                                        {enableEdit ? 'Editar' : 'Cerrar'}
                                    </Button>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth sx={{ mb: 6 }}>
                                            <InputLabel id="grade-select">Grado</InputLabel>
                                            <Controller
                                                name="grade"
                                                control={control}
                                                render={({ field: { onChange, value } }) => (
                                                    <Select
                                                        labelId="grade-select"
                                                        label='Grado'
                                                        disabled={enableEdit}
                                                        id="select-grade"
                                                        value={value?._id ?? ''}
                                                        error={!!errors.grade}
                                                        onChange={(e) => {
                                                            const selectedId = e.target.value;
                                                            if (selectedId === 'Other') {
                                                                onChange({ name: 'Otro', _id: 'Other' });

                                                                return;
                                                            }
                                                            const selectedGrade = grades.find(g => g._id === selectedId) || null;
                                                            onChange(selectedGrade);
                                                        }}
                                                        MenuProps={{ PaperProps: { style: { maxHeight: 300 }, onScroll: handleScrollGrade } }}
                                                    >
                                                        {grades.map((g, index) => <MenuItem key={index} value={g._id || ''}>{g.name}</MenuItem>)}
                                                        {loading && <MenuItem disabled><CircularProgress /></MenuItem>}
                                                        <MenuItem value="Other">Otro</MenuItem>
                                                    </Select>
                                                )}
                                            />
                                            {errors.grade
                                                ? <FormHelperText sx={{ color: 'error.main' }}>{errors.grade?.message}</FormHelperText>
                                                : <FormHelperText sx={{ color: 'secondary.main' }}>Grado del usuario que recibe</FormHelperText>}
                                        </FormControl>
                                    </Grid>

                                    {otherGrade?.name === 'Otro' &&
                                        <Grid item xs={6}>
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <Controller
                                                    name="otherGrade"
                                                    control={control}
                                                    render={({ field: { value, onChange } }) => (
                                                        <TextField
                                                            label='Especifica otro grado'
                                                            onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                            error={!!errors.otherGrade}
                                                            value={value}
                                                        />
                                                    )}
                                                />
                                                {errors.otherGrade
                                                    ? <FormHelperText sx={{ color: 'error.main' }}>{errors.otherGrade?.message}</FormHelperText>
                                                    : <FormHelperText sx={{ color: 'secondary.main' }}>Especifica el grado del usuario que recibe</FormHelperText>}
                                            </FormControl>
                                        </Grid>
                                    }

                                    <Grid item xs={6}>
                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <Controller
                                                name='name'
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        disabled={enableEdit}
                                                        label='Nombres'
                                                        placeholder='Jhon'
                                                        error={!!errors.name}
                                                        helperText={errors.name?.message}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <Controller
                                                name='lastName'
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        disabled={enableEdit}
                                                        label='Apellidos'
                                                        placeholder='Doh'
                                                        error={!!errors.lastName}
                                                        helperText={errors.lastName?.message}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <Controller
                                                name='ci'
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        disabled={enableEdit}
                                                        label='Cédula de identidad'
                                                        placeholder='Cédula de identidad'
                                                        error={!!errors.ci}
                                                        helperText={errors.ci?.message}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            size='large'
                            variant='contained'
                            color='error'
                            onClick={handleOnclickCancel}
                            startIcon={<Icon icon='mdi:cancel-circle' />}
                        >
                            Cancelar
                        </Button>

                        <Button
                            size='large'
                            type='submit'
                            variant='contained'
                            color="success"
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Agregar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    );
};

export default AddUser;
