import React, { useEffect, useState } from 'react';
import {
    Grid,
    MenuItem,
    Select,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    DialogActions,
    Chip,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconPhoto, IconX, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const CreateProductGroup = () => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        products: [],
        price: null,
        commerceCategoriesOne: '',
        commerceCategoriesTwo: '',
        commerceCategoriesThree: '',
        commerceCategoriesFour: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    // Commerce category states
    const [categoryOne, setCategoryOne] = useState([]);
    const [categoryTwo, setCategoryTwo] = useState([]);
    const [categoryThree, setCategoryThree] = useState([]);
    const [categoryFour, setCategoryFour] = useState([]);

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Handle name change and auto-generate slug
    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    // Handle product selection
    const handleProductSelection = (e) => {
        const selectedIds = e.target.value;
        setSelectedProductIds(selectedIds);

        // Calculate total price from selected products
        const selectedProducts = products.filter(product =>
            selectedIds.includes(product._id)
        );

        const totalPrice = selectedProducts.reduce((sum, product) => {
            return sum + (product.eachPrice || 0);
        }, 0);

        setFormData(prev => ({
            ...prev,
            products: selectedIds,
        }));
    };

    // Remove selected product
    const handleRemoveProduct = (productId) => {
        const updatedSelectedIds = selectedProductIds.filter(id => id !== productId);
        setSelectedProductIds(updatedSelectedIds);

        const selectedProducts = products.filter(product =>
            updatedSelectedIds.includes(product._id)
        );

        setFormData(prev => ({
            ...prev,
            products: updatedSelectedIds,
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file for thumbnail');
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(null);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            setError('Please enter a product group name');
            return;
        }
        if (!formData.slug.trim()) {
            setError('Please enter a slug');
            return;
        }
        if (selectedProductIds.length === 0) {
            setError('Please select at least one product');
            return;
        }
        if (!thumbnailFile) {
            setError('Please upload a thumbnail image');
            return;
        }
        if (!formData.commerceCategoriesOne) {
            setError('Please select a brand (Commerce Category One)');
            return;
        }

        setLoading(true);
        setError('');

        // Create FormData object for multipart form submission
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('commerceCategoriesOne', formData.commerceCategoriesOne);

        // Append optional commerce categories
        if (formData.commerceCategoriesTwo) formDataToSend.append('commerceCategoriesTwo', formData.commerceCategoriesTwo);
        if (formData.commerceCategoriesThree) formDataToSend.append('commerceCategoriesThree', formData.commerceCategoriesThree);
        if (formData.commerceCategoriesFour) formDataToSend.append('commerceCategoriesFour', formData.commerceCategoriesFour);

        // Append products as array
        selectedProductIds.forEach(productId => {
            formDataToSend.append('products', productId);
        });

        // Append thumbnail image
        formDataToSend.append('productGroupThumbnail', thumbnailFile);

        try {
            const res = await axiosInstance.post('/product-group/create-product-group', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Create product group response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    name: '',
                    slug: '',
                    products: [],
                    price: 0,
                    commerceCategoriesOne: '',
                    commerceCategoriesTwo: '',
                    commerceCategoriesThree: '',
                    commerceCategoriesFour: '',
                });
                setSelectedProductIds([]);
                handleRemoveThumbnail();

                navigate('/dashboard/product-groups/list');
            } else if (res.data.statusCode === 400) {
                setError(res.data.message);
            }

        } catch (error) {
            console.error('Create product group error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create product group');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/products/get-all-products-dashboard');
            console.log("response products", response);

            if (response.data.statusCode === 200) {
                const productsArray = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];

                const uniqueProducts = productsArray.filter(
                    (product, index, self) =>
                        index === self.findIndex((p) => p.sku === product.sku)
                );

                setProducts(uniqueProducts);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Error fetching products: ' + error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch functions for commerce categories
    const fetchBrandsList = async () => {
        try {
            const response = await axiosInstance.get('/brand/get-brands-list');
            console.log("response brands", response);

            if (response.data.statusCode === 200) {
                setCategoryOne(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching brands list:', error);
            setError('Failed to fetch brands');
        }
    };

    const fetchCategoryList = async () => {
        if (!formData.commerceCategoriesOne) return;

        try {
            console.log("Fetching categories for brand ID:", formData.commerceCategoriesOne);
            const response = await axiosInstance.get(`/category/get-categories-by-brand-id/${formData.commerceCategoriesOne}`);
            console.log("response categories", response);

            if (response.data.statusCode === 200) {
                setCategoryTwo(response.data.data);
            } else {
                setCategoryTwo([]);
            }
        } catch (error) {
            console.error('Error fetching category list:', error);
            setCategoryTwo([]);
            setError('Failed to fetch categories');
        }
    };

    const fetchSubCategoryList = async () => {
        if (!formData.commerceCategoriesTwo) return;

        try {
            console.log("Fetching subcategories for category ID:", formData.commerceCategoriesTwo);
            const response = await axiosInstance.get(`/subcategory/get-sub-categories-by-category-id/${formData.commerceCategoriesTwo}`);
            console.log("response sub categories", response.data.data);

            if (response.data.statusCode === 200) {
                setCategoryThree(response.data.data);
            } else {
                setCategoryThree([]);
            }
        } catch (error) {
            console.error('Error fetching sub category list:', error);
            setCategoryThree([]);
            setError('Failed to fetch subcategories');
        }
    };

    const fetchSubCategoryTwoList = async () => {
        if (!formData.commerceCategoriesThree) return;

        try {
            console.log("Fetching sub-subcategories for subcategory ID:", formData.commerceCategoriesThree);
            const response = await axiosInstance.get(`/subcategoryTwo/get-sub-categories-two-by-category-id/${formData.commerceCategoriesThree}`);
            console.log("response sub categories two", response.data.data);

            if (response.data.statusCode === 200) {
                setCategoryFour(response.data.data);
            } else {
                setCategoryFour([]);
            }
        } catch (error) {
            console.error('Error fetching sub category two list:', error);
            setCategoryFour([]);
            setError('Failed to fetch sub-subcategories');
        }
    };

    // Effects for commerce category dependencies
    useEffect(() => {
        if (formData.commerceCategoriesOne) {
            fetchCategoryList();
        } else {
            // Clear child categories when brand is not selected
            setCategoryTwo([]);
            setCategoryThree([]);
            setCategoryFour([]);
            setFormData(prev => ({
                ...prev,
                commerceCategoriesTwo: '',
                commerceCategoriesThree: '',
                commerceCategoriesFour: ''
            }));
        }
    }, [formData.commerceCategoriesOne]);

    useEffect(() => {
        if (formData.commerceCategoriesTwo) {
            fetchSubCategoryList();
        } else {
            // Clear child categories when category is not selected
            setCategoryThree([]);
            setCategoryFour([]);
            setFormData(prev => ({
                ...prev,
                commerceCategoriesThree: '',
                commerceCategoriesFour: ''
            }));
        }
    }, [formData.commerceCategoriesTwo]);

    useEffect(() => {
        if (formData.commerceCategoriesThree) {
            fetchSubCategoryTwoList();
        } else {
            // Clear child categories when subcategory is not selected
            setCategoryFour([]);
            setFormData(prev => ({
                ...prev,
                commerceCategoriesFour: ''
            }));
        }
    }, [formData.commerceCategoriesThree]);

    useEffect(() => {
        fetchProducts();
        fetchBrandsList();
    }, []);

    // Get selected products details for display
    const selectedProductsDetails = products.filter(product =>
        selectedProductIds.includes(product._id)
    );

    return (
        <div>
            <Grid container spacing={2}>
                {/* Product Group Name */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 2 }}>
                        Product Group Name
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="name"
                        fullWidth
                        value={formData.name}
                        onChange={handleNameChange}
                        disabled={loading}
                        placeholder="Enter Product Group Name"
                    />
                </Grid>

                {/* Slug */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="slug" sx={{ mt: 2 }}>
                        Slug
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="slug"
                        fullWidth
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        disabled={loading}
                        placeholder="Auto-generated slug"
                    />
                </Grid>

                {/* Thumbnail Image Upload */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="thumbnail-upload" sx={{ mt: 2 }}>
                        Product Group Thumbnail
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        style={{ display: 'none' }}
                    />
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button
                            variant="outlined"
                            component="label"
                            htmlFor="thumbnail-upload"
                            startIcon={<IconPhoto size="1.1rem" />}
                            disabled={loading}
                        >
                            Choose Thumbnail
                        </Button>
                        {thumbnailFile && (
                            <Typography variant="body2" color="primary">
                                {thumbnailFile.name}
                            </Typography>
                        )}
                    </Box>
                    {thumbnailPreview && (
                        <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            <Button
                                size="small"
                                onClick={handleRemoveThumbnail}
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    minWidth: 'auto',
                                    padding: '4px',
                                    backgroundColor: 'error.main',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'error.dark' }
                                }}
                            >
                                <IconX size="1rem" />
                            </Button>
                        </Box>
                    )}
                </Grid>

                {/* Commerce Category One (Brand) */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerce-category-one-select" sx={{ mt: 2 }}>
                        Select Commerce Category One (Brand)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="commerce-category-one-select"
                            value={formData.commerceCategoriesOne}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesOne: e.target.value,
                                    // Clear child categories when brand changes
                                    commerceCategoriesTwo: '',
                                    commerceCategoriesThree: '',
                                    commerceCategoriesFour: ''
                                });
                            }}
                            disabled={loading || categoryOne.length === 0}
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                {categoryOne.length === 0 ? 'Loading brands...' : 'Select a brand'}
                            </MenuItem>
                            {categoryOne.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Commerce Category Two */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerce-category-two-select" sx={{ mt: 2 }}>
                        Select Commerce Category Two
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="commerce-category-two-select"
                            value={formData.commerceCategoriesTwo}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesTwo: e.target.value,
                                    // Clear child categories when category changes
                                    commerceCategoriesThree: '',
                                    commerceCategoriesFour: ''
                                });
                            }}
                            disabled={loading || categoryTwo.length === 0}
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                {categoryTwo.length === 0 ? 'Select brand first...' : 'Select a category'}
                            </MenuItem>
                            {categoryTwo.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Commerce Category Three */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerceCategoryThree-select" sx={{ mt: 2 }}>
                        Select Commerce Category Three
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="commerceCategoryThree-select"
                            value={formData.commerceCategoriesThree}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesThree: e.target.value,
                                    // Clear child categories when subcategory changes
                                    commerceCategoriesFour: ''
                                });
                            }}
                            disabled={loading || categoryThree.length === 0}
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                {categoryThree.length === 0 ? 'Select category first...' : 'Select a subcategory'}
                            </MenuItem>
                            {categoryThree.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Commerce Category Four */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerceCategoryFour-select" sx={{ mt: 2 }}>
                        Select Commerce Category Four
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="commerceCategoryFour-select"
                            value={formData.commerceCategoriesFour}
                            onChange={(e) => {
                                setFormData({ ...formData, commerceCategoriesFour: e.target.value });
                            }}
                            disabled={loading || categoryFour.length === 0}
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                {categoryFour.length === 0 ? 'No SubCategory Two Available' : 'Select a sub-subcategory'}
                            </MenuItem>
                            {categoryFour.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Product Selection */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="product-select" sx={{ mt: 2 }}>
                        Select Products
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="product-select"
                            multiple
                            value={selectedProductIds}
                            onChange={handleProductSelection}
                            disabled={loading || !Array.isArray(products) || products.length === 0}
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return 'Select products';
                                }
                                return `${selected.length} product(s) selected`;
                            }}
                        >
                            <MenuItem value="" disabled>
                                {!Array.isArray(products) || products.length === 0 ? 'Loading products...' : 'Select products'}
                            </MenuItem>
                            {Array.isArray(products) && products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                    {product.sku} - {product.ProductName} - ${product.eachPrice}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Selected Products Display */}
                {selectedProductsDetails.length > 0 && (
                    <Grid size={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            Selected Products ({selectedProductsDetails.length})
                        </Typography>
                        <Card variant="outlined">
                            <CardContent>
                                <List dense>
                                    {selectedProductsDetails.map((product) => (
                                        <ListItem
                                            key={product._id}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveProduct(product._id)}
                                                    disabled={loading}
                                                >
                                                    <IconTrash size="1rem" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={`${product.sku} - ${product.ProductName}`}
                                                secondary={`Price: $${product.eachPrice}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Total Price Display */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="price" sx={{ mt: 2 }}>
                        Total Price
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="price"
                        fullWidth
                        type="number"
                        value={formData.price}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setFormData(prev => ({
                                ...prev,
                                price: value
                            }));
                        }}
                        disabled={loading}
                        placeholder="Enter custom price"
                    />
                </Grid>

                {/* Error Message */}
                {error && (
                    <Grid size={12} mt={2}>
                        <div
                            style={{
                                color: error.includes('success') ? 'green' : 'red',
                                padding: '10px',
                                backgroundColor: error.includes('success') ? '#e8f5e8' : '#ffebee',
                                borderRadius: '4px',
                                border: error.includes('success') ? '1px solid #4caf50' : '1px solid #ffcdd2'
                            }}
                        >
                            {error}
                        </div>
                    </Grid>
                )}

                {/* Submit Button */}
                <Grid size={12} mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Creating...' : 'Create Product Group'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/dashboard/product-groups/list')}
                        sx={{ ml: 2 }}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>

            {/* Loading Backdrop */}
            <Backdrop
                
                open={loading}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" size={50} />
                    <Typography variant="body2" color="inherit">
                        Creating product group, please wait...
                    </Typography>
                </Box>
            </Backdrop>
        </div>
    );
};

export default CreateProductGroup;