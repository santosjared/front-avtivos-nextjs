import { Card, CardContent, CardHeader, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { hexToRGBA } from "src/@core/utils/hex-to-rgba";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ActivosType {
    name: string
    code: string
}

interface TopActivosPrestadosType {
    total: number
    activo: ActivosType
}

interface Props {
    topActivosPrestados: TopActivosPrestadosType[]
}

const Estadisticas = ({ topActivosPrestados }: Props) => {
    const theme = useTheme();

    const series = [
        {
            name: "Prestados",
            data: topActivosPrestados.map(item => item.total)
        }
    ];

    const options: ApexOptions = {
        chart: { parentHeightOffset: 0, toolbar: { show: false } },
        plotOptions: {
            bar: {
                borderRadius: 8,
                barHeight: "60%",
                horizontal: false,
                distributed: true,
                startingShape: "rounded"
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontWeight: 500,
                fontSize: "0.875rem"
            }
        },
        colors: [
            hexToRGBA(theme.palette.primary.light, 0.7),
            hexToRGBA(theme.palette.secondary.light, 0.7)
        ],
        xaxis: {
            categories: topActivosPrestados.map(item => item.activo.name),
            labels: {
                rotate: -45,
                style: {
                    fontSize: "0.875rem",
                    colors: theme.palette.text.disabled
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    colors: theme.palette.text.primary
                }
            }
        },
        grid: {
            borderColor: theme.palette.divider
        },
        legend: { show: false }
    };

    return (
        <Card sx={{
            backgroundColor: theme => theme.palette.grey[50],
        }}>
            <CardHeader
                sx={{
                    backgroundColor: theme => theme.palette.grey[50],
                }}
                title="Estadísticas de activos prestados"
                subheaderTypographyProps={{ sx: { lineHeight: 1.429 } }}
                titleTypographyProps={{ sx: { letterSpacing: "0.15px" } }}
            />
            <CardContent>
                <Chart type="bar" height={250} series={series} options={options} />
            </CardContent>
        </Card>
    );
};

export default Estadisticas;
