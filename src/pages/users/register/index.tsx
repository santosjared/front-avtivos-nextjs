import { Box, Button, FormControl, FormHelperText, Grid, IconButton, InputAdornment, OutlinedInput, TextField, Typography } from "@mui/material"
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
import { UserType } from "src/types/types";
import { addUser, updateUser } from "src/store/user";

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: UserType;
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
    const [genders, setGenders] = useState<any[]>([])
    const [roles, setRoles] = useState<any[]>([])

    const schema = yup.object().shape({
        name: yup.string().required('El campo nombres es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras')
            .min(4, obj => showErrors('nombres', obj.value.length, obj.min)),
        lastName: yup.string().required('El campo apellidos es requerido')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El campo apellido solo debe contener letras')
            .min(4, obj => showErrors('apellidos', obj.value.length, obj.min)),
        email: yup.string().email().required('El campo correo electrónico es requerido'),
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
                .required('El campo contraseña es requerido')
            : yup
                .string()
                .transform(value => (value === '' ? undefined : value)) // elimina string vacío
                .min(8, 'El campo contraseña debe tener al menos 8 caracteres')
                .notRequired(),
        otherGender: yup.string().when('gender', {
            is: 'other',
            then: schema => schema.required('Por favor, especifique el género'),
            otherwise: schema => schema.notRequired(),
        }),
        gender: yup.string().required('Este campo es obligatorio'),
        rol: yup.string().required('Debe seleccionar algun rol')

    })

    const dispatch = useDispatch<AppDispatch>()

    const {
        reset,
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })
    const selectedGender = watch('gender');

    useEffect(() => {
        const fetchGender = async () => {
            try {
                const response = await instance.get('/users/genders');
                setGenders(response.data);
            } catch (e) {
                console.log(e)
            }

        }
        fetchGender();
    }, [toggle]);

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
    }, [toggle]);

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])


    const onSubmit = (data: UserType) => {

        if (mode === 'edit' && defaultValues?._id) {
            delete data._id;
            delete data.__v;
            dispatch(updateUser({ data, id: defaultValues._id, filtrs: { skip: page * pageSize, limit: pageSize } }))
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

    return (<Box>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <fieldset style={{ border: '1.5px solid #E0E0E0', borderRadius: 10, paddingTop: 20 }}>
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
                                        {genders.map(value => (
                                            <MenuItem value={value._id} key={value._id}>
                                                {value.name}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value='other'>
                                            otro
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                            {errors.gender && <FormHelperText sx={{ color: 'error.main' }}>{errors.gender.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {selectedGender === 'other' &&
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="otherGender"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Especificar género'
                                            placeholder='otro'
                                            onChange={onChange}
                                            value={value}
                                            error={Boolean(errors.otherGender)}
                                        />
                                    )}
                                />
                                {errors.otherGender && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherGender.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    }
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
                                        label="Rol"
                                        error={Boolean(errors.rol)}
                                    >
                                        {roles.map((value) => (<MenuItem
                                            value={value._id}
                                            key={value._id}
                                        >{value.name}</MenuItem>))}
                                    </Select>
                                )} />
                            {errors.rol && <FormHelperText sx={{ color: 'error.main' }}>{errors.rol.message}</FormHelperText>}
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
    </Box>)
}
export default AddUser;