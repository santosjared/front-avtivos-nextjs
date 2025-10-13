
import { Box, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { AppDispatch } from "src/store"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { instance } from "src/configs/axios"

interface LocationType {
    _id: string
    name: string
}

interface defaultValuesType {
    date: string
    time: string
    user_rec: string
    location: LocationType
    description: string
    otherLocation: string

}

interface Props {
    toggle: () => void
    selectIds: string[]
}

const today = new Date().toISOString().split('T')[0]
const now = new Date();
const currentTime = now.toTimeString().slice(0, 5);

const defaultValues: defaultValuesType = {
    date: today,
    time: currentTime,
    user_rec: '',
    location: { _id: '', name: '' },
    description: '',
    otherLocation: ''
}



const AddEntrega = ({ toggle, selectIds }: Props) => {

    const [location, setLocation] = useState<LocationType[]>([])

    const schema = yup.object().shape({
        name: yup.string()
            .required('El campo nombre es requerido')
            .min(3, ''),
        description: yup
            .string()
            .transform(value => (value?.trim() === '' ? undefined : value))
            .min(10, 'El campo descripción debe tener al menos 10 caracteres')
            .notRequired()
    })

    const theme = useTheme()

    useEffect(() => {
        const fectLocation = async () => {
            try {
                const response = await instance.get('/activos/location')
                const data = response.data
                setLocation([...data, { name: 'otro', _id: 'otro' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectLocation();
    }, [toggle])

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

    const onSubmit = (data: defaultValuesType) => {
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
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="user_rec"
                                    control={control}
                                    rules={{ required: 'Este campo es obligatorio' }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Usuario que recibe'
                                            placeholder="Sof. Sup. Jhon Doh"
                                            onChange={onChange}
                                            error={Boolean(errors.user_rec)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.user_rec && <FormHelperText sx={{ color: 'error.main' }}>{errors.user_rec.message}</FormHelperText>}
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
                                {errors.location && <FormHelperText sx={{ color: 'error.main' }}>{errors.location?.message || errors.location.name?.message || errors.location._id?.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        {otherLocation?.name == 'otro' &&
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
                            startIcon={<Icon icon='mdi:content-save' />}
                        >
                            Guardar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddEntrega
