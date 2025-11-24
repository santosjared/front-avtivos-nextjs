
import { Box, Button, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from "@mui/material"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'


interface defaultValuesType {
    date: string
    time: string
    description: string
}

const now = new Date();

const today = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().slice(0, 5);

const defaultValues: defaultValuesType = {
    date: today,
    time: currentTime,
    description: ''
}

interface Props {
    toggle: () => void
    handleSave: (data: defaultValuesType) => void
}

const schema = yup.object().shape({
    date: yup
        .date()
        .typeError('Por favor, ingrese una fecha válida')
        .required('La fecha de entrega es obligatoria'),

    time: yup
        .string()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ingrese una hora válida (HH:mm)')
        .required('La hora de entrega es obligatoria'),

    description: yup
        .string()
        .trim()
        .transform((value) => (value?.trim() === '' ? undefined : value))
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no debe superar los 1000 caracteres')
        .notRequired(),
})


const AddDevolucion = ({ toggle, handleSave }: Props) => {

    const theme = useTheme()

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<defaultValuesType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const onSubmit = (data: defaultValuesType) => {
        const payload = {
            ...data,
            date: typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0]
        }
        handleSave(payload)
    }

    const handleOnclickCancel = () => {
        reset();
        toggle();
    };

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Realizar Devolucion</Typography>
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
                                            label='Fecha de devolución'
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
                                            label='Hora de la devolución'
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

export default AddDevolucion
