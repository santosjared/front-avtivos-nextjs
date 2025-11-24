import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Icon from 'src/@core/components/icon'
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, Fade, FadeProps, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles'
import { instance } from 'src/configs/axios';


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


interface EntregaType {
    date: string
    time: string
    location: string
}

interface DevolucionType {
    date: string
    time: string
}

interface TimelineType {
    code: string
    entrega: EntregaType
    devolucion: DevolucionType
}


interface ActivoType {
    name: string
    code: string
    timeline: TimelineType[]
}


interface props {
    id: string
    open: boolean
    toggle: () => void
}

const Trazabildad = ({ id, open, toggle }: props) => {

    const [activo, setActivo] = useState<ActivoType | null>(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await instance.get(`/activos/trazabildad/${id}`)
                setActivo(response.data)
            } catch (e) {
                console.log(e)
            }
        }
        if (open && id) {
            fetch()
        }

    }, [id, open])

    const formaDate = (fecha: string) => {
        const date = new Date(fecha)
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
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
                    {`Trazabilidad del activo > ${activo?.name ?? ''} ${activo?.code ? ` > código: ${activo.code}` : ''}`}
                </Typography>
                <IconButton
                    size='small'
                    onClick={toggle}
                    sx={{ color: theme => theme.palette.primary.contrastText }}
                >
                    <Icon icon='mdi:close' fontSize={20} />
                </IconButton>
            </Header>

            <DialogContent sx={{ backgroundColor: theme => theme.palette.grey[100] }}>
                {activo && activo?.timeline?.length > 0 ? (
                    <Timeline position="alternate">
                        {activo.timeline.map((item, index) => {
                            const isReturned = Boolean(item.devolucion);
                            const dotColor = isReturned ? "success" : "error";

                            return (
                                <TimelineItem key={index}>
                                    <TimelineOppositeContent>
                                        <Card variant="outlined" sx={{ p: 1 }}>
                                            <CardContent sx={{ py: 1 }}>
                                                <Typography variant="h6">Entrega</Typography>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {formaDate(item.entrega?.date)}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {item.entrega?.time}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="overline"
                                                    sx={{ color: "text.secondary", mt: 1 }}
                                                >
                                                    <strong>{item.entrega?.location}</strong>
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot color={dotColor} />
                                        {index < activo.timeline.length - 1 && <TimelineConnector />}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Card variant="outlined" sx={{ p: 1 }}>
                                            <CardContent sx={{ py: 1 }}>
                                                <Typography variant="h6">
                                                    {isReturned ? "Devuelto" : "No devuelto"}
                                                </Typography>

                                                {isReturned && (
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {formaDate(item.devolucion?.date)}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {item.devolucion?.time}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TimelineContent>

                                </TimelineItem>
                            );
                        })}
                    </Timeline>

                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <Typography variant='h6' color='text.secondary'>
                            Aun no hay trazabildad para mostrar
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', backgroundColor: theme => theme.palette.grey[100] }}>
                <Button onClick={toggle} variant='contained'>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>


    );
}

export default Trazabildad;