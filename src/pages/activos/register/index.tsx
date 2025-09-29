import { Box, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux';
import { AppDispatch } from "src/store";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'
import { addActivos, updateActivos } from "src/store/activos";
import { instance } from "src/configs/axios";

interface ActivosType {
    code: string,
    name: string,
    location: string,
    price_a: number,
    date_a: string,
    date_e: string,
    status: string,
    lote: string,
    cantidad: number,
    image: File | null
    imageUrl: string | null
    category: string
    otherCategory: string
    _id?: string,
    __v?: string
}

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: ActivosType;
}

interface CategoryType {
    _id: string
    name: string
}

const schema = yup.object().shape({
    code: yup
        .string()
        .required('El campo código es requerido')
        .min(4, 'El campo código debe tener al menos 4 caracteres')
        .max(8, 'El campo código no debe exceder 8 caracteres'),

    name: yup
        .string()
        .required('El campo nombre es requerido')
        .min(2, 'El campo nombre debe tener al menos 2 caracteres'),

    location: yup
        .string()
        .required('El campo ubicación es requerido')
        .min(2, 'El campo ubicación debe tener al menos 2 caracteres'),

    price_a: yup
        .number()
        .typeError('El campo precio debe ser un número')
        .required('El campo precio de adquisición es requerido')
        .positive('El precio debe ser un número positivo'),

    date_a: yup
        .date()
        .typeError('La fecha de adquisición no es válida')
        .required('El campo fecha de adquisición es requerido'),

    date_e: yup
        .date()
        .typeError('La fecha de expiración no es válida')
        .required('El campo fecha de expiración es requerido'),
    lote: yup
        .string()
        .required('El campo lote es requerido'),
    cantidad: yup.number()
        .typeError('El campo cantidad debe ser un número')
        .required('El campo cantidad de adquisición es requerido')
        .positive('La cantidad debe ser un número positivo'),
    image: yup
        .mixed()
        .required('La imagen es obligatoria')
        .test('fileSize', 'El archivo es muy grande (máximo 2MB)', value => {
            if (!value) return false
            return value.size <= 2 * 1024 * 1024
        })
        .test('fileType', 'Formato no soportado (solo JPG/PNG)', value => {
            if (!value) return false
            return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
        })
})



const AddActivos = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const [imagePrev, setImagePre] = useState<string | null>(defaultValues?.imageUrl || null)
    const [category, setCategory] = useState<CategoryType[]>([])

    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/activos/category')
                const data = response.data
                setCategory([...data, { name: 'otro', _id: '0' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [mode])

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<ActivosType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, mode])

    const onSubmit = (data: ActivosType) => {

        const formData = new FormData()

        formData.append('code', data.code)
        formData.append('name', data.name)
        formData.append('location', data.location)
        formData.append('price_a', data.price_a.toString())
        formData.append('lote', data.lote)
        formData.append('cantidad', data.cantidad.toString())
        formData.append('date_a', new Date(data.date_a).toISOString())
        formData.append('date_e', new Date(data.date_e).toISOString())
        formData.append('category', data.category)
        formData.append('otherCategory', data.otherCategory)

        if (data.image instanceof File) {
            formData.append('image', data.image)
        }

        if (mode === 'edit' && defaultValues?._id) {
            dispatch(updateActivos({ data: formData, id: defaultValues._id, filtrs: { skip: page * pageSize, limit: pageSize } }))
        } else {
            dispatch(addActivos({ data: formData, filtrs: { skip: page * pageSize, limit: pageSize } }))
        }

        toggle()
        reset()
        setImagePre(null)
    }
    const handleOnclickCancel = () => {
        reset()
        toggle()
        setImagePre(null)
    }

    return (<Box>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>Agregar Nuevo Usuario</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <label htmlFor="upload-image" style={{ cursor: 'pointer' }}>
                            {imagePrev ?
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4, borderRadius: '10px' }}>
                                    <img
                                        src={imagePrev}
                                        alt="Vista previa"
                                        style={{ maxWidth: '100%', height: '200px', borderRadius: 10 }}
                                    />
                                </Box>
                                :
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        border: theme => `1px dashed ${errors.image ? theme.palette.error.main : theme.palette.secondary.main}`,
                                        borderRadius: 1,
                                        justifyContent: 'center',
                                        padding: 2,
                                        mb: 6
                                    }}
                                >
                                    <Icon icon='mdi:cloud' />
                                    <Typography variant="subtitle2">Seleccionar imagen</Typography>
                                    {errors.image && <FormHelperText sx={{ color: 'error.main' }}>{errors.image.message}</FormHelperText>}
                                </Box>}
                        </label>
                        <Controller
                            name="image"
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { onChange } }) => (
                                <input
                                    id="upload-image"
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onChange(file);
                                            setImagePre(URL.createObjectURL(file))
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="code"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Codigo'
                                        placeholder='xyz-345'
                                        onChange={onChange}
                                        error={Boolean(errors.code)}
                                        value={value}

                                    />
                                )}
                            />
                            {errors.code && <FormHelperText sx={{ color: 'error.main' }}>{errors.code.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Nombre'
                                        placeholder='Mesa'
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
                                name="location"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Ubicacion'
                                        placeholder='Bomberos'
                                        onChange={onChange}
                                        error={Boolean(errors.location)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.location && <FormHelperText sx={{ color: 'error.main' }}>{errors.location.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="price_a"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Precio de Aquicicion'
                                        type="number"
                                        onChange={onChange}
                                        value={value}
                                        error={Boolean(errors.price_a)}
                                    />
                                )}
                            />
                            {errors.price_a && <FormHelperText sx={{ color: 'error.main' }}>{errors.price_a.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="lote"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Lote'
                                        placeholder="6"
                                        onChange={onChange}
                                        value={value}
                                        error={Boolean(errors.lote)}
                                    />
                                )}
                            />
                            {errors.lote && <FormHelperText sx={{ color: 'error.main' }}>{errors.lote.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }} >
                            <Controller
                                name="cantidad"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Cantidad'
                                        type="number"
                                        onChange={onChange}
                                        value={value}
                                        error={Boolean(errors.cantidad)}
                                    />
                                )}
                            />
                            {errors.cantidad && <FormHelperText sx={{ color: 'error.main' }}>{errors.cantidad.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="date_a"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Fecha de Aquicicion'
                                        type="date"
                                        onChange={onChange}
                                        error={Boolean(errors.date_a)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.date_a && <FormHelperText sx={{ color: 'error.main' }}>{errors.date_a.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <Controller
                                name="date_e"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Fecha de Expiracion'
                                        type="date"
                                        onChange={onChange}
                                        error={Boolean(errors.date_e)}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.date_e && <FormHelperText sx={{ color: 'error.main' }}>{errors.date_e.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="category-select">Categoria</InputLabel>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        labelId="category-select"
                                        id="select-category"
                                        label="Categoria"
                                        error={Boolean(errors.category)}
                                    >
                                        {category.map((cat, index) => (
                                            <MenuItem value={cat._id || ''} key={index}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.category && <FormHelperText sx={{ color: 'error.main' }}>{errors.category.message}</FormHelperText>}
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
export default AddActivos;