import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Fade,
    FadeProps,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    Paper,
    Box,
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { instance } from 'src/configs/axios'

interface SubCategory {
    _id?: string
    name: string
    util: number
}

interface ContableType {
    _id?: string
    name: string
    util: number
    subcategory: SubCategory[]
    description?: string
}

interface Props {
    open: boolean
    toggle: () => void
    id: string
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

const SubCategory = ({ open, toggle, id }: Props) => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [subcategories, setSubcategories] = useState<SubCategory[]>([])
    const [category, setCategory] = useState<ContableType | null>(null)


    useEffect(() => {
        const findOne = async () => {
            try {
                const response = await instance.get(`contables/${id}`)
                setCategory(response.data ?? null);
                setSubcategories(response.data.subcategory ?? []);
            } catch (e) {
                console.log(e)
            }
        }
        if (open && id) {
            findOne()
        }
    }, [open, id])

    const paginatedSubcategories = subcategories.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
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
                    Sub Categorías de {category?.name}
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
                {subcategories.length > 0 ? (
                    <Paper
                        sx={{
                            width: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sub Categoría</TableCell>
                                        <TableCell>Vida útil</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedSubcategories.map((sub, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant='body2'>{sub.name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='body2'>{sub.util}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component='div'
                            count={subcategories.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage='Filas por página'
                        />
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <Typography variant='h6' color='text.secondary'>
                            No hay subcategorías registradas
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={toggle} variant='contained'>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SubCategory
