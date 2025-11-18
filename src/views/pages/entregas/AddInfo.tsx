
import { Box, Button, CircularProgress, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { instance } from "src/configs/axios"
import { GradeType } from "src/types/types"

interface LocationType {
    _id: string
    name: string
}

interface UserType {
    _id?: string
    grade: GradeType | null
    name: string
    lastName: string
    ci: string
    otherGrade?: string
}
interface InfoEntegaType {
    code: string
    date: string
    time: string
    user_en: UserType | null
    user_rec: UserType | null
    location: LocationType | null
    description: string
    otherLocation: string
}

interface defaultValuesType {
    date: string,
    time: string,
    location: LocationType | null,
    description: string,
    otherLocation: string,
}
const now = new Date();

const today = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().slice(0, 5);

const defaultValues: defaultValuesType = {
    date: today,
    time: currentTime,
    location: null,
    description: '',
    otherLocation: '',
}

interface Props {
    toggle: () => void
    open: boolean
    entrega: InfoEntegaType | null
    setEntrega: React.Dispatch<React.SetStateAction<InfoEntegaType | null>>;
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

    location: yup.object({
        _id: yup.string().required(),
        name: yup.string().required(),
    })
        .nullable()
        .required('Seleccione el lugar donde se entrega el activo'),

    otherLocation: yup.string()
        .trim()
        .when('location.name', {
            is: (val: string | undefined) => val === 'OTRO',
            then: (s) =>
                s.required('Por favor, especifique la ubicación donde se entrega el activo')
                    .min(3, 'La ubicación debe tener al menos 3 caracteres')
                    .max(50, 'La ubicación no debe exceder los 50 caracteres'),
            otherwise: (s) => s.notRequired(),
        }),

    description: yup.string()
        .transform(value => value ?? '')
        .test('empty-or-valid', 'La descripción debe tener al menos 10 caracteres', value => {
            if (!value) return true;
            return value.trim().length >= 10;
        })
        .max(1000, 'La descripción no debe superar los 1000 caracteres')
        .notRequired(),
});


const AddInfo = ({ toggle, open, entrega, setEntrega }: Props) => {

    const [location, setLocation] = useState<LocationType[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [moreLocation, setMoreLocation] = useState<boolean>(true)
    const [pageLocation, setPageLocation] = useState<number>(0)

    const limit = 10

    const theme = useTheme()

    const fetchLocation = async () => {
        setLoading(true);

        try {
            const response = await instance.get('/activos/location', {
                params: { skip: pageLocation * limit, limit }
            });

            const data = response.data;

            if (data.result?.length < limit) {
                setMoreLocation(false);
            }
            setLocation(prev => {
                const merged = [...prev, ...(data.result || [])];

                return merged.filter(
                    (item, index, arr) =>
                        index === arr.findIndex(i => i._id === item._id)
                );
            });

        } catch (error) {
            console.error('error al extraer categorias', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pageLocation > 0) {
            fetchLocation();
        }
    }, [pageLocation]);

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
    });

    useEffect(() => {
        if (open) {
            setLocation([])
            setMoreLocation(true)
            setPageLocation(0)
            fetchLocation()
        }
        if (open && entrega?.otherLocation || entrega?.location) {
            const data: defaultValuesType = {
                date: typeof entrega.date === 'string' ? entrega.date : new Date(entrega.date).toISOString().split('T')[0],
                time: entrega.time || currentTime,
                location: entrega.location || null,
                description: entrega.description || '',
                otherLocation: entrega.otherLocation || ''
            }
            reset({ ...data })
        }
    }, [open])


    const handleScrollLocation = (event: any) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;

        const isBottom = scrollHeight - scrollTop <= clientHeight + 5;

        if (isBottom && moreLocation) {
            setPageLocation(prev => prev + 1);
        }
    }

    const onSubmit = (data: defaultValuesType) => {
        setEntrega(prev => ({
            ...prev!,
            ...data
        }));
        handleOnclickCancel()
    }


    const handleOnclickCancel = () => {
        reset({ ...defaultValues })
        toggle();
    };


    const otherLocation = watch('location');

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Iformación de la entrega</Typography>
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
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="location-select">Ubicacion</InputLabel>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            labelId="location-select"
                                            id="select-location"
                                            label="Ubicación"
                                            value={value?._id ?? ''}
                                            error={Boolean(errors.location)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                if (selectedId === 'Other') {
                                                    onChange({ name: 'OTRO', _id: 'Other' })
                                                    return
                                                }

                                                const selectedLocation = location.find((loc) => loc._id === selectedId) || null
                                                onChange(selectedLocation)
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: { maxHeight: 300 },
                                                    onScroll: handleScrollLocation
                                                }
                                            }}
                                        >
                                            {location.map((loc, index) => (
                                                <MenuItem value={loc._id || ''} key={index}>{loc.name}</MenuItem>
                                            ))}
                                            {loading && (
                                                <MenuItem disabled><CircularProgress /></MenuItem>
                                            )}
                                            <MenuItem value="Other">OTRO</MenuItem>
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
                                            placeholder='Descripción de la entrega (opcional)'
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
