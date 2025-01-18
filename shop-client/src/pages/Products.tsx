import { Box, Container, Fab, Pagination, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components';
import { useAppContext, useToastContext } from '../context';
import { ProductService } from '../services';
import { Product } from '../types';

const Products = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const [products, setProducts] = useState<Product[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);
    const { setToast } = useToastContext();

    const getProducts = () => {
        setLoading(true);
        ProductService.getProducts(pageSelected, 9)
            .then((res) => {
                setProducts(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .catch(() => {
                setToast({severity : 'error', message : 'Une erreur est survenue lors du chargement côté serveur'});
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getProducts();
    }, [pageSelected]);

    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, margin: "2rem" }}>
            <Typography variant="h2">Les produits</Typography>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Fab variant="extended" color="primary" aria-label="add" onClick={() => navigate('/product/create')}>
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter un produit
                </Fab>
            </Box>

            {/* Products */}
            <Container sx={{display: {xs: 'none', md: 'flex'}}}>
                <Grid container alignItems="center" rowSpacing={3} columnSpacing={3}>
                    {products?.map((product) => (
                        <Grid key={product.id} size={4}>
                            <ProductCard product={product} displayShop={true} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Container sx={{display: {xs: 'flex', md: 'none', width:"100%", justifyContent:"center", alignItems:"center"}}}>
                <Box sx={{display:"flex", flexDirection:"column", width: "100%"}}>
                    {products?.map((product) => (
                        <Box key={product.id}>
                            <ProductCard product={product} />
                        </Box>
                    ))}
                </Box>
            </Container>

            {/* Pagination */}
            {products?.length !== 0 ? (
                <Pagination count={count} page={page} siblingCount={1} onChange={handleChangePagination} />
            ) : (
                <Typography variant="h5" sx={{ mt: -1 }}>
                    Aucun produit correspondant
                </Typography>
            )}
        </Box>
    );
};

export default Products;
