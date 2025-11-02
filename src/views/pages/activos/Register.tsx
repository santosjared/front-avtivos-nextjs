import { Autocomplete, Box, Button, FormControl, FormHelperText, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material"
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

interface SubCategoryType {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id: string
    name: string,
    util: number,
    subcategory: SubCategoryType[]
    description?: string
}

interface StatusType {
    _id: string
    name: string
}

interface LocationType {
    _id: string
    name: string
}

interface GradeType {
    name: string
    _id: string
}

interface ResponsableType {
    _id: string
    grade: GradeType
    name: string
    lastName: string
}

interface ActivosType {
    _id?: string
    code: string,
    responsable: ResponsableType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    image: File | null,
    imageUrl: string | null,
    status: StatusType | null
    otherStatus: string,
    category: ContableType | null
    subcategory: SubCategoryType | null
    otherLocation: string
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
        .min(2, 'El campo nombre debe tener al menos 2 caracteres')
        .max(50, 'El campo nombre no debe exceder mas de 50 caracteres'),

    location: yup
        .object({
            _id: yup.string().required('Seleccione el lugar donde se encuentra el activo'),
            name: yup.string().required('Seleccione el lugar donde se encuentra el activo')
        })
        .required('Seleccione el lugar donde se encuentra el activo')
        .nullable(),
    otherLocation: yup
        .string()
        .when('location', {
            is: (val: unknown) => (val as LocationType)?.name === 'otro',
            then: schema =>
                schema
                    .required('Debe espefificar el lugar donde se encuentra el activo')
                    .min(3, 'El lugar donde se encuentra al menos debe tener 3 caracteres')
                    .max(50, 'El lugar donde se encuentra el activo no debe exceder mas de 50 caracteres'),
            otherwise: schema => schema.notRequired()
        }),
    price_a: yup
        .number()
        .typeError('El campo precio debe ser un número')
        .required('El campo precio de adquisición es requerido')
        .positive('El precio debe ser un número positivo'),

    date_a: yup
        .date()
        .typeError('La fecha de adquisición no es válida')
        .required('El campo fecha de adquisición es requerido'),
    image: yup
        .mixed<File>()
        .test('fileSize', 'El archivo es muy grande (máximo 12MB)', value => {
            if (!value) return true
            return (value as File).size <= 12 * 1024 * 1024
        })
        .test('fileType', 'Formato no soportado (solo JPG/PNG o JPEG)', value => {
            if (!value) return true
            return ['image/jpeg', 'image/png', 'image/jpg'].includes((value as File).type)
        })
        .notRequired(),

    category: yup
        .object({
            _id: yup.string().required('Seleccione una categoría del activo'),
            name: yup.string().required('Seleccione una categoría del activo')
        })
        .required('Seleccione una categoría del activo'),
    subcategory: yup
        .object()
        .notRequired()
        .nullable(),

    status: yup
        .object({
            _id: yup.string().required('Seleccione un estado del activo'),
            name: yup.string().required('Seleccione un estado del activo')
        })
        .required('Seleccione un estado del activo'),

    otherStatus: yup
        .string()
        .when('status', {
            is: (val: unknown) => (val as StatusType)?.name === 'otro',
            then: schema =>
                schema
                    .required('Debe espificicar el otro estado del activo')
                    .min(3, 'El estado del activo debe ser al menos de 3 caracteres')
                    .max(50, 'El estado del activo no debe exceder mas de 50 caracteres'),
            otherwise: schema => schema.notRequired()
        }),
    responsable: yup
        .object({
            _id: yup.string().required('Seleccione un responsable para el activo'),
            name: yup.string().notRequired(),
            grade: yup.object().notRequired(),
            lastName: yup.string().notRequired(),
        })
        .required('Seleccione un responsable para el activo')
        .nullable(),
    description: yup
        .string()
        .transform(value => (value?.trim() === '' ? undefined : value))
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no debe superar los 1000 caracteres')
        .notRequired()
})



const AddActivos = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const [imagePrev, setImagePre] = useState<string | null>(defaultValues?.imageUrl || null)
    const [category, setCategory] = useState<ContableType[]>([])
    const [status, setStatus] = useState<StatusType[]>([])
    const [location, setLocation] = useState<LocationType[]>([])
    const [responsable, setResponsable] = useState<ResponsableType[]>([])

    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    useEffect(() => {
        const fectCategory = async () => {
            try {
                const response = await instance.get('/contables')
                const data = response.data
                setCategory(data || [])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectCategory();
    }, [])

    useEffect(() => {
        const fectStatus = async () => {
            try {
                const response = await instance.get('/activos/status')
                const data = response.data
                setStatus([...data, { name: 'Otro', _id: 'otro' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectStatus();
    }, [mode, toggle])

    useEffect(() => {
        const fectLocation = async () => {
            try {
                const response = await instance.get('/activos/location')
                const data = response.data
                setLocation([...data, { name: 'OTRO', _id: 'Other' }])
            } catch (error) {
                console.error('error al extraer categorias', error)
            }
        }
        fectLocation();
    }, [mode, toggle])

    useEffect(() => {
        const fectUsers = async () => {
            try {
                const response = await instance.get('/users/all-users')
                const data = response.data
                setResponsable(data)
            } catch (error) {
                console.error('error al extraer los usuarios', error)
            }
        }
        fectUsers();
    }, [])

    const {
        reset,
        control,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        formState: { errors }
    } = useForm<ActivosType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    const selectCategory = watch('category')
    const otherStatus = watch('status')
    const otherLocation = watch('location')

    useEffect(() => {
        reset(defaultValues)
        if (defaultValues?.imageUrl) {
            setImagePre(`${baseUrl().backendURI}/images/${defaultValues?.imageUrl}`)
        } else {
            setImagePre(defaultValues?.imageUrl || null)
        }
    }, [defaultValues, mode, toggle])

    useEffect(() => {
        return () => {
            if (imagePrev) URL.revokeObjectURL(imagePrev);
        };
    }, [imagePrev]);

    const onSubmit = (data: ActivosType) => {

        const formData = new FormData()

        formData.append('code', data.code)
        formData.append('name', data.name)
        formData.append('location', data.location?._id || '')
        formData.append('price_a', data.price_a.toString())
        formData.append('date_a', new Date(data.date_a).toISOString())
        formData.append('category', data.category?._id || '')
        formData.append('status', data.status?._id || '')
        formData.append('responsable', data.responsable?._id || '')

        if (data.description) {
            formData.append('description', data.description)
        }
        if (data.subcategory) {
            formData.append('subcategory', data.subcategory?._id || '')
        }
        if (data.otherStatus) {
            formData.append('otherStatus', data.otherStatus)
        }
        if (data.otherLocation) {
            formData.append('otherLocation', data.otherLocation)
        }
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

    const handleRemoveImage = () => {
        setImagePre(null);
        setValue('image', null);
        clearErrors('image');
    };


    return (<Box>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode == 'create' ? 'Agregar Nuevo Activo Fijo' : 'Editar Activo Fijo'}</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {imagePrev ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        mt: 2,
                                        mb: 4,
                                        borderRadius: errors.image ? 0 : 2,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <img
                                        src={imagePrev}
                                        alt="Vista previa"
                                        style={{
                                            width: '100%',
                                            height: errors.image ? '50px' : '220px',
                                            borderRadius: 8,
                                            display: 'block',
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleRemoveImage}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: theme.palette.error.main,
                                            color: theme.palette.error.contrastText,
                                            boxShadow: 2,
                                            '&:hover': {
                                                backgroundColor: theme.palette.error.light,
                                            },
                                        }}
                                        size="small"
                                    >
                                        <Icon icon="mdi:close" />
                                    </IconButton>

                                    {errors.image && (
                                        <FormHelperText sx={{ color: 'error.main', textAlign: 'center', mt: 1 }}>
                                            {errors.image.message}
                                        </FormHelperText>
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <label htmlFor="upload-image" style={{ cursor: 'pointer', width: '100%' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: theme =>
                                            `1px dashed ${errors.image ? theme.palette.error.main : theme.palette.secondary.main
                                            }`,
                                        borderRadius: 2,
                                        padding: 3,
                                        mb: 4,
                                        textAlign: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Icon icon="mdi:cloud-upload" />
                                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                        Seleccionar imagen del activo fijo
                                    </Typography>
                                    {errors.image && (
                                        <FormHelperText sx={{ color: 'error.main' }}>{errors.image.message}</FormHelperText>
                                    )}
                                </Box>
                            </label>
                        )}
                        <Controller
                            name="image"
                            control={control}
                            rules={{ required: false }}
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
                                            setImagePre(URL.createObjectURL(file));
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
                                        label='Código del activo'
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
                                        label='Nombre del activo'
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
                            <InputLabel id="location-select">Ubicación del activo</InputLabel>
                            <Controller
                                name="location"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        labelId="location-select"
                                        id="select-location"
                                        label="Ubicación del activo"
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
                            {!errors.location && <FormHelperText sx={{ color: 'secondary.main' }}>lugar donde se encuentra el activo</FormHelperText>}
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
                                            label='Especifica otra ubicación del activo'
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
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="price_a"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Precio de Adquisición'
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
                                name="date_a"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Fecha de Adquisición'
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
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="category-select">Categoria</InputLabel>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        labelId="category-select"
                                        id="select-category"
                                        label="Categoría"
                                        value={value?._id ?? ''}
                                        error={Boolean(errors.category)}
                                        onChange={(e) => {
                                            const selectedId = e.target.value as string
                                            const selectedCategory = category.find((cat) => cat._id === selectedId) || null
                                            onChange(selectedCategory)
                                            setValue('subcategory', null)
                                        }}
                                    >
                                        {category.map((cat, index) => (
                                            <MenuItem value={cat._id || ''} key={index}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.category && <FormHelperText sx={{ color: 'error.main' }}>{errors.category?.message || errors.category.name?.message || errors.category._id?.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {selectCategory && selectCategory?.subcategory?.length > 0 && (
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="subcategory-select">Sub Categoría</InputLabel>
                                <Controller
                                    name="subcategory"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            labelId="subcategory-select"
                                            id="select-subcategory"
                                            label="Sub Categoría"
                                            value={value?._id ?? ''}
                                            error={Boolean(errors.subcategory)}
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string
                                                const selectedSubCategory =
                                                    selectCategory?.subcategory.find((sub) => sub._id === selectedId) || null
                                                onChange(selectedSubCategory)
                                            }}
                                        >
                                            {selectCategory?.subcategory.map((sub, index) => (
                                                <MenuItem key={index} value={sub._id}>
                                                    {sub.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.subcategory && (
                                    <FormHelperText sx={{ color: 'error.main' }}>
                                        {errors.subcategory?.message ||
                                            errors.subcategory?.name?.message ||
                                            errors.subcategory?._id?.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id="status-select">Estado de activo</InputLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        labelId="status-select"
                                        id="select-status"
                                        label="Estado del activo"
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
                            {errors.status && <FormHelperText sx={{ color: 'error.main' }}>{errors.status?.message || errors.status.name?.message || errors.status._id?.message}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {otherStatus?.name == 'Otro' &&
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="otherStatus"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Especifica otro estado del activo'
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
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="responsable"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Autocomplete
                                        options={responsable}
                                        getOptionLabel={(option) =>
                                            option ? `${option.grade?.name || ''} ${option.name || ''} ${option.lastName || ''}` : ''
                                        }
                                        value={value || null}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                        onChange={(_, newValue) => onChange(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Responsable"
                                                error={Boolean(errors.responsable)}
                                                helperText={
                                                    errors.responsable?.message ||
                                                    errors.responsable?.name?.message ||
                                                    errors.responsable?._id?.message
                                                }
                                            />
                                        )}
                                    />
                                )}
                            />
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