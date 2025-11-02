
import { Box, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { AppDispatch } from "src/store"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { instance } from "src/configs/axios"
import { GradeType } from "src/types/types"

interface LocationType {
    _id: string
    name: string
}

interface defaultValuesType {
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


const today = new Date().toISOString().split('T')[0]
const now = new Date();
const currentTime = now.toTimeString().slice(0, 5);

const defaultValues: defaultValuesType = {
    date: today,
    time: currentTime,
    grade: null,
    name: '',
    lastName: '',
    location: null,
    description: '',
    otherLocation: '',
    otherGrade: ''
}

interface Props {
    toggle: () => void
    handleSave: (data: defaultValuesType) => void
}

const AddEntrega = ({ toggle, handleSave }: Props) => {

    const [location, setLocation] = useState<LocationType[]>([])
    const [grades, setGrades] = useState<GradeType[]>([])

    const schema = yup.object().shape({
        date: yup
            .date()
            .typeError('Por favor, ingrese una fecha válida')
            .required('La fecha de entrega es obligatoria'),

        time: yup
            .string()
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ingrese una hora válida (HH:mm)')
            .required('La hora de entrega es obligatoria'),

        grade: yup
            .object({
                _id: yup.string().required(),
                name: yup.string().required(),
            })
            .nullable()
            .required('Debe seleccionar el grado del usuario que recibe'),

        otherGrade: yup
            .string()
            .when('grade', {
                is: (val: unknown) => (val as GradeType)?.name === 'Otro',
                then: (schema) =>
                    schema
                        .required('Por favor, especifique el grado del usuario que recibe')
                        .min(2, 'El grado debe tener al menos 2 caracteres')
                        .max(50, 'El grado no debe exceder los 50 caracteres'),
                otherwise: (schema) => schema.notRequired(),
            }),

        name: yup
            .string()
            .required('El nombre del usuario que recibe es obligatorio')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(50, 'El nombre no debe superar los 50 caracteres'),

        lastName: yup
            .string()
            .required('El apellido del usuario que recibe es obligatorio')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
            .min(2, 'El apellido debe tener al menos 2 caracteres')
            .max(50, 'El apellido no debe superar los 50 caracteres'),

        location: yup
            .object({
                _id: yup.string().required(),
                name: yup.string().required(),
            })
            .nullable()
            .required('Seleccione el lugar donde se entrega el activo'),

        otherLocation: yup
            .string()
            .when('location', {
                is: (val: unknown) => (val as LocationType)?.name === 'OTRO',
                then: (schema) =>
                    schema
                        .required('Por favor, especifique la ubicación donde se entrega el activo')
                        .min(3, 'La ubicación donde se entrega el activo debe tener al menos 3 caracteres')
                        .max(50, 'La ubicación donde se entrega el activo no debe exceder los 50 caracteres'),
                otherwise: (schema) => schema.notRequired(),
            }),

        description: yup
            .string()
            .transform((value) => (value?.trim() === '' ? undefined : value))
            .min(10, 'La descripción debe tener al menos 10 caracteres')
            .max(1000, 'La descripción no debe superar los 1000 caracteres')
            .notRequired(),
    })


    const theme = useTheme()

    useEffect(() => {
        const fectLocation = async () => {
            try {
                const response = await instance.get('/activos/location')
                const data = response.data
                setLocation([...data, { name: 'OTRO', _id: 'otro' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectLocation();
    }, [toggle])
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
    }, [defaultValues, toggle])

    const dispatch = useDispatch<AppDispatch>()

    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<defaultValuesType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })
    const otherGrade = watch('grade')

    const onSubmit = (data: defaultValuesType) => {
        handleSave(data);
        toggle()
        reset()
    }
    const otherLocation = watch('location');

    const handleOnclickCancel = () => {
        reset()
        toggle()
    }

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Realizar entrega</Typography>
                    </legend>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="date"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Fecha de entrega'
                                            type="date"
                                            onChange={onChange}
                                            error={Boolean(errors.date)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.date && <FormHelperText sx={{ color: 'error.main' }}>{errors.date.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="time"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Hora de la entrega'
                                            type="time"
                                            onChange={onChange}
                                            error={Boolean(errors.time)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.time && <FormHelperText sx={{ color: 'error.main' }}>{errors.time.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
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
                                />{!errors.grade && <FormHelperText sx={{ color: 'secondary.main' }}>Grado del usuario que recibe</FormHelperText>}
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
                                    {!errors.otherGrade && <FormHelperText sx={{ color: 'secondary.main' }}>Especifica el grado del usuario que recibe</FormHelperText>}
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
                                {!errors.name && <FormHelperText sx={{ color: 'secondary.main' }}>Nombre del usuario que recibe</FormHelperText>}
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
                                {!errors.lastName && <FormHelperText sx={{ color: 'secondary.main' }}>Apellido del usuario que recibe</FormHelperText>}
                                {errors.lastName && <FormHelperText sx={{ color: 'error.main' }}>{errors.lastName.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="location-select">Ubicacion</InputLabel>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            labelId="location-select"
                                            id="select-location"
                                            label="Ubicacion"
                                            value={value?._id ?? ''}
                                            error={Boolean(errors.location)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedLocation = location.find((loc) => loc._id === selectedId) || null
                                                onChange(selectedLocation)
                                            }}
                                        >
                                            {location.map((loc, index) => (
                                                <MenuItem value={loc._id || ''} key={index}>{loc.name}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {!errors.location && <FormHelperText sx={{ color: 'secondary.main' }}>Lugar donde presta el activo</FormHelperText>}
                                {errors.location && <FormHelperText sx={{ color: 'error.main' }}>{errors.location?.message || errors.location.name?.message || errors.location._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherLocation?.name == 'OTRO' &&
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <Controller
                                        name="otherLocation"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange } }) => (
                                            <TextField
                                                label='Especifica otra ubicacion'
                                                onChange={onChange}
                                                error={Boolean(errors.otherLocation)}
                                                value={value}
                                            />
                                        )}
                                    />
                                    {!errors.otherLocation && <FormHelperText sx={{ color: 'secondary.main' }}>Especifica el lugar donde presta el activo</FormHelperText>}
                                    {errors.otherLocation && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherLocation.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Descripción'
                                            placeholder='Descripción del rol (opcional)'
                                            onChange={onChange}
                                            error={Boolean(errors.description)}
                                            value={value}
                                            multiline
                                            minRows={4}
                                        />
                                    )}
                                />
                                {errors.description && <FormHelperText sx={{ color: 'error.main' }}>{errors.description.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            size='large'
                            variant='outlined'
                            color='secondary'
                            onClick={handleOnclickCancel}
                            startIcon={<Icon icon='mdi:cancel-circle' />}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size='large'
                            type='submit'
                            variant='contained'
                            sx={{ mr: 3 }}
                            startIcon={<Icon icon='mdi:navigate-next' />}
                        >
                            Siguiente
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddEntrega
