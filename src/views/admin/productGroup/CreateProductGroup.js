import React, { useEffect, useMemo, useState } from 'react';
import {
    Grid,
    MenuItem,
    Select,
    FormControl,
    Checkbox,
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
    CardContent,
    Autocomplete,
    TextField,
    InputAdornment,
    Alert
} from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconPhoto, IconX, IconTrash, IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateProductGroup = () => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        slug: '',
        products: [],
        price: null,
        eachPrice: '',
        primaryUnitsType: '',
        pricingGroup: '',
        commerceCategoriesOne: '',
        commerceCategoriesTwo: '',
        commerceCategoriesThree: '',
        commerceCategoriesFour: '',
        pageTitle: '',
        storeDescription: '',
        eachBarcodes: '',
        packBarcodes: '',
        taxable: true,
        comparePrice: '',
        sequence: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [productPackTypes, setProductPackTypes] = useState({});
    const [productUnitsQuantities, setProductUnitsQuantities] = useState({});
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [stockWarnings, setStockWarnings] = useState({});

    // Commerce category states
    const [categoryOne, setCategoryOne] = useState([]);
    const [categoryTwo, setCategoryTwo] = useState([]);
    const [categoryThree, setCategoryThree] = useState([]);
    const [categoryFour, setCategoryFour] = useState([]);
    const [pricingGroups, setPricingGroups] = useState([]);
    const [taxOptions, setTaxOptions] = useState([true, false]);

    // Dialog states
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        if (!productSearchQuery.trim()) {
            return products;
        }

        const query = productSearchQuery.toLowerCase();
        return products.filter(product =>
            product.sku?.toLowerCase().includes(query) ||
            product.ProductName?.toLowerCase().includes(query) ||
            product.eachPrice?.toString().includes(query)
        );
    }, [products, productSearchQuery]);

    const handleProductSearch = (event) => {
        setProductSearchQuery(event.target.value);
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    const checkStockLevel = (productId, packTypeId = null, unitsQuantity = null) => {
        const product = products.find(p => p._id === productId);
        if (!product) return { isValid: true, message: '' };

        const packIdToUse = packTypeId || productPackTypes[productId];
        const unitsToUse = unitsQuantity !== null ? unitsQuantity : (productUnitsQuantities[productId] || 1);

        if (!packIdToUse) return { isValid: true, message: '' };

        const packQuantity = getPackQuantity(productId, packIdToUse);
        const totalRequestedQuantity = packQuantity * unitsToUse;
        const availableStock = product.stockLevel || 0;

        if (totalRequestedQuantity > availableStock) {
            const exceedsBy = totalRequestedQuantity - availableStock;
            return {
                isValid: false,
                message: `Stock level exceeds by ${exceedsBy} units. Available: ${availableStock}. Please change pack type or reduce units quantity.`,
                exceedsBy,
                availableStock,
                requestedQuantity: totalRequestedQuantity
            };
        }

        return { isValid: true, message: '' };
    };

    const handlePackTypeChange = (productId, packTypeId) => {
        setProductPackTypes(prev => ({
            ...prev,
            [productId]: packTypeId
        }));

        const stockCheck = checkStockLevel(productId, packTypeId);
        setStockWarnings(prev => ({
            ...prev,
            [productId]: stockCheck
        }));

        setProductUnitsQuantities(prev => ({
            ...prev,
            [productId]: 1
        }));
    };

    const handleUnitsQuantityChange = (productId, quantity) => {
        const newQuantity = parseInt(quantity) || 0;
        setProductUnitsQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }));

        const stockCheck = checkStockLevel(productId, null, newQuantity);
        setStockWarnings(prev => ({
            ...prev,
            [productId]: stockCheck
        }));
    };

    const handleProductSelection = (e) => {
        const selectedIds = e.target.value;
        setSelectedProductIds(selectedIds);

        const selectedProducts = products.filter(product =>
            selectedIds.includes(product._id)
        );

        const totalPrice = selectedProducts.reduce((sum, product) => {
            return sum + (product.eachPrice || 0);
        }, 0);

        const newPackTypes = { ...productPackTypes };
        const newUnitsQuantities = { ...productUnitsQuantities };
        const newStockWarnings = { ...stockWarnings };

        selectedIds.forEach(id => {
            if (!newPackTypes[id]) {
                const product = products.find(p => p._id === id);
                if (product && product.typesOfPacks && product.typesOfPacks.length > 0) {
                    newPackTypes[id] = product.typesOfPacks[0]._id;
                    newUnitsQuantities[id] = 1;

                    const stockCheck = checkStockLevel(id, product.typesOfPacks[0]._id, 1);
                    newStockWarnings[id] = stockCheck;
                }
            }
        });

        setProductPackTypes(newPackTypes);
        setProductUnitsQuantities(newUnitsQuantities);
        setStockWarnings(newStockWarnings);

        setFormData(prev => ({
            ...prev,
            products: selectedIds,
            price: totalPrice
        }));
    };

    const handleRemoveProduct = (productId) => {
        const updatedSelectedIds = selectedProductIds.filter(id => id !== productId);
        setSelectedProductIds(updatedSelectedIds);

        const selectedProducts = products.filter(product =>
            updatedSelectedIds.includes(product._id)
        );

        const totalPrice = selectedProducts.reduce((sum, product) => {
            return sum + (product.eachPrice || 0);
        }, 0);

        const newPackTypes = { ...productPackTypes };
        const newUnitsQuantities = { ...productUnitsQuantities };
        const newStockWarnings = { ...stockWarnings };
        delete newPackTypes[productId];
        delete newUnitsQuantities[productId];
        delete newStockWarnings[productId];

        setProductPackTypes(newPackTypes);
        setProductUnitsQuantities(newUnitsQuantities);
        setStockWarnings(newStockWarnings);

        setFormData(prev => ({
            ...prev,
            products: updatedSelectedIds,
            price: totalPrice
        }));
    };

    const getPackQuantity = (productId, packTypeId) => {
        const product = products.find(p => p._id === productId);
        if (product && product.typesOfPacks) {
            const pack = product.typesOfPacks.find(p => p._id === packTypeId);
            return pack ? parseInt(pack.quantity) : 1;
        }
        return 1;
    };

    const getPackTypeName = (productId, packTypeId) => {
        const product = products.find(p => p._id === productId);
        if (product && product.typesOfPacks) {
            const pack = product.typesOfPacks.find(p => p._id === packTypeId);
            return pack ? pack.name : 'Each';
        }
        return 'Each';
    };

    const hasStockIssues = () => {
        return Object.values(stockWarnings).some(warning => warning && !warning.isValid);
    };

    const prepareProductsData = () => {
        return selectedProductIds.map(productId => {
            const packTypeId = productPackTypes[productId];
            const packQuantity = getPackQuantity(productId, packTypeId);
            const unitsQuantity = productUnitsQuantities[productId] || 1;
            const packTypeName = getPackTypeName(productId, packTypeId);

            return {
                product: productId,
                packType: packTypeName,
                packQuantity: packQuantity,
                unitsQuantity: unitsQuantity
            };
        });
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

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            setError('You can upload a maximum of 10 images');
            return;
        }

        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            setError('Please select only image files');
            return;
        }

        setImageFiles(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        setError('');
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(null);
        }
    };

    const handleRemoveImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        URL.revokeObjectURL(imagePreviews[index]);

        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async () => {
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
        if (!formData.eachPrice) {
            setError('Please enter a price');
            return;
        }

        const missingPackTypes = selectedProductIds.filter(id => !productPackTypes[id]);
        if (missingPackTypes.length > 0) {
            setError('Please select pack types for all selected products');
            return;
        }

        const missingUnitsQuantities = selectedProductIds.filter(id =>
            !productUnitsQuantities[id] || productUnitsQuantities[id] <= 0
        );
        if (missingUnitsQuantities.length > 0) {
            setError('Please enter valid units quantities for all selected products');
            return;
        }

        if (hasStockIssues()) {
            setError('Some products have stock level issues. Please resolve them before creating the product group.');
            return;
        }

        setLoading(true);
        setError('');

        const productsData = prepareProductsData();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('slug', formData.slug);
        formDataToSend.append('sku', formData.sku);
        formDataToSend.append('eachPrice', formData.eachPrice);
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('commerceCategoriesOne', formData.commerceCategoriesOne);
        formDataToSend.append('taxable', formData.taxable.toString());

        if (formData.primaryUnitsType) formDataToSend.append('primaryUnitsType', formData.primaryUnitsType);
        if (formData.pricingGroup) formDataToSend.append('pricingGroup', formData.pricingGroup);
        if (formData.commerceCategoriesTwo) formDataToSend.append('commerceCategoriesTwo', formData.commerceCategoriesTwo);
        if (formData.commerceCategoriesThree) formDataToSend.append('commerceCategoriesThree', formData.commerceCategoriesThree);
        if (formData.commerceCategoriesFour) formDataToSend.append('commerceCategoriesFour', formData.commerceCategoriesFour);
        if (formData.storeDescription) formDataToSend.append('storeDescription', formData.storeDescription);
        if (formData.pageTitle) formDataToSend.append('pageTitle', formData.pageTitle);
        if (formData.eachBarcodes) formDataToSend.append('eachBarcodes', formData.eachBarcodes);
        if (formData.packBarcodes) formDataToSend.append('packBarcodes', formData.packBarcodes);
        if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
        if (formData.sequence) formDataToSend.append('sequence', formData.sequence);

        formDataToSend.append('products', JSON.stringify(productsData));

        formDataToSend.append('productGroupThumbnail', thumbnailFile);
        imageFiles.forEach((file) => {
            formDataToSend.append('images', file);
        });

        try {
            const res = await axiosInstance.post('/product-group/create-product-group', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Create product group response:", res);

            if (res.data.statusCode === 200) {
                setFormData({
                    sku: '',
                    name: '',
                    slug: '',
                    products: [],
                    price: 0,
                    eachPrice: '',
                    primaryUnitsType: '',
                    pricingGroup: '',
                    commerceCategoriesOne: '',
                    commerceCategoriesTwo: '',
                    commerceCategoriesThree: '',
                    commerceCategoriesFour: '',
                    pageTitle: '',
                    storeDescription: '',
                    eachBarcodes: '',
                    packBarcodes: '',
                    taxable: true,
                    comparePrice: '',
                    sequence: '',
                });
                setSelectedProductIds([]);
                setProductPackTypes({});
                setProductUnitsQuantities({});
                setStockWarnings({});
                handleRemoveThumbnail();
                setImageFiles([]);
                imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                setImagePreviews([]);

                navigate('/dashboard/productGroup/list');
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
            if (invalidFiles.length > 0) {
                setError('Please select only image files (jpg, png, gif, etc.)');
                return;
            }
            setSelectedImages(files);
            setError('');
        }
    };

    const handleImportCsvFile = async () => {
        if (!selectedFile) {
            setError('Please select a CSV file first');
            return;
        }

        try {
            setLoading(true);
            const formDataForUpload = new FormData();
            formDataForUpload.append('products', selectedFile);

            const res = await axiosInstance.post('/products/import-products', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);
                setError('CSV imported successfully!');
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    navigate('/dashboard/products/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred while importing CSV');
            console.error('CSV import error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportProductImages = async () => {
        if (!selectedImages || selectedImages.length === 0) {
            setError('Please select image files first');
            return;
        }

        try {
            setLoading(true);
            const formDataForUpload = new FormData();

            selectedImages.forEach((image) => {
                formDataForUpload.append('images', image);
            });

            const res = await axiosInstance.post('/products/import-product-images', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Images imported", res.data);

            if (res.data.statusCode === 200) {
                setImageDialogOpen(false);
                setSelectedImages([]);
                setError('Product images imported successfully!');
                const fileInput = document.getElementById('image-file-input');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred while importing images');
            console.error('Image import error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseCsvDialog = () => {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('');
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';
    };

    const handleCloseImageDialog = () => {
        setImageDialogOpen(false);
        setSelectedImages([]);
        setError('');
        const fileInput = document.getElementById('image-file-input');
        if (fileInput) fileInput.value = '';
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

    const fetchPricingGroups = async () => {
        try {
            const response = await axiosInstance.get('/pricing-groups/get-pricing-groups');
            console.log("response pricing groups", response);

            if (response.data.statusCode === 200) {
                setPricingGroups(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pricing groups list:', error);
            setError('Failed to fetch pricing groups');
        }
    };

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

    useEffect(() => {
        if (formData.commerceCategoriesOne) {
            fetchCategoryList();
        } else {
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
            setCategoryFour([]);
            setFormData(prev => ({
                ...prev,
                commerceCategoriesFour: ''
            }));
        }
    }, [formData.commerceCategoriesThree]);

    useEffect(() => {
        fetchProducts();
        fetchPricingGroups();
        fetchBrandsList();
    }, []);

    const selectedProductsDetails = products.filter(product =>
        selectedProductIds.includes(product._id)
    );


    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Create Product Kit',
        },
    ];

    return (
        <div>
            <Breadcrumb title="Create Product Kit" items={BCrumb} />
            <Grid container spacing={2}>
                {/* Product Group Name and Slug */}
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

                <Grid size={6}>
                    <CustomFormLabel htmlFor="sku" sx={{ mt: 2 }}>
                        Product Group SKU
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="sku"
                        fullWidth
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Product Group SKU"
                    />
                </Grid>

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

                {/* Multiple Product Images Upload */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="images-upload" sx={{ mt: 2 }}>
                        Product Group Images
                    </CustomFormLabel>
                    <input
                        id="images-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        style={{ display: 'none' }}
                    />
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button
                            variant="outlined"
                            component="label"
                            htmlFor="images-upload"
                            startIcon={<IconPhoto size="1.1rem" />}
                            disabled={loading}
                        >
                            Choose Images
                        </Button>
                        {imageFiles.length > 0 && (
                            <Typography variant="body2" color="primary">
                                {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected
                            </Typography>
                        )}
                    </Box>
                    {imagePreviews.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {imagePreviews.map((preview, index) => (
                                <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={preview}
                                        alt={`Product ${index + 1}`}
                                        style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                    <Button
                                        size="small"
                                        onClick={() => handleRemoveImage(index)}
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
                            ))}
                        </Box>
                    )}
                </Grid>

                {/* Each Price and Compare Price */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="eachPrice" sx={{ mt: 2 }}>
                        Each Price
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="eachPrice"
                        fullWidth
                        value={formData.eachPrice}
                        onChange={(e) => setFormData({ ...formData, eachPrice: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Each Price"
                    />
                </Grid>

                <Grid size={6}>
                    <CustomFormLabel htmlFor="comparePrice" sx={{ mt: 2 }}>
                        Compare Price
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="comparePrice"
                        fullWidth
                        value={formData.comparePrice}
                        onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Compare Price"
                    />
                </Grid>

                {/* Pricing Group */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="pricing-group-select" sx={{ mt: 2 }}>
                        Select Pricing Group
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="pricing-group-select"
                            value={pricingGroups.find(group => group._id === formData.pricingGroup) || null}
                            onChange={(event, newValue) => {
                                setFormData({ ...formData, pricingGroup: newValue ? newValue._id : '' });
                            }}
                            options={pricingGroups}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || pricingGroups.length === 0}
                            noOptionsText={pricingGroups.length === 0 ? 'Loading types...' : 'No pricing groups found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={pricingGroups.length === 0 ? 'Loading types...' : 'Search and select a pricing group'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                {/* Commerce Categories */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerce-category-one-select" sx={{ mt: 2 }}>
                        Select Commerce Category One (Brand)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="commerce-category-one-select"
                            value={categoryOne.find(category => category._id === formData.commerceCategoriesOne) || null}
                            onChange={(event, newValue) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesOne: newValue ? newValue._id : '',
                                    commerceCategoriesTwo: '',
                                    commerceCategoriesThree: '',
                                    commerceCategoriesFour: ''
                                });
                            }}
                            options={categoryOne}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || categoryOne.length === 0}
                            noOptionsText={categoryOne.length === 0 ? 'Loading brands...' : 'No brands found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={categoryOne.length === 0 ? 'Loading brands...' : 'Search and select a brand'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerce-category-two-select" sx={{ mt: 2 }}>
                        Select Commerce Category Two
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="commerce-category-two-select"
                            value={categoryTwo.find(category => category._id === formData.commerceCategoriesTwo) || null}
                            onChange={(event, newValue) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesTwo: newValue ? newValue._id : '',
                                    commerceCategoriesThree: '',
                                    commerceCategoriesFour: ''
                                });
                            }}
                            options={categoryTwo}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || categoryTwo.length === 0}
                            noOptionsText={categoryTwo.length === 0 ? 'Select brand first...' : 'No categories found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={categoryTwo.length === 0 ? 'Select brand first...' : 'Search and select a category'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerceCategoryThree-select" sx={{ mt: 2 }}>
                        Select Commerce Category Three
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="commerceCategoryThree-select"
                            value={categoryThree.find(category => category._id === formData.commerceCategoriesThree) || null}
                            onChange={(event, newValue) => {
                                setFormData({
                                    ...formData,
                                    commerceCategoriesThree: newValue ? newValue._id : '',
                                    commerceCategoriesFour: ''
                                });
                            }}
                            options={categoryThree}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || categoryThree.length === 0}
                            noOptionsText={categoryThree.length === 0 ? 'Select category first...' : 'No subcategories found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={categoryThree.length === 0 ? 'Select category first...' : 'Search and select a subcategory'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid size={6}>
                    <CustomFormLabel htmlFor="commerceCategoryFour-select" sx={{ mt: 2 }}>
                        Select Commerce Category Four
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="commerceCategoryFour-select"
                            value={categoryFour.find(category => category._id === formData.commerceCategoriesFour) || null}
                            onChange={(event, newValue) => {
                                setFormData({ ...formData, commerceCategoriesFour: newValue ? newValue._id : '' });
                            }}
                            options={categoryFour}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || categoryFour.length === 0}
                            noOptionsText={categoryFour.length === 0 ? 'No SubCategory Two Available' : 'No sub-subcategories found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={categoryFour.length === 0 ? 'No SubCategory Two Available' : 'Search and select a sub-subcategory'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                {/* Tax Selection */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="taxable-select" sx={{ mt: 2 }}>
                        Select Taxable
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="taxable-select"
                            value={formData.taxable}
                            onChange={(e) => {
                                setFormData({ ...formData, taxable: e.target.value });
                            }}
                            disabled={loading || taxOptions.length === 0}
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
                                {taxOptions.length === 0 ? 'No tax options available' : 'Select a tax option'}
                            </MenuItem>
                            {taxOptions.map((tax) => (
                                <MenuItem key={tax} value={tax}>
                                    {tax === true ? 'Taxable' : 'Non Taxable'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={6}>
                    <CustomFormLabel htmlFor="sequence" sx={{ mt: 2 }}>
                        Sequence
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="sequence"
                        fullWidth
                        value={formData.sequence}
                        onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Sequence"
                    />
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
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 400,
                                    },
                                },
                            }}
                        >
                            {/* Search Input */}
                            <Box sx={{ px: 2, py: 1, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Search products..."
                                    fullWidth
                                    value={productSearchQuery}
                                    onChange={handleProductSearch}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconSearch size="1rem" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <MenuItem value="" disabled>
                                {!Array.isArray(products) || products.length === 0 ? 'Loading products...' : 'Select products'}
                            </MenuItem>

                            {Array.isArray(products) && filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <MenuItem key={product._id} value={product._id}>
                                        <Checkbox checked={selectedProductIds.indexOf(product._id) > -1} />
                                        <ListItemText
                                            primary={`${product.sku} - ${product.ProductName}`}
                                            secondary={`$${product.eachPrice} | Stock: ${product.stockLevel || 0}`}
                                        />
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>
                                    No products found
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Selected Products Display with Pack Type and Units Quantity Selection */}
                {selectedProductsDetails.length > 0 && (
                    <Grid size={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            Selected Products ({selectedProductsDetails.length})
                        </Typography>

                        {hasStockIssues() && (
                            <Alert
                                severity="warning"
                                sx={{ mb: 2 }}
                                icon={<IconAlertCircle />}
                            >
                                Some products have stock level issues. Please adjust pack types or quantities before creating the product group.
                            </Alert>
                        )}

                        <Card variant="outlined">
                            <CardContent>
                                <List dense>
                                    {selectedProductsDetails.map((product) => {
                                        const stockWarning = stockWarnings[product._id];
                                        const hasStockIssue = stockWarning && !stockWarning.isValid;

                                        return (
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
                                                <Box sx={{ width: '100%' }}>
                                                    <ListItemText
                                                        primary={`${product.sku} - ${product.ProductName}`}
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    Price: ${product.eachPrice} | Available Stock: {product.stockLevel || 0}
                                                                </Typography>
                                                                {hasStockIssue && (
                                                                    <Alert
                                                                        severity="error"
                                                                        sx={{ mt: 1 }}
                                                                        icon={<IconAlertCircle size={18} />}
                                                                    >
                                                                        {stockWarning.message}
                                                                    </Alert>
                                                                )}
                                                            </Box>
                                                        }
                                                    />

                                                    <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                                        {/* Pack Type Selection */}
                                                        {product.typesOfPacks && product.typesOfPacks.length > 0 && (
                                                            <FormControl sx={{ minWidth: 200 }} error={hasStockIssue}>
                                                                <CustomFormLabel htmlFor={`pack-type-${product._id}`}>
                                                                    Pack Type
                                                                </CustomFormLabel>
                                                                <Select
                                                                    id={`pack-type-${product._id}`}
                                                                    value={productPackTypes[product._id] || ''}
                                                                    onChange={(e) => handlePackTypeChange(product._id, e.target.value)}
                                                                    displayEmpty
                                                                    size="small"
                                                                >
                                                                    <MenuItem value="" disabled>
                                                                        Select Pack Type
                                                                    </MenuItem>
                                                                    {product.typesOfPacks.map((pack) => (
                                                                        <MenuItem key={pack._id} value={pack._id}>
                                                                            {pack.name} (Pack Qty: {pack.quantity})
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        )}

                                                        {/* Units Quantity Input */}
                                                        <FormControl sx={{ minWidth: 150 }} error={hasStockIssue}>
                                                            <CustomFormLabel htmlFor={`units-quantity-${product._id}`}>
                                                                Units Quantity
                                                            </CustomFormLabel>
                                                            <CustomOutlinedInput
                                                                id={`units-quantity-${product._id}`}
                                                                type="number"
                                                                value={productUnitsQuantities[product._id] ?? 1}
                                                                onChange={(e) => handleUnitsQuantityChange(product._id, e.target.value)}
                                                                disabled={loading}
                                                                placeholder="Enter units"
                                                                size="small"
                                                                inputProps={{ min: 1 }}
                                                            />
                                                        </FormControl>

                                                        {/* Display Pack Quantity (read-only) */}
                                                        {productPackTypes[product._id] && (
                                                            <FormControl sx={{ minWidth: 150 }}>
                                                                <CustomFormLabel htmlFor={`pack-quantity-${product._id}`}>
                                                                    Pack Quantity
                                                                </CustomFormLabel>
                                                                <CustomOutlinedInput
                                                                    id={`pack-quantity-${product._id}`}
                                                                    value={getPackQuantity(product._id, productPackTypes[product._id])}
                                                                    disabled
                                                                    size="small"
                                                                />
                                                            </FormControl>
                                                        )}

                                                        {/* Display Total Requested Quantity */}
                                                        {productPackTypes[product._id] && (
                                                            <FormControl sx={{ minWidth: 150 }}>
                                                                <CustomFormLabel htmlFor={`total-quantity-${product._id}`}>
                                                                    Total Units
                                                                </CustomFormLabel>
                                                                <CustomOutlinedInput
                                                                    id={`total-quantity-${product._id}`}
                                                                    value={getPackQuantity(product._id, productPackTypes[product._id]) * (productUnitsQuantities[product._id] || 1)}
                                                                    disabled
                                                                    size="small"
                                                                />
                                                            </FormControl>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Store Description */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="storeDescription" sx={{ mt: 2 }}>
                        Store Description
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="storeDescription"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.storeDescription}
                        onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Store Description"
                    />
                </Grid>

                {/* Page Title */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="pageTitle" sx={{ mt: 2 }}>
                        Page Title
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="pageTitle"
                        fullWidth
                        value={formData.pageTitle}
                        onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Page Title"
                    />
                </Grid>

                {/* Barcodes */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="eachBarcodes" sx={{ mt: 2 }}>
                        Each Barcodes
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="eachBarcodes"
                        fullWidth
                        value={formData.eachBarcodes}
                        onChange={(e) => setFormData({ ...formData, eachBarcodes: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Each Barcodes"
                    />
                </Grid>
                <Grid size={6}>
                    <CustomFormLabel htmlFor="packBarcodes" sx={{ mt: 2 }}>
                        Pack Barcodes
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="packBarcodes"
                        fullWidth
                        value={formData.packBarcodes}
                        onChange={(e) => setFormData({ ...formData, packBarcodes: e.target.value })}
                        disabled={loading}
                        placeholder="Enter Pack Barcodes"
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

                {/* Submit Buttons */}
                <Grid size={12} mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || hasStockIssues()}
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

            {/* CSV Import Dialog */}
            <Dialog
                open={csvDialogOpen}
                onClose={handleCloseCsvDialog}
                maxWidth="sm"
                fullWidth
            >
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute',
                        borderRadius: 1
                    }}
                    open={loading}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <CircularProgress color="inherit" size={50} />
                        <Typography variant="body2" color="inherit">
                            Importing CSV file, please wait...
                        </Typography>
                    </Box>
                </Backdrop>

                <DialogTitle>
                    Import Products from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple products at once.
                        </Typography>

                        <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="csv-file-input"
                                startIcon={loading ? <CircularProgress size={16} /> : <IconUpload size="1.1rem" />}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Choose File'}
                            </Button>

                            {selectedFile && !loading && (
                                <Typography variant="body2" color="primary">
                                    {selectedFile.name}
                                </Typography>
                            )}
                        </Box>

                        {error && !error.includes('success') && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseCsvDialog}
                        disabled={loading}
                        sx={{ opacity: loading ? 0.5 : 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportCsvFile}
                        variant="contained"
                        disabled={!selectedFile || loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconFileImport size="1.1rem" />}
                        sx={{ backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Import Dialog */}
            <Dialog
                open={imageDialogOpen}
                onClose={handleCloseImageDialog}
                maxWidth="sm"
                fullWidth
            >
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: "absolute",
                        borderRadius: 1,
                    }}
                    open={loading}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <CircularProgress color="inherit" size={50} />
                        <Typography variant="body2" color="inherit">
                            Importing product images, please wait...
                        </Typography>
                    </Box>
                </Backdrop>

                <DialogTitle>Import Product Images</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select multiple image files or a folder to import. Images should follow
                            the naming convention: <b>SKU_1, SKU_2, etc.</b>
                        </Typography>

                        <input
                            id="image-file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFileChange}
                            style={{ display: "none" }}
                        />
                        <input
                            id="image-folder-input"
                            type="file"
                            webkitdirectory="true"
                            onChange={handleImageFileChange}
                            style={{ display: "none" }}
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="image-file-input"
                                startIcon={
                                    loading ? <CircularProgress size={16} /> : <IconPhoto size="1.1rem" />
                                }
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Choose Images"}
                            </Button>

                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="image-folder-input"
                                startIcon={<IconPhoto size="1.1rem" />}
                                disabled={loading}
                            >
                                Choose Folder
                            </Button>

                            {selectedImages.length > 0 && !loading && (
                                <Typography variant="body2" color="primary">
                                    {selectedImages.length} image
                                    {selectedImages.length > 1 ? "s" : ""} selected
                                </Typography>
                            )}
                        </Box>

                        {selectedImages.length > 0 && !loading && (
                            <Box sx={{ mt: 2, maxHeight: 200, overflow: "auto" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                    Selected Images:
                                </Typography>
                                {selectedImages.map((image, index) => (
                                    <Typography key={index} variant="caption" display="block" sx={{ pl: 2 }}>
                                        • {image.name}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        {error && !error.includes("success") && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}

                        {error && error.includes("success") && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleCloseImageDialog}
                        disabled={loading}
                        sx={{ opacity: loading ? 0.5 : 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportProductImages}
                        variant="contained"
                        disabled={selectedImages.length === 0 || loading}
                        startIcon={
                            loading ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <IconUpload size="1.1rem" />
                            )
                        }
                        sx={{ backgroundColor: "#2E2F7F" }}
                    >
                        {loading ? "Importing..." : "Import Images"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CreateProductGroup;