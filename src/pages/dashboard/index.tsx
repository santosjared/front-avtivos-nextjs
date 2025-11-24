import { Box, Card, CardContent, Grid, Tooltip, Typography, useTheme, useThemeProps } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Icon from "src/@core/components/icon"
import { AppDispatch, RootState } from "src/store";
import { fetchData } from "src/store/dashboard";
import Estadisticas from "src/views/dashboard/Estadisticas";

interface StatusType {
    [key: string]: { icon: string; color: string }
}

const formatearConDia = () => {
    const fecha = new Date();

    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const diaSemana = dias[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${diaSemana}, ${diaMes} de ${mes} de ${anio}`;
};

const Dashboard = () => {

    const dispatch = useDispatch<AppDispatch>();
    const [time, setTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00",
    });
    const { totalStatus, topActivosPorPrecio, topActivosPrestados } = useSelector((state: RootState) => state.dashboard)
    const theme = useTheme()

    const statusObj: StatusType = {
        Bueno: { icon: 'mdi:alpha-b-box', color: theme.palette.success.main },
        Regular: { icon: 'mdi:alpha-r-box', color: theme.palette.warning.main },
        Malo: { icon: 'ic:baseline-folder', color: theme.palette.error.main },
        Mantenimiento: { icon: 'mdi:wrench-settings', color: theme.palette.info.main }
    }
    useEffect(() => {
        dispatch(fetchData())
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setTime({
                hours: now.getHours().toString().padStart(2, "0"),
                minutes: now.getMinutes().toString().padStart(2, "0"),
                seconds: now.getSeconds().toString().padStart(2, "0"),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Grid container spacing={4}>
            {totalStatus.map((st, index) => (
                <Grid item xs={3} key={index}>
                    <Card sx={{
                        backgroundColor: theme => theme.palette.grey[50],
                        borderLeft: theme => `6px solid ${theme.palette.primary.main}`, // grosor 6px y color primario
                        boxShadow: 1,
                        p: 2,
                        mb: 2,
                    }}>
                        <Box sx={{ p: 2 }}>
                            <Tooltip title={`Total en ${st.status}`} arrow>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >

                                    <Icon icon={statusObj[st.status].icon} fontSize={20} color={statusObj[st.status].color} />
                                    <Typography
                                        variant="subtitle2"
                                        noWrap
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                        }}
                                    >

                                        {st.status}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 50,
                            }}
                        >
                            <Typography variant="h6">
                                {`Total: ${st.total}`}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            ))
            }
            {topActivosPorPrecio.map((activo, index) => (
                <Grid item xs={3} key={index}>
                    <Card sx={{
                        backgroundColor: theme => theme.palette.grey[50],
                    }}>
                        <Box sx={{ p: 2 }}>
                            <Tooltip title='Activos con precio alto' arrow>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >
                                    <Icon icon='ic:baseline-tab' fontSize={20} color={theme.palette.success.main} />
                                    <Typography
                                        variant="subtitle2"
                                        noWrap
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                        }}
                                    >
                                        Activos con precio alto
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                        <Box sx={{ p: 3, pt: 0 }}>
                            <Typography variant="body2" sx={{ mb: 4 }}>
                                <strong>Nombre:</strong> {activo.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 4 }}>
                                <strong>Código:</strong> {activo.code}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 4 }}>
                                <strong>Precio:</strong> {activo.price_a}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            ))
            }
            <Grid item xs={12} sm={8}>
                <Estadisticas topActivosPrestados={topActivosPrestados} />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card sx={{
                    backgroundColor: theme => theme.palette.grey[50],
                }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2 }}>
                            {formatearConDia()}
                        </Typography>
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item xs={3}>
                                <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {time.hours}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Hora
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        :
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {time.minutes}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Minutos
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        :
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", textAlign: "center" }}>
                                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                        {time.seconds}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Segundos
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

            </Grid>
        </Grid>

    );
}
Dashboard.acl = {
    action: 'read',
    subject: 'dashboard'
}

Dashboard.authGuard = true;

export default Dashboard