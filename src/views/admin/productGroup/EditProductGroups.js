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
import { useNavigate, useParams } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const EditProductGroups = () => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    products: [],
    price: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const { id } = useParams();

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
      price: parseFloat(totalPrice.toFixed(2))
    }));
  };

  // Remove selected product
  const handleRemoveProduct = (productId) => {
    const updatedSelectedIds = selectedProductIds.filter(id => id !== productId);
    setSelectedProductIds(updatedSelectedIds);

    const selectedProducts = products.filter(product =>
      updatedSelectedIds.includes(product._id)
    );

    const totalPrice = selectedProducts.reduce((sum, product) => {
      return sum + (product.eachPrice || 0);
    }, 0);

    setFormData(prev => ({
      ...prev,
      products: updatedSelectedIds,
      price: parseFloat(totalPrice.toFixed(2))
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

    setLoading(true);
    setError('');

    // Create FormData object for multipart form submission
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('slug', formData.slug);
    formDataToSend.append('price', formData.price.toString());

    // Append products as array
    selectedProductIds.forEach(productId => {
      formDataToSend.append('products', productId);
    });

    // Append thumbnail image if a new one was selected
    if (thumbnailFile) {
      formDataToSend.append('productGroupThumbnail', thumbnailFile);
    }

    try {
      const res = await axiosInstance.put(`/product-group/update-product-group/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Update product group response:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/productGroup/list');
      } else if (res.data.statusCode === 400) {
        setError(res.data.message);
      }

    } catch (error) {
      console.error('Update product group error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update product group');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
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
    }
  };

  const fetchProductGroupDetails = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/product-group/get-product-group/${id}`);
      console.log("response product group details", response);

      if (response.data.statusCode === 200) {
        const productGroup = response.data.data;
        
        // Set form data with product group details
        setFormData({
          name: productGroup.name || '',
          slug: productGroup.slug || '',
          products: productGroup.products ? productGroup.products.map(p => p._id) : [],
          price: productGroup.price || 0,
        });

        // Set selected product IDs
        const productIds = productGroup.products ? productGroup.products.map(p => p._id) : [];
        setSelectedProductIds(productIds);

        // Set thumbnail preview if exists
        if (productGroup.thumbnail) {
          setThumbnailPreview(productGroup.thumbnail);
        }

        console.log("Loaded product group:", {
          name: productGroup.name,
          products: productIds,
          price: productGroup.price,
          thumbnail: productGroup.thumbnail
        });
      } else {
        setError('Failed to fetch product group details');
      }
    } catch (error) {
      console.error('Error fetching product group details:', error);
      setError(error.response?.data?.message || error.message || 'Error fetching product group details');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchProductGroupDetails();
  }, [id]);

  // Get selected products details for display
  const selectedProductsDetails = products.filter(product =>
    selectedProductIds.includes(product._id)
  );

  // Calculate total price whenever selected products change
  useEffect(() => {
    if (selectedProductIds.length > 0 && products.length > 0) {
      const totalPrice = selectedProductsDetails.reduce((sum, product) => {
        return sum + (product.eachPrice || 0);
      }, 0);
      
      setFormData(prev => ({
        ...prev,
        price: parseFloat(totalPrice.toFixed(2))
      }));
    }
  }, [selectedProductIds, products]);

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
            disabled={loading || fetching}
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
            disabled={loading || fetching}
            placeholder="Auto-generated slug"
          />
        </Grid>

        {/* Thumbnail Image Upload */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="thumbnail-upload" sx={{ mt: 2 }}>
            Product Group Thumbnail
            {!thumbnailPreview && <span style={{ color: 'red' }}>*</span>}
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
              disabled={loading || fetching}
            >
              {thumbnailPreview ? 'Change Thumbnail' : 'Choose Thumbnail'}
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
              disabled={loading || fetching || !Array.isArray(products) || products.length === 0}
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
                          disabled={loading || fetching}
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
          </CustomFormLabel>
          <CustomOutlinedInput
            id="price"
            fullWidth
            value={`$${formData.price.toFixed(2)}`}
            disabled
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiOutlinedInput-input': {
                color: '#2E2F7F',
                fontWeight: 'bold'
              }
            }}
          />
          <Typography variant="caption" color="textSecondary">
            Auto-calculated from selected products
          </Typography>
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
            disabled={loading || fetching}
            sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Updating...' : 'Update Product Group'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/dashboard/product-groups/list')}
            sx={{ ml: 2 }}
            disabled={loading || fetching}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={fetching}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={50} />
          <Typography variant="body2" color="inherit">
            Loading product group details...
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
};

export default EditProductGroups;