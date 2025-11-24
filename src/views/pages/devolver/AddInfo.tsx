
import { Box, Button, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from "@mui/material"
import { useEffect } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { GradeType } from "src/types/types"

interface UserType {
    _id?: string
    grade: GradeType | null
    name: string
    lastName: string
    ci: string
}
interface InfoDevolucionType {
    code: string
    date: string
    time: string
    user_dev: UserType | null
    user_rec: UserType | null
    description: string
}

interface defaultValuesType {
    date: string,
    time: string,
    description: string,
}
const now = new Date();

const today = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().slice(0, 5);

const defaultValues: defaultValuesType = {
    date: today,
    time: currentTime,
    description: '',
}

interface Props {
    toggle: () => void
    open: boolean
    devolucion: InfoDevolucionType | null
    setDevolucion: React.Dispatch<React.SetStateAction<InfoDevolucionType | null>>;
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

    description: yup.string()
        .transform(value => value ?? '')
        .test('empty-or-valid', 'La descripción debe tener al menos 10 caracteres', value => {
            if (!value) return true;

            return value.trim().length >= 10;
        })
        .max(1000, 'La descripción no debe superar los 1000 caracteres')
        .notRequired(),
});


const AddInfo = ({ toggle, open, devolucion, setDevolucion }: Props) => {


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

    useEffect(() => {
        if (open && devolucion?.date || devolucion?.time) {
            const data: defaultValuesType = {
                date: typeof devolucion.date === 'string' ? devolucion.date : new Date(devolucion.date).toISOString().split('T')[0],
                time: devolucion.time || currentTime,
                description: devolucion.description || '',
            }
            reset({ ...data })
        }
    }, [open])


    const onSubmit = (data: defaultValuesType) => {
        setDevolucion(prev => ({
            ...prev!,
            ...data
        }));
        handleOnclickCancel()
    }


    const handleOnclickCancel = () => {
        reset({ ...defaultValues })
        toggle();
    };

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Iformación de la devolución</Typography>
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
                                            placeholder='Descripción del devolución (opcional)'
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
                            Aceptar
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddInfo
