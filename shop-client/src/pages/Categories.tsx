import { Box, Container, Fab, Pagination, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from '../components';
import { useAppContext } from '../context';
import { CategoryService } from '../services';
import { Category } from '../types';

const Categories = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    const getCategories = () => {
        setLoading(true);
        CategoryService.getCategories(pageSelected, 9)
            .then((res) => {
                setCategories(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getCategories();
    }, [pageSelected]);

    const handleChangePagination = (event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, margin: "1rem" }}>
            <Typography variant="h2">Les catégories</Typography>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Fab variant="extended" color="primary" aria-label="add" onClick={() => navigate('/category/create')}>
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter une catégorie
                </Fab>
            </Box>

            {/* Categories */}
            <Container sx={{display: {xs: 'none', md: 'flex'}}}>
                <Grid container alignItems="center" rowSpacing={3} columnSpacing={3}>
                    {categories?.map((category) => (
                        <Grid key={category.id} size={4}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Container sx={{display: {xs: 'flex', md: 'none', width:"100%", justifyContent:"center", alignItems:"center"}}}>
                <Box sx={{display:"flex", flexDirection:"column", width: "100%"}}>
                    {categories?.map((category) => (
                        <Grid key={category.id} size={4}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Box>
            </Container>

            {/* Pagination */}
            {categories?.length !== 0 ? (
                <Pagination count={count} page={page} siblingCount={1} onChange={handleChangePagination} />
            ) : (
                <Typography variant="h5" sx={{ mt: -1 }}>
                    Aucune catégorie correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Categories;
