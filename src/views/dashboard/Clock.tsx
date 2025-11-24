import { useEffect, useState } from "react";
import { Grid, Box, Typography } from "@mui/material";

const ClockWidget = () => {
    const [time, setTime] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00",
    });

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
        <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={3}>
                <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700}>{time.hours}</Typography>
                    <Typography variant="body2" color="text.secondary">Hora</Typography>
                </Box>
            </Grid>

            <Grid item xs={1}><Typography variant="h3">:</Typography></Grid>

            <Grid item xs={3}>
                <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700}>{time.minutes}</Typography>
                    <Typography variant="body2" color="text.secondary">Minutos</Typography>
                </Box>
            </Grid>

            <Grid item xs={1}><Typography variant="h3">:</Typography></Grid>

            <Grid item xs={3}>
                <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700}>{time.seconds}</Typography>
                    <Typography variant="body2" color="text.secondary">Segundos</Typography>
                </Box>
            </Grid>
        </Grid>
    );
};

export default ClockWidget;
