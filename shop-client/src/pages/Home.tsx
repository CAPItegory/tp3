import {
    Box, Container, Fab, FormControl, InputLabel, MenuItem, Pagination, Select, SelectChangeEvent, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filters, ShopCard } from '../components';
import { useAppContext, useToastContext } from '../context';
import { ShopService } from '../services';
import { ResponseArray, Shop } from '../types';

const Home = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const [shops, setShops] = useState<Shop[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);
    const { setToast } = useToastContext();

    const [sort, setSort] = useState<string>('');
    const [filters, setFilters] = useState<string>('');

    const getShops = () => {
        setLoading(true);
        let promisedShops: Promise<ResponseArray<Shop>>;
        if (sort) {
            promisedShops = ShopService.getShopsSorted(pageSelected, 9, sort);
        } else if (filters) {
            promisedShops = ShopService.getShopsFiltered(pageSelected, 9, filters);
        } else {
            promisedShops = ShopService.getShops(pageSelected, 9);
        }
        promisedShops
            .then((res) => {
                setShops(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .catch(() => {
                setToast({severity : 'error', message : 'Une erreur est survenue lors du chargement côté serveur'});
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getShops();
    }, [pageSelected, sort, filters]);

    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    const handleChangeSort = (event: SelectChangeEvent) => {
        setSort(event.target.value as string);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, margin: "2rem" }}>
            <Typography variant="h2">Les boutiques</Typography>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Fab variant="extended" color="primary" aria-label="add" onClick={() => navigate('/shop/create')}>
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter une boutique
                </Fab>
            </Box>

            {/* Sort and filters */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="demo-simple-select-label">Trier par</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={sort}
                        label="Trier par"
                        onChange={handleChangeSort}
                    >
                        <MenuItem value="">
                            <em>Aucun</em>
                        </MenuItem>
                        <MenuItem value="name">Nom</MenuItem>
                        <MenuItem value="createdAt">Date de création</MenuItem>
                        <MenuItem value="nbProducts">Nombre de produits</MenuItem>
                    </Select>
                </FormControl>

                <Filters setUrlFilters={setFilters} setSort={setSort} sort={sort} />
            </Box>

            {/* Shops */}
            <Container sx={{display: {xs: 'none', md: 'flex'}}}>
                <Grid container alignItems="center" rowSpacing={3} columnSpacing={3}>
                    {shops?.map((shop) => (
                        <Grid key={shop.id} size={4}>
                            <ShopCard shop={shop} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Container sx={{display: {xs: 'flex', md: 'none', width:"100%", justifyContent:"center", alignItems:"center"}}}>
                <Box sx={{display:"flex", flexDirection:"column", width: "100%"}}>
                    {shops?.map((shop) => (
                        <Box key={shop.id}>
                            <ShopCard shop={shop} />
                        </Box>
                    ))}
                </Box>
            </Container>

            {/* Pagination */}
            {shops?.length !== 0 ? (
                <Pagination count={count} page={page} siblingCount={1} onChange={handleChangePagination} />
            ) : (
                <Typography variant="h5" sx={{ mt: -1 }}>
                    Aucune boutique correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Home;
