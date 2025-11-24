import { Box, Button, FormControl, FormHelperText, Grid, TextField, Typography, useTheme } from "@mui/material"
import { useEffect } from "react"
import Icon from 'src/@core/components/icon'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { AppDispatch } from "src/store"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { addRol, updateRol } from "src/store/role"
import { instance } from "src/configs/axios"

interface RoleType {
    name: string
    description: string
    _id?: string
}

const defaultValues: RoleType = {
    name: '',
    description: '',
}

interface Props {
    toggle: () => void
    page: number
    pageSize: number
    mode?: 'create' | 'update'
    id?: string
}

const schema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required('El campo nombre es requerido')
        .min(3, 'El campo nombre debe tener al menos 3 caracteres')
        .max(50, 'El campo nombre no debe exceder los 50 caracteres'),
    description: yup
        .string()
        .trim()
        .transform(value => (value?.trim() === '' ? undefined : value))
        .min(10, 'El campo descripción debe tener al menos 10 caracteres')
        .max(500, 'El campo descripción no debe exceder los 500 caracteres')
        .notRequired()
})

const AddRol = ({ toggle, page, pageSize, mode = 'create', id }: Props) => {

    const theme = useTheme()
    const dispatch = useDispatch<AppDispatch>()

    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode: 'onChange',
        resolver: yupResolver(schema)
    })

    useEffect(() => {
        if (mode === 'update' && id) {
            const fetchRoleData = async () => {
                try {
                    const response = await instance.get(`/roles/${id}`);
                    const roleData: RoleType = response.data;
                    reset(roleData);
                } catch (error) {
                    console.error('Error fetching role data:', error);
                }
            }
            fetchRoleData()
        }
    }, [id, mode])

    const onSubmit = (data: RoleType) => {
        if (mode === 'update' && id) {
            delete data._id
            dispatch(updateRol({ data, id: id || '', filters: { skip: page * pageSize, limit: pageSize } }))
        } else {
            dispatch(addRol({ data, filters: { skip: page * pageSize, limit: pageSize } }))
        }
        handleOnclickCancel()
    }

    const handleOnclickCancel = () => {
        reset(defaultValues)
        toggle()
    }

    return (
        <Box>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <fieldset style={{ border: `1.5px solid ${theme.palette.divider}`, borderRadius: 10, paddingTop: 20 }}>
                    <legend style={{ textAlign: 'center' }}>
                        <Typography variant='subtitle2'>Agregar Nuevo Usuario</Typography>
                    </legend>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <TextField
                                            label='Nombre'
                                            placeholder='Admin'
                                            onChange={onChange}
                                            error={Boolean(errors.name)}
                                            value={value}
                                        />
                                    )}
                                />
                                {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
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
                            {mode === 'create' ? 'Guardar' : 'Actualizar'}
                        </Button>
                    </Box>
                </fieldset>
            </form>
        </Box>
    )
}

export default AddRol
