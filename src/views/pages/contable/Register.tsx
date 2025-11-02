import { Box, Button, FormControl, FormHelperText, Grid, IconButton, TextField, Typography, useTheme } from "@mui/material"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux';
import { AppDispatch } from "src/store";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'

import { addContable, updateContable } from "src/store/contable";
import { useEffect } from "react";

interface SubCategory {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id?: string
    name: string,
    util: number,
    subcategory: SubCategory[]
    description?: string
}

interface Props {
    toggle: () => void;
    page: number;
    pageSize: number;
    mode?: 'create' | 'edit';
    defaultValues?: ContableType;
}

const schema = yup.object().shape({
    name: yup
        .string()
        .required('El nombre de la categoría es requerido')
        .min(3, 'Debe tener al menos 3 caracteres')
        .max(50, 'No debe superar los 50 caracteres'),

    util: yup
        .number()
        .transform(value => (typeof value === 'string' && value.trim() === '' ? undefined : value))
        .typeError('La vida útil debe ser un número')
        .positive('Debe ser un número positivo')
        .max(50, 'No puede ser mayor a 50 años')
        .when('subcategory', {
            is: (subcategory: unknown[]) => !subcategory || subcategory.length === 0,
            then: schema => schema.required('La vida útil es requerida si no hay subcategorías'),
            otherwise: schema => schema.notRequired()
        }),

    subcategory: yup.array().of(
        yup.object().shape({
            name: yup
                .string()
                .required('El nombre de la subcategoría es requerido')
                .min(3, 'Debe tener al menos 3 caracteres')
                .max(50, 'No debe superar los 50 caracteres'),
            util: yup
                .number()
                .transform(value => (typeof value === 'string' && value.trim() === '' ? undefined : value))
                .typeError('La vida útil debe ser un número')
                .required('La vida útil es requerida')
                .positive('Debe ser un número positivo')
                .max(50, 'No puede ser mayor a 50 años')
        })
    ).notRequired(),
    description: yup
        .string()
        .transform(value => (value?.trim() === '' ? undefined : value))
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no debe superar los 1000 caracteres')
        .notRequired()
})

const AddConatble = ({ toggle, page, pageSize, mode = 'create', defaultValues }: Props) => {

    const dispatch = useDispatch<AppDispatch>()
    const theme = useTheme()

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<ContableType>({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues])
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'subcategory'
    })
    const handleAdd = () => {
        append({ name: '', util: 0 })
    }
    const onSubmit = (data: ContableType) => {

        if (mode === 'edit' && defaultValues?._id) {
            const { _id, ...payload } = data
            dispatch(updateContable({ data: payload, id: defaultValues._id, filtrs: { skip: page * pageSize, limit: pageSize } }))
        } else {
            dispatch(addContable({ data, filtrs: { skip: page * pageSize, limit: pageSize } }))
        }

        toggle()
        reset()
    }
    const handleOnclickCancel = () => {
        reset({
            name: '',
            util: 0,
            description: '',
            subcategory: []
        })
        toggle()
    }


    return (<Box>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                <legend style={{ textAlign: 'center' }}><Typography variant='subtitle2'>{mode == 'create' ? 'Agregar Nuevo Grupo Contable' : 'Editar Grupo Contable'}</Typography></legend>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Categoría'
                                        placeholder='Muebles y enseres'
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
                                name="util"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Vida útil'
                                        type="number"
                                        onChange={onChange}
                                        error={Boolean(errors.util)}
                                        value={value || ''}
                                    />
                                )}
                            />
                            {errors.util && <FormHelperText sx={{ color: 'error.main' }}>{errors.util.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        {fields.map((item, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid item xs={5.5}>
                                    <FormControl fullWidth sx={{ mb: 6 }}>
                                        <Controller
                                            name={`subcategory.${index}.name`}
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={item.name}
                                            render={({ field: { value, onChange } }) => (
                                                <TextField
                                                    label='Sub categoría'
                                                    placeholder='Mesas'
                                                    onChange={onChange}
                                                    error={Boolean(errors.subcategory?.[index]?.name)}
                                                    value={value}

                                                />
                                            )}
                                        />
                                        {errors.subcategory?.[index]?.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.subcategory?.[index]?.name.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5.5}>
                                    <FormControl fullWidth sx={{ mb: 6 }}>
                                        <Controller
                                            name={`subcategory.${index}.util`}
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={item.util}
                                            render={({ field: { value, onChange } }) => (
                                                <TextField
                                                    label='Vida útil'
                                                    type="number"
                                                    onChange={onChange}
                                                    error={Boolean(errors.subcategory?.[index]?.util)}
                                                    value={value || ''}
                                                />
                                            )}
                                        />
                                        {errors.subcategory?.[index]?.util && <FormHelperText sx={{ color: 'error.main' }}>{errors.subcategory?.[index]?.util.message}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={0.5}>
                                    <IconButton onClick={() => remove(index)} sx={{ mt: 1 }}>
                                        <Icon icon='ic:baseline-clear' />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))
                        }
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <Button
                                onClick={handleAdd}
                                startIcon={<Icon icon='zondicons:add-outline' />}
                            >
                                Agregar Sub Categoria
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <TextField
                                        label='Descripción'
                                        placeholder='Descripción del grupo contable (opcional)'
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
export default AddConatble;