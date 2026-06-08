import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllBlogs, deleteBlog } from '../../../services/blogService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Blogs' },
];

const BlogList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'image', numeric: false, disablePadding: false, label: 'Image' },
        { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
        { id: 'author', numeric: false, disablePadding: false, label: 'Author' },
        { id: 'points', numeric: false, disablePadding: false, label: 'Points' },
        { id: 'readTime', numeric: false, disablePadding: false, label: 'Read Time' },
        { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
        { id: 'isFeatured', numeric: false, disablePadding: false, label: 'Is Featured' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await getAllBlogs();
            if (response.data && response.data.data) {
                setTableData(response.data.data);
            } else if (response.data) {
                setTableData(response.data);
            }
        } catch (error) {
            console.error('Error fetching list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <PageContainer title="Blogs List" description="This is the Blogs List page">
            <Breadcrumb title="Blogs List" items={BCrumb}>
                <Box>
                    <Button component={Link} to="/dashboard/blogs/create" variant="contained" color="primary">
                        Add New Blog
                    </Button>
                </Box>
            </Breadcrumb>
            <Box>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box mt={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : (
                    <ProductTableList
                        showCheckBox={false}
                        headCells={headCells}
                        tableData={tableData}
                        isBlogsList={true}
                        setTableData={setTableData}
                        onDelete={deleteBlog}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default BlogList;
