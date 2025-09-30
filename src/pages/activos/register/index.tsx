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
import baseUrl from 'src/configs/environment'


interface CategoryType {
    _id: string
    name: string
}

interface StatusType {
    _id: string
    name: string
}

interface ActivosType {
    _id?: string
    code: string,
    name: string,
    location: string,
    price_a: number,
    date_a: string,
    date_e: string,
    cantidad: number,
    image: File | null,
    imageUrl: string | null,
    status: StatusType
    otherStatus: string,
    category: CategoryType
    otherCategory: string
    description: string
}

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: ActivosType;
}


const schema = yup.object().shape({
    code: yup
        .string()
        .required('El campo código es requerido')
        .min(4, 'El campo código debe tener al menos 4 caracteres')
        .max(16, 'El campo código no debe exceder 16 caracteres'),

    name: yup
        .string()
        .required('El campo nombre es requerido')
        .min(2, 'El campo nombre debe tener al menos 3 caracteres'),

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

    cantidad: yup
        .number()
        .typeError('El campo cantidad debe ser un número')
        .required('El campo cantidad es requerido')
        .positive('La cantidad debe ser un número positivo'),

    image: yup
        .mixed<File>()
        .test('fileSize', 'El archivo es muy grande (máximo 2MB)', value => {
            if (!value) return true
            return (value as File).size <= 2 * 1024 * 1024
        })
        .test('fileType', 'Formato no soportado (solo JPG/PNG)', value => {
            if (!value) return true
            return ['image/jpeg', 'image/png', 'image/jpg'].includes((value as File).type)
        })
        .notRequired(),

    category: yup
        .object({
            _id: yup.string().required(),
            name: yup.string().required()
        })
        .required('El campo categoría es requerido'),

    otherCategory: yup
        .string()
        .when('category', {
            is: (val: unknown) => (val as CategoryType)?.name === 'otro',
            then: schema =>
                schema
                    .required('El campo otra categoría es requerido')
                    .min(3, 'Debe tener al menos 3 caracteres'),
            otherwise: schema => schema.notRequired()
        }),

    status: yup
        .object({
            _id: yup.string().required(),
            name: yup.string().required()
        })
        .required('El campo estado es requerido'),

    otherStatus: yup
        .string()
        .when('status', {
            is: (val: unknown) => (val as StatusType)?.name === 'otro',
            then: schema =>
                schema
                    .required('El campo otro estado es requerido')
                    .min(3, 'Debe tener al menos 3 caracteres'),
            otherwise: schema => schema.notRequired()
        }),

    description: yup
        .string()
        .transform(value => (value?.trim() === '' ? undefined : value))
        .min(10, 'El campo descripción debe tener al menos 10 caracteres')
        .notRequired()
})



const AddActivos = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const [imagePrev, setImagePre] = useState<string | null>(defaultValues?.imageUrl || null)
    const [category, setCategory] = useState<CategoryType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])

    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/activos/category')
                const data = response.data
                setCategory([...data, { name: 'otro', _id: 'otro' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [mode, toggle])

    useEffect(() => {
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status')
                const data = response.data
                setStatus([...data, { name: 'otro', _id: 'otro' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectStatus();
    }, [mode, toggle])

    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ActivosType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const otherCategory = watch('category')
    const otherStatus = watch('status')

    useEffect(() => {
        reset(defaultValues)
        if (defaultValues?.imageUrl) {
            setImagePre(`${baseUrl().backendURI}/images/${defaultValues?.imageUrl}`)
        }
    }, [defaultValues, mode, toggle])

    const onSubmit = (data: ActivosType) => {

        const formData = new FormData()

        formData.append('code', data.code)
        formData.append('name', data.name)
        formData.append('location', data.location)
        formData.append('price_a', data.price_a.toString())
        formData.append('cantidad', data.cantidad.toString())
        formData.append('date_a', new Date(data.date_a).toISOString())
        formData.append('date_e', new Date(data.date_e).toISOString())
        formData.append('category', data.category?.name || '')
        formData.append('otherCategory', data.otherCategory)
        formData.append('status', data.status?.name || '')
        formData.append('otherStatus', data.otherStatus)

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
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode == 'create' ? 'Agregar Nuevo Activo' : 'Editar Activo'}</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <label htmlFor="upload-image" style={{ cursor: 'pointer' }}>
                            {imagePrev ?
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mt: 2,
                                    mb: 4,
                                    borderRadius: '10px'
                                }}>
                                    <img
                                        src={imagePrev}
                                        alt="Vista previa"
                                        style={{ maxWidth: '100%', height: '200px', borderRadius: 10 }}
                                    />
                                    {errors.image && <FormHelperText sx={{ color: 'error.main' }}>{errors.image.message}</FormHelperText>}
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
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        labelId="category-select"
                                        id="select-category"
                                        label="Categoria"
                                        value={value?._id ?? ''}
                                        error={Boolean(errors.category)}
                                        onChange={(e) => {
                                            const selectedId = e.target.value as string
                                            const selectedCategory = category.find((cat) => cat._id === selectedId) || null
                                            onChange(selectedCategory)
                                        }}
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
                    {otherCategory?.name == 'otro' &&
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="otherCategory"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Especifica otra categoria'
                                            onChange={onChange}
                                            error={Boolean(errors.otherCategory)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.otherCategory && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherCategory.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    }
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="status-select">Estado</InputLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        labelId="status-select"
                                        id="select-status"
                                        label="Estado"
                                        value={value?._id ?? ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value as string
                                            const selectedStatus = status.find((statu) => statu._id === selectedId) || null
                                            onChange(selectedStatus)
                                        }}
                                        error={Boolean(errors.status)}
                                    >
                                        {status.map((st) => (
                                            <MenuItem value={st._id} key={st._id}>{st.name}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.status && (
                                <FormHelperText sx={{ color: 'error.main' }}>
                                    {errors.status.message}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    {otherStatus?.name == 'otro' &&
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="otherStatus"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Especifica otro estado'
                                            onChange={onChange}
                                            error={Boolean(errors.otherStatus)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.otherStatus && <FormHelperText sx={{ color: 'error.main' }}>{errors.otherStatus.message}</FormHelperText>}
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