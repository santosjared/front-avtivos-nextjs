import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Fade,
    FadeProps,
    IconButton,
    Typography,
    Box,
    TextField,
    Card,
    CardHeader,
    CardContent,
    Divider,
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { forwardRef, ReactElement, Ref, useState } from 'react'
import { styled } from '@mui/material/styles'
import { GradeType } from 'src/types/types'
import baseUrl from 'src/configs/environment'
import CustomChip from 'src/@core/components/mui/chip'
import { instance } from 'src/configs/axios'
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";

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

interface ActivosType {
    _id?: string
    code: string,
    responsable: UserType | null,
    name: string,
    location: LocationType | null,
    price_a: number,
    date_a: string,
    imageUrl: string | null,
    status: StatusType | null
    category: ContableType | null
    subcategory: SubCategoryType | null
}


interface Props {
    open: boolean
    activos: ActivosType[]
    toggle: () => void
    selectActivos: ActivosType[]
    setSelectActivos: React.Dispatch<React.SetStateAction<ActivosType[]>>;
}

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Fade ref={ref} {...props} />
})

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3, 4),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}))

const AddItem = ({ open, toggle, setSelectActivos, activos, selectActivos }: Props) => {

    const [field, setField] = useState<string>('')
    const [activo, setActivo] = useState<ActivosType | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async () => {
        const activo = activos.find(ac => ac.code.toLowerCase() === field.trim().toLowerCase())
        setActivo(activo || null)

    }

    const handleAddActivo = async () => {

        const existsActivo = selectActivos.some(act => act.code === activo?.code)
        if (existsActivo) {
            setError('El Activo ya esta agregado');
            return;
        }
        if (activo) {
            setSelectActivos(prev => [...prev, activo])
        }

    }
    return (
        <Dialog
            fullWidth
            open={open}
            maxWidth='md'
            scroll='body'
            onClose={toggle}
            TransitionComponent={Transition}
        >
            <Header>
                <Typography variant='h6' color={theme => theme.palette.primary.contrastText}>
                    Agregar activos
                </Typography>
                <IconButton
                    size='small'
                    onClick={toggle}
                    sx={{ color: theme => theme.palette.primary.contrastText }}
                >
                    <Icon icon='mdi:close' fontSize={20} />
                </IconButton>
            </Header>

            <DialogContent>
                <Box sx={{ display: 'flex', flex: 1, }}>
                    <TextField
                        fullWidth
                        label="Buscar"
                        variant="outlined"
                        name="search"
                        autoComplete="off"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        sx={{
                            flex: 1,
                            '& .MuiInputBase-root': {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        sx={{
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0
                        }}
                    >
                        Buscar
                    </Button>
                </Box>

                {error && <Card sx={{ mt: 6, backgroundColor: theme => hexToRGBA(theme.palette.error.main, 0.7) }} >
                    <CardContent>
                        <Typography variant='overline' sx={{ color: theme => theme.palette.error.contrastText }} >{error}</Typography>
                    </CardContent>
                </Card>}
                {activo ? <Card sx={{ mt: 6, backgroundColor: error ? theme => hexToRGBA(theme.palette.primary.main, 0.1) : null }} elevation={0}>
                    <CardHeader title="DETALLES DEL ACTIVO FIJO" sx={{ backgroundColor: error ? theme => hexToRGBA(theme.palette.primary.main, 0.1) : null }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Box sx={{ width: 250, height: 140 }}>
                            <img
                                src={`${baseUrl().backendURI}/images/${activo.imageUrl}`}
                                alt='Activo'
                                style={{ width: 250, height: 140, borderRadius: 3 }}
                            />
                        </Box>
                    </Box>
                    <CardContent>
                        <Typography variant="overline"><strong>Información del activo</strong></Typography>
                        <Divider />
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            <strong>Código: </strong> {activo.code}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            <strong>nombre del activo: </strong> {activo.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            <strong>Lugar donde se enceuntra el activo:</strong> {activo.location?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            <strong>Categoría:</strong> {activo.category?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            <strong>Subcategoría:</strong> {activo.subcategory?.name}
                        </Typography>
                        <CustomChip
                            skin='light'
                            size='small'
                            label={activo.status?.name}
                            rounded
                            color={
                                activo.status?.name === 'Bueno' ? 'success' :
                                    activo.status?.name === 'Regular' ? 'warning' :
                                        activo.status?.name === 'Malo' ? 'error' : 'info'
                            }
                        />
                    </CardContent>
                </Card> : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <Typography variant='h6' color='text.secondary'>
                            Activo no selecionado
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={handleAddActivo} variant='contained' color='success' disabled={activo ? false : true}>
                    Agregar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddItem
