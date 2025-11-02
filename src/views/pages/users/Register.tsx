import { Box, Button, Checkbox, FormControl, FormHelperText, Grid, IconButton, InputAdornment, ListItemText, OutlinedInput, TextField, Typography, useTheme } from "@mui/material"
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux';
import { AppDispatch } from "src/store";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'
import { instance } from "src/configs/axios";
import { addUser, updateUser } from "src/store/user";
import Chip from '@mui/material/Chip';
import { Rol } from "src/context/types";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface GradeType {
    name: string
    _id: string
}

interface DefaultUserType {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    grade: GradeType | null,
    otherGrade: string
    ci: string,
    exp: string
    phone: string,
    address: string,
    password: string,
    rol: string[]
    _id?: string
    __v?: string
}

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: DefaultUserType;
}


const AddUser = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {


    const [showPassword, setShowPassword] = useState(false)
    const [roles, setRoles] = useState<Rol[]>([])
    const [grades, setGrades] = useState<GradeType[]>([])

    const checkemail = defaultValues?.email

    const schema = yup.object().shape({
        grade: yup
            .object({
                _id: yup.string().required('El campo grado es requerido'),
                name: yup.string().required('El campo grado es requerido'),
            })
            .nullable()
            .default(null)
            .required('Debe seleccionar un grado'),

        otherGrade: yup
            .string()
            .when('grade', {
                is: (val: unknown) => (val as GradeType)?.name === 'Otro',
                then: schema =>
                    schema
                        .required('Debe especificar el otro grado')
                        .min(2, 'El campo otro grado debe tener al menos 2 caracteres')
                        .max(50, 'El campo otro grado no debe tener más de 50 caracteres'),
                otherwise: schema => schema.notRequired()
            }),

        name: yup
            .string()
            .required('El campo nombres es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras')
            .min(4, 'El campo nombres debe tener al menos 4 caracteres')
            .max(50, 'El campo nombres no debe tener más de 50 caracteres'),

        lastName: yup
            .string()
            .required('El campo apellidos es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido solo debe contener letras')
            .min(4, 'El campo apellidos debe tener al menos 4 caracteres')
            .max(50, 'El campo apellidos no debe tener más de 50 caracteres'),

        email: yup
            .string()
            .email('El correo electrónico debe ser un correo electrónico válido')
            .required('El campo correo electrónico es requerido')
            .max(100, 'El campo correo electrónico no debe tener más de 100 caracteres'),

        ci: yup
            .string()
            .required('El campo CI es requerido')
            .min(4, 'El campo CI debe tener al menos 4 caracteres')
            .max(20, 'El campo CI no debe tener más de 20 caracteres'),

        exp: yup
            .string()
            .required('Seleccione la expedición del carnet')
            .max(20, 'El campo expedición no debe tener más de 20 caracteres'),

        phone: yup
            .string()
            .trim()
            .matches(/^[0-9]+$/, 'El celular debe contener solo números')
            .min(6, 'El campo celular debe tener al menos 6 caracteres')
            .max(15, 'El campo celular no debe tener más de 15 caracteres')
            .required('El campo celular es requerido'),

        address: yup
            .string()
            .min(3, 'El campo dirección debe tener al menos 3 caracteres')
            .max(100, 'El campo dirección no debe tener más de 100 caracteres')
            .required('El campo dirección es requerido'),

        password: mode === 'create'
            ? yup
                .string()
                .min(8, 'La contraseña debe tener al menos 8 caracteres')
                .max(32, 'La contraseña no debe tener más de 32 caracteres')
                .required('El campo contraseña es requerido')
            : yup
                .string()
                .transform(value => (value === '' ? undefined : value))
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .max(32, 'La contraseña no debe tener más de 32 caracteres')
                .notRequired(),

        gender: yup
            .string()
            .required('Debe seleccionar algún sexo')
            .max(10, 'El campo sexo no debe tener más de 10 caracteres'),

        rol: yup
            .array()
            .min(1, 'Debe seleccionar al menos un rol')
            .max(5, 'No puede seleccionar más de 5 roles')
            .required('Debe seleccionar al menos un rol'),
    });
    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    useEffect(() => {
        const fetchRol = async () => {
            try {
                const response = await instance.get('/roles');
                setRoles(response.data.result);
            } catch (e) {
                console.log(e)
            }

        }
        fetchRol();
    }, [mode, page, pageSize, defaultValues]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await instance.get('/users/grades')
                setGrades([...response.data, { name: 'Otro', _id: 'Other' }])
            } catch (error) {
                console.log('error al solicitar grados', error)
            }
        }
        fetch()
    }, [mode, page, pageSize, defaultValues, toggle])

    const {
        reset,
        control,
        watch,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<DefaultUserType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const otherGrade = watch('grade')

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])


    const onSubmit = async (data: DefaultUserType) => {

        try {
            const newData = {
                ...data,
                grade: data.grade?._id
            }
            if (mode === 'edit' && defaultValues?._id) {
                if (data.email !== checkemail) {
                    const check = await instance.get(`/users/check-email/${data.email}`);
                    if (check.data) {
                        setError('email', {
                            type: 'manual',
                            message: 'Este correo ya está registrado'
                        });
                        return;
                    }
                }
                delete newData._id
                dispatch(updateUser({ data: newData, id: defaultValues._id, filtrs: { skip: page * pageSize, limit: pageSize } }))
            } else {
                const check = await instance.get(`/users/check-email/${data.email}`);
                if (check.data) {
                    setError('email', {
                        type: 'manual',
                        message: 'Este correo ya está registrado'
                    });
                    return;
                }
                dispatch(addUser({ data: newData, filtrs: { skip: page * pageSize, limit: pageSize } }))
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
        }

        toggle()
        reset()
    }
    const handleOnclickCancel = () => {
        reset()
        toggle()
    }

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>Agregar Nuevo Usuario</Typography></legend>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="grade-select">Grado</InputLabel>
                                <Controller
                                    name="grade"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            labelId="grade-select"
                                            id="select-grade"
                                            label="Grado"
                                            error={Boolean(errors.grade)}
                                            value={value?._id ?? ''}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedGrade = grades.find((grade) => grade._id === selectedId) || null
                                                onChange(selectedGrade)
                                            }}
                                        >
                                            {grades.map((value) => (<MenuItem
                                                value={value._id || ''}
                                                key={value._id}
                                            >{value.name}</MenuItem>))}
                                        </Select>
                                    )}
                                />
                                {errors.grade && <FormHelperText sx={{ color: 'error.main' }}>{errors.grade?.message || errors.grade.name?.message || errors.grade._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherGrade?.name == 'Otro' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otherGrade"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otro grado'
                                                onChange={(e) => onChange(e.target.value.toUpperCase())}
                                                error={Boolean(errors.otherGrade)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {errors.otherGrade && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherGrade.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Nombres'
                                            placeholder='Juan Carlos'
                                            onChange={onChange}
                                            error={Boolean(errors.name)}
                                            value={value}

                                        />
                                    )}
                                />
                                {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Apellidos'
                                            placeholder='Benitez Lopez'
                                            onChange={onChange}
                                            error={Boolean(errors.lastName)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{errors.lastName.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="gender-select">Género</InputLabel>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="gender-select"
                                            id="select-gender"
                                            label="Género"
                                            error={Boolean(errors.gender)}
                                        >
                                            <MenuItem value='Femenino'>
                                                Femenino
                                            </MenuItem>
                                            <MenuItem value='Masculino'>
                                                Masculino
                                            </MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.gender && <FormHelperText sx={{ color: 'error.main' }}>{errors.gender.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="ci"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Ci'
                                            placeholder='3456762-a'
                                            onChange={onChange}
                                            error={Boolean(errors.ci)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.ci && <FormHelperText sx={{ color: 'error.main' }}>{errors.ci.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="exp-select">Expedido</InputLabel>
                                <Controller
                                    name="exp"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="exp-select"
                                            id="select-exp"
                                            label="Expedido"
                                            error={Boolean(errors.exp)}
                                        >
                                            <MenuItem value='PT'>
                                                PT
                                            </MenuItem>
                                            <MenuItem value='LP'>
                                                LP
                                            </MenuItem>
                                            <MenuItem value='CH'>
                                                CH
                                            </MenuItem>
                                            <MenuItem value='CB'>
                                                CB
                                            </MenuItem>
                                            <MenuItem value='OR'>
                                                OR
                                            </MenuItem>
                                            <MenuItem value='SR'>
                                                SR
                                            </MenuItem>
                                            <MenuItem value='BN'>
                                                BN
                                            </MenuItem>
                                            <MenuItem value='TO'>
                                                TO
                                            </MenuItem>
                                            <MenuItem value='PA'>
                                                PA
                                            </MenuItem>
                                        </Select>
                                    )}
                                />
                                {errors.exp && <FormHelperText sx={{ color: 'error.main' }}>{errors.exp.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Celular'
                                            placeholder='72381722'
                                            onChange={onChange}
                                            value={value}
                                            error={Boolean(errors.phone)}
                                        />
                                    )}
                                />
                                {errors.phone && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="address"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Dirección'
                                            placeholder='Av. Las banderas'
                                            onChange={onChange}
                                            error={Boolean(errors.address)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.address && <FormHelperText sx={{ color: 'error.main' }}>{errors.address.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Correo electrónico'
                                            placeholder='example@gmail.com'
                                            onChange={onChange}
                                            error={Boolean(errors.email)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel htmlFor="outlined-adornment-password" >Contraseña</InputLabel>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <OutlinedInput
                                            id="outlined-adornment-password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            error={Boolean(errors.password)}
                                            value={value}
                                            onChange={onChange}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword((prevShow) => !prevShow)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <Icon icon='mdi:visibility-off' /> : <Icon icon='mdi:visibility' />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Contraseña"
                                        />
                                    )}
                                />
                                {errors.password && <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="role-select">Rol</InputLabel>
                                <Controller
                                    name="rol"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="role-select"
                                            id="select-role"
                                            multiple
                                            input={<OutlinedInput id="select-role" label="Rol" />}
                                            renderValue={(selected: any) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {
                                                        roles.filter((r) => selected.includes(r._id)).map((r) => (
                                                            <Chip key={r._id} label={r.name} />
                                                        ))
                                                    }
                                                </Box>
                                            )}
                                            MenuProps={MenuProps}
                                            error={Boolean(errors.rol)}
                                        >
                                            {roles.map((role: any) => (
                                                <MenuItem key={role._id} value={role._id}>
                                                    <Checkbox checked={field.value?.includes(role._id)} />
                                                    <ListItemText primary={role.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.rol && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {errors.rol.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button size='large' variant='outlined' color='secondary' onClick={handleOnclickCancel} startIcon={<Icon icon='mdi:cancel-circle' />}>
                            Cancelar
                        </Button>
                        <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }} startIcon={<Icon icon='mdi:content-save' />}>
                            Guardar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}
export default AddUser;