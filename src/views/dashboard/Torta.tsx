import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface totalStatusType {
    status: string
    total: number
}

interface Props {
    totalStatus: totalStatusType[]
}

const CrmTotalGrowth = ({ totalStatus }: Props) => {

    const series = totalStatus.map(d => d.total)
    const labels = totalStatus.map(d => d.status)
    const total = totalStatus.reduce((acc, d) => acc + d.total, 0);
    const theme = useTheme()

    const options: ApexOptions = {
        legend: {
            show: true,
            labels: {
                colors: theme.palette.text.secondary
            }
        },
        stroke: { width: 5, colors: [theme.palette.background.paper] },
        colors: [
            theme.palette.info.main,
            theme.palette.warning.main,
            theme.palette.success.main,
        ],
        labels,
        tooltip: {
            y: { formatter: (val: number) => `${val}` },
        },
        dataLabels: { enabled: false },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '50%',
                    labels: {
                        show: true,
                        name: { show: false },
                        total: {
                            label: '',
                            show: true,
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: theme.palette.text.secondary,
                            formatter: (val) =>
                                typeof val === 'string' ? `${val}` : `${total}`,
                        },
                        value: {
                            offsetY: 6,
                            fontWeight: 600,
                            fontSize: '1rem',
                            formatter: (val) => `${val}`,
                            color: theme.palette.text.secondary,
                        },
                    },
                },
            },
        },
    }

    return (
        <Box sx={{ pt: 5 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Typography variant="body2">
                        <strong>Estado de activos</strong>
                    </Typography>
                </Box>
            </Box>
            <Chart
                type="donut"
                height={135}
                options={options}
                series={series}
            />
        </Box>
    )
}

export default CrmTotalGrowth
