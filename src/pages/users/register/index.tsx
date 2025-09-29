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

interface DefaultUserType {
    name: string,
    lastName: string,
    gender: string,
    email: string,
    ci: string,
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

const showErrors = (field: string, valueLen: number, min: number) => {
    if (valueLen === 0) {
        return `El campo ${field} es requerido`
    } else if (valueLen > 0 && valueLen < min) {
        return `El campo ${field} debe tener al menos ${min} caracteres`
    } else {
        return ''
    }
}



const AddUser = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {


    const [showPassword, setShowPassword] = useState(false)
    const [roles, setRoles] = useState<Rol[]>([])

    const schema = yup.object().shape({
        name: yup.string().required('El campo nombres es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras')
            .min(4, obj => showErrors('nombres', obj.value.length, obj.min)),
        lastName: yup.string().required('El campo apellidos es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido solo debe contener letras')
            .min(4, obj => showErrors('apellidos', obj.value.length, obj.min)),
        email: yup.string().email('El correo electrónico debe ser un correo electrónico válido')
            .required('El campo correo electrónico es requerido'),
        ci: yup.string().required('El campo ci es requerido')
            .min(4, obj => showErrors('ci', obj.value.length, obj.min)),
        phone: yup
            .number()
            .typeError('El celular debe ser un número')
            .min(10, obj => showErrors('celular', obj.value.length, obj.min))
            .required('El campo celular es requerido'),
        address: yup
            .string()
            .min(3, obj => showErrors('dirección', obj.value.length, obj.min))
            .required('El campo dirección es requerido'),
        password: mode === 'create'
            ? yup
                .string()
                .min(8, obj => showErrors('contraseña', obj.value.length, obj.min))
                .max(32, 'La contraseña no debe ser mayor a 32 caracteres')
                .required('El campo contraseña es requerido')
            : yup
                .string()
                .transform(value => (value === '' ? undefined : value)) // elimina string vacío
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .max(32, 'La contraseña no debe ser mayor a 32 caracteres')
                .notRequired(),
        gender: yup.string().required('Este campo es obligatorio'),
        rol: yup
            .array()
            .min(1, 'Debe seleccionar al menos un rol')
            .required('Debe seleccionar al menos un rol'),

    })

    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<DefaultUserType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

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
    }, [mode]);

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])


    const onSubmit = (data: DefaultUserType) => {

        if (mode === 'edit' && defaultValues?._id) {
            const { _id, __v, ...newData } = data
            dispatch(updateUser({ data: newData, id: defaultValues._id, filtrs: { skip: page * pageSize, limit: pageSize } }))
        } else {
            dispatch(addUser({ data, filtrs: { skip: page * pageSize, limit: pageSize } }))
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