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
    sequence: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Commerce category states
  const [categoryOne, setCategoryOne] = useState([]);
  const [categoryTwo, setCategoryTwo] = useState([]);
  const [categoryThree, setCategoryThree] = useState([]);
  const [categoryFour, setCategoryFour] = useState([]);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [taxOptions, setTaxOptions] = useState([true, false]);

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
      price: totalPrice
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
      price: totalPrice
    }));
  };

  // Image handling functions
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
    if (!formData.commerceCategoriesOne) {
      setError('Please select a brand (Commerce Category One)');
      return;
    }
    if (!formData.eachPrice) {
      setError('Please enter a price');
      return;
    }

    setLoading(true);
    setError('');

    // Create FormData object for multipart form submission
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('slug', formData.slug);
    formDataToSend.append('eachPrice', formData.eachPrice);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('commerceCategoriesOne', formData.commerceCategoriesOne);
    formDataToSend.append('taxable', formData.taxable.toString());

    // Append all other fields
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
    if (formData.sku) formDataToSend.append('sku', formData.sku);
    if (formData.sequence !== null) formDataToSend.append('sequence', formData.sequence);

    // Append products as JSON string
    formDataToSend.append('products', JSON.stringify(selectedProductIds));

    // Append thumbnail image if a new one was selected
    if (thumbnailFile) {
      formDataToSend.append('productGroupThumbnail', thumbnailFile);
    }

    // Append new images if any were selected
    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

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

  const fetchCategoryList = async (brandId) => {
    if (!brandId) return;

    try {
      console.log("Fetching categories for brand ID:", brandId);
      const response = await axiosInstance.get(`/category/get-categories-by-brand-id/${brandId}`);
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

  const fetchSubCategoryList = async (categoryId) => {
    if (!categoryId) return;

    try {
      console.log("Fetching subcategories for category ID:", categoryId);
      const response = await axiosInstance.get(`/subcategory/get-sub-categories-by-category-id/${categoryId}`);
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

  const fetchSubCategoryTwoList = async (subCategoryId) => {
    if (!subCategoryId) return;

    try {
      console.log("Fetching sub-subcategories for subcategory ID:", subCategoryId);
      const response = await axiosInstance.get(`/subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`);
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

  const fetchProductGroupDetails = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/product-group/get-product-group/${id}`);
      console.log("response product group details", response);

      if (response.data.statusCode === 200) {
        const productGroup = response.data.data;

        // Extract category IDs from the nested objects
        const commerceCategoriesOneId = productGroup.commerceCategoriesOne?._id || '';
        const commerceCategoriesTwoId = productGroup.commerceCategoriesTwo?._id || '';
        const commerceCategoriesThreeId = productGroup.commerceCategoriesThree?._id || '';
        const commerceCategoriesFourId = productGroup.commerceCategoriesFour?._id || '';
        const pricingGroupId = productGroup.pricingGroup?._id || '';

        // Set form data with product group details
        setFormData({
          sku: productGroup.sku || '',
          name: productGroup.name || '',
          slug: productGroup.slug || '',
          products: productGroup.products ? productGroup.products.map(p => p._id) : [],
          price: productGroup.price || 0,
          eachPrice: productGroup.eachPrice || '',
          primaryUnitsType: productGroup.primaryUnitsType || '',
          pricingGroup: pricingGroupId,
          commerceCategoriesOne: commerceCategoriesOneId,
          commerceCategoriesTwo: commerceCategoriesTwoId,
          commerceCategoriesThree: commerceCategoriesThreeId,
          commerceCategoriesFour: commerceCategoriesFourId,
          pageTitle: productGroup.pageTitle || '',
          storeDescription: productGroup.storeDescription || '',
          eachBarcodes: productGroup.eachBarcodes || '',
          packBarcodes: productGroup.packBarcodes || '',
          taxable: productGroup.taxable !== undefined ? productGroup.taxable : true,
          comparePrice: productGroup.comparePrice || '',
          sequence: productGroup.sequence !== undefined ? productGroup.sequence : null,
        });

        // Set selected product IDs
        const productIds = productGroup.products ? productGroup.products.map(p => p._id) : [];
        setSelectedProductIds(productIds);

        // Set thumbnail preview if exists
        if (productGroup.thumbnail) {
          setThumbnailPreview(productGroup.thumbnail);
        }

        // Set existing images previews
        if (productGroup.images && Array.isArray(productGroup.images)) {
          // Filter out the thumbnail from images array to avoid duplication
          const additionalImages = productGroup.images.filter(img => img !== productGroup.thumbnail);
          setImagePreviews(additionalImages);
        }

        console.log("Loaded product group:", {
          name: productGroup.name,
          products: productIds,
          price: productGroup.price,
          eachPrice: productGroup.eachPrice,
          thumbnail: productGroup.thumbnail,
          images: productGroup.images,
          commerceCategories: {
            one: commerceCategoriesOneId,
            two: commerceCategoriesTwoId,
            three: commerceCategoriesThreeId,
            four: commerceCategoriesFourId
          },
          pricingGroup: pricingGroupId,
          taxable: productGroup.taxable
        });

        // Fetch child categories based on loaded commerce categories
        if (commerceCategoriesOneId) {
          fetchCategoryList(commerceCategoriesOneId).then(() => {
            if (commerceCategoriesTwoId) {
              fetchSubCategoryList(commerceCategoriesTwoId).then(() => {
                if (commerceCategoriesThreeId) {
                  fetchSubCategoryTwoList(commerceCategoriesThreeId);
                }
              });
            }
          });
        }
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

  // Effects for commerce category dependencies
  useEffect(() => {
    if (formData.commerceCategoriesOne) {
      fetchCategoryList(formData.commerceCategoriesOne);
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
      fetchSubCategoryList(formData.commerceCategoriesTwo);
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
      fetchSubCategoryTwoList(formData.commerceCategoriesThree);
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
    fetchPricingGroups();
    fetchBrandsList();
    fetchProductGroupDetails();
  }, [id]);

  // Get selected products details for display
  const selectedProductsDetails = products.filter(product =>
    selectedProductIds.includes(product._id)
  );

  return (
    <div>
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
            disabled={loading || fetching}
            placeholder="Enter Product Group Name"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 2 }}>
            Product Group SKU
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="name"
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
              disabled={loading || fetching}
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
            disabled={loading || fetching}
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
            disabled={loading || fetching}
            placeholder="Enter Compare Price"
          />
        </Grid>

        {/* Pricing Group */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="pricing-group-select" sx={{ mt: 2 }}>
            Select Pricing Group
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="pricing-group-select"
              value={formData.pricingGroup}
              onChange={(e) => setFormData({ ...formData, pricingGroup: e.target.value })}
              disabled={loading || fetching || pricingGroups.length === 0}
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
                {pricingGroups.length === 0 ? 'Loading types...' : 'Select a type'}
              </MenuItem>
              {pricingGroups.map((group) => (
                <MenuItem key={group.name} value={group._id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
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
              disabled={loading || fetching || taxOptions.length === 0}
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
          <CustomFormLabel htmlFor="stockLevel" sx={{ mt: 2 }}>
            Sequence
          </CustomFormLabel>
          <CustomOutlinedInput
            id="stockLevel"
            fullWidth
            value={formData.sequence}
            onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
            disabled={loading}
            placeholder="Enter Sequence "
          />
        </Grid>

        {/* Commerce Categories */}
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
                  commerceCategoriesTwo: '',
                  commerceCategoriesThree: '',
                  commerceCategoriesFour: ''
                });
              }}
              disabled={loading || fetching || categoryOne.length === 0}
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
                  commerceCategoriesThree: '',
                  commerceCategoriesFour: ''
                });
              }}
              disabled={loading || fetching || categoryTwo.length === 0}
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
                  commerceCategoriesFour: ''
                });
              }}
              disabled={loading || fetching || categoryThree.length === 0}
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
              disabled={loading || fetching || categoryFour.length === 0}
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

        {/* Store Description */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="storeDescription" sx={{ mt: 2 }}>
            Store Description
          </CustomFormLabel>
          <CustomOutlinedInput
            id="storeDescription"
            fullWidth
            value={formData.storeDescription}
            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
            disabled={loading || fetching}
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
            disabled={loading || fetching}
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
            disabled={loading || fetching}
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
            disabled={loading || fetching}
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



    </div>
  );
};

export default EditProductGroups;