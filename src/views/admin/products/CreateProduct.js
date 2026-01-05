import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Checkbox, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions, Chip } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconPhoto, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateProduct = () => {
  const [formData, setFormData] = React.useState({
    sku: '',
    ProductName: '',
    eachPrice: '',
    primaryUnitsType: '',
    pricingGroup: '',
    stockLevel: '',
    typesOfPacks: [],
    commerceCategoriesOne: [],
    commerceCategoriesTwo: [],
    commerceCategoriesThree: [],
    commerceCategoriesFour: [],
    pageTitle: '',
    storeDescription: '',
    eachBarcodes: '',
    packBarcodes: '',
    productImg: '',
    taxable: true,
    comparePrice: '',
    sequence: null,
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);

  const [thumbnailFile, setThumbnailFile] = React.useState(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState(null);
  const [imageFiles, setImageFiles] = React.useState([]);
  const [imagePreviews, setImagePreviews] = React.useState([]);

  // New state for image import dialog
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);

  const [packTypes, setPackTypes] = useState([]);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [categoryOne, setCategoryOne] = useState([]); // Brands
  const [categoryTwo, setCategoryTwo] = useState([]); // Categories (filtered by brand)
  const [categoryThree, setCategoryThree] = useState([]); // Subcategories (filtered by category)
  const [categoryFour, setCategoryFour] = useState([]); // Sub-subcategories (filtered by subcategory)
  const [taxOptions, setTaxOptions] = useState([true, false]);

  const [typesList, setTypesList] = useState(["Inventory Item", "Kit/Package", "Service", "Non-Inventory Item"]);

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

  // Handle multiple images selection
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

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
  };

  // Remove specific image
  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.sku.trim()) {
      setError('Please enter a SKU');
      return;
    }
    if (!formData.ProductName) {
      setError('Please enter a product name');
      return;
    }
    if (!formData.eachPrice) {
      setError('Please enter a price');
      return;
    }

    // Validate compare price
    if (formData.comparePrice && parseFloat(formData.comparePrice) <= parseFloat(formData.eachPrice)) {
      setError('Compare price must be greater than each price');
      return;
    }

    // Validate at least one brand is selected
    if (!formData.commerceCategoriesOne || formData.commerceCategoriesOne.length === 0) {
      setError('Please select at least one brand (Commerce Category One)');
      return;
    }

    setLoading(true);
    setError('');

    // Create FormData object for multipart form submission
    const formDataToSend = new FormData();

    // Append all text fields
    formDataToSend.append('sku', formData.sku);
    formDataToSend.append('ProductName', formData.ProductName);
    formDataToSend.append('eachPrice', formData.eachPrice);
    formDataToSend.append('stockLevel', formData.stockLevel);
    if (formData.pricingGroup) {
      formDataToSend.append('pricingGroup', formData.pricingGroup);
    }

    // Append array fields - FIXED FOR MULTIPLE SELECTION
    formData.typesOfPacks.forEach(pack => {
      formDataToSend.append('typesOfPacks', pack);
    });

    // Append commerce categories as arrays
    formData.commerceCategoriesOne.forEach(category => {
      formDataToSend.append('commerceCategoriesOne', category);
    });

    formData.commerceCategoriesTwo.forEach(category => {
      formDataToSend.append('commerceCategoriesTwo', category);
    });

    formData.commerceCategoriesThree.forEach(category => {
      formDataToSend.append('commerceCategoriesThree', category);
    });

    formData.commerceCategoriesFour.forEach(category => {
      formDataToSend.append('commerceCategoriesFour', category);
    });

    // Append optional fields
    if (formData.storeDescription) formDataToSend.append('storeDescription', formData.storeDescription);
    if (formData.pageTitle) formDataToSend.append('pageTitle', formData.pageTitle);
    if (formData.eachBarcodes) formDataToSend.append('eachBarcodes', formData.eachBarcodes);
    if (formData.packBarcodes) formDataToSend.append('packBarcodes', formData.packBarcodes);
    if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
    if (formData.sequence) formDataToSend.append('sequence', formData.sequence);
    formDataToSend.append('taxable', formData.taxable);

    // Append thumbnail image
    if (thumbnailFile) {
      formDataToSend.append('thumbnail', thumbnailFile);
    }

    // Append multiple images
    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      const res = await axiosInstance.post('/products/create-product', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Create product response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          sku: '',
          ProductName: '',
          eachPrice: '',
          stockLevel: '',
          typesOfPacks: [],
          pricingGroup: '',
          commerceCategoriesOne: [],
          commerceCategoriesTwo: [],
          commerceCategoriesThree: [],
          commerceCategoriesFour: [],
          storeDescription: '',
          pageTitle: '',
          eachBarcodes: '',
          packBarcodes: '',
          taxable: true,
          comparePrice: '',
          sequence: null,
        });

        handleRemoveThumbnail();
        setImageFiles([]);
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImagePreviews([]);

        setError('Product created successfully!');
        
        // Navigate after 2 seconds to show success message
        setTimeout(() => {
          navigate('/dashboard/products/list');
        }, 2000);

      } else if (res.data.statusCode === 400) {
        console.log("Create product error:", res.data.message);
        setError(res.data.message);
      }

    } catch (error) {
      console.error('Create product error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create product');
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

  // New function to handle image file selection
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

  // New function to handle image import
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

  // New function to handle image dialog close
  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImages([]);
    setError('');
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
  };

  // Fetch functions with proper error handling
  const fetchPackTypesList = async () => {
    try {
      const response = await axiosInstance.get('/packs-types/get-all-packs-types');
      console.log("response pack types list", response);

      if (response.status === 200) {
        setPackTypes(response.data.data.packs || []);
      }
    } catch (error) {
      console.error('Error fetching pack types list:', error);
      setError('Failed to fetch pack types');
    }
  };

  const fetchPricingGroups = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups/get-pricing-groups');
      console.log("response pricing groups", response);

      if (response.data.statusCode === 200) {
        setPricingGroups(response.data.data || []);
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
        setCategoryOne(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError('Failed to fetch brands');
    }
  };

  // Fetch categories by selected brand IDs
  const fetchCategoriesByBrandIds = async (brandIds) => {
    if (!brandIds || brandIds.length === 0) {
      setCategoryTwo([]);
      return;
    }

    try {
      // For multiple brands, we need to fetch categories for each brand
      const allCategories = [];
      const uniqueCategoryIds = new Set();
      
      for (const brandId of brandIds) {
        const response = await axiosInstance.get(`/category/get-categories-by-brand-id/${brandId}`);
        
        if (response.data.statusCode === 200 && response.data.data) {
          response.data.data.forEach(category => {
            if (!uniqueCategoryIds.has(category._id)) {
              uniqueCategoryIds.add(category._id);
              allCategories.push(category);
            }
          });
        }
      }
      
      setCategoryTwo(allCategories);
    } catch (error) {
      console.error('Error fetching categories by brand:', error);
      setCategoryTwo([]);
      setError('Failed to fetch categories for selected brands');
    }
  };

  // Fetch subcategories by selected category IDs
  const fetchSubCategoriesByCategoryIds = async (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) {
      setCategoryThree([]);
      return;
    }

    try {
      // For multiple categories, fetch subcategories for each category
      const allSubCategories = [];
      const uniqueSubCategoryIds = new Set();
      
      for (const categoryId of categoryIds) {
        const response = await axiosInstance.get(`/subcategory/get-sub-categories-by-category-id/${categoryId}`);
        
        if (response.data.statusCode === 200 && response.data.data) {
          response.data.data.forEach(subCategory => {
            if (!uniqueSubCategoryIds.has(subCategory._id)) {
              uniqueSubCategoryIds.add(subCategory._id);
              allSubCategories.push(subCategory);
            }
          });
        }
      }
      
      setCategoryThree(allSubCategories);
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      setCategoryThree([]);
      setError('Failed to fetch subcategories for selected categories');
    }
  };

  // Fetch sub-subcategories by selected subcategory IDs
  const fetchSubCategoriesTwoByCategoryIds = async (subCategoryIds) => {
    if (!subCategoryIds || subCategoryIds.length === 0) {
      setCategoryFour([]);
      return;
    }

    try {
      // For multiple subcategories, fetch sub-subcategories for each subcategory
      const allSubCategoriesTwo = [];
      const uniqueSubCategoryTwoIds = new Set();
      
      for (const subCategoryId of subCategoryIds) {
        const response = await axiosInstance.get(`/subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`);
        
        if (response.data.statusCode === 200 && response.data.data) {
          response.data.data.forEach(subCategoryTwo => {
            if (!uniqueSubCategoryTwoIds.has(subCategoryTwo._id)) {
              uniqueSubCategoryTwoIds.add(subCategoryTwo._id);
              allSubCategoriesTwo.push(subCategoryTwo);
            }
          });
        }
      }
      
      setCategoryFour(allSubCategoriesTwo);
    } catch (error) {
      console.error('Error fetching sub-subcategories by subcategory:', error);
      setCategoryFour([]);
      setError('Failed to fetch sub-subcategories for selected subcategories');
    }
  };

  // Load all initial data on component mount
  useEffect(() => {
    fetchPackTypesList();
    fetchPricingGroups();
    fetchBrandsList();
    // Don't fetch categories initially - wait for brand selection
  }, []);

  // Effect to fetch categories when brands change
  useEffect(() => {
    if (formData.commerceCategoriesOne && formData.commerceCategoriesOne.length > 0) {
      fetchCategoriesByBrandIds(formData.commerceCategoriesOne);
    } else {
      // If no brands selected, clear all dependent categories
      setCategoryTwo([]);
      setCategoryThree([]);
      setCategoryFour([]);
      // Also clear the selections in formData
      setFormData(prev => ({
        ...prev,
        commerceCategoriesTwo: [],
        commerceCategoriesThree: [],
        commerceCategoriesFour: []
      }));
    }
  }, [formData.commerceCategoriesOne]);

  // Effect to fetch subcategories when categories change
  useEffect(() => {
    if (formData.commerceCategoriesTwo && formData.commerceCategoriesTwo.length > 0) {
      fetchSubCategoriesByCategoryIds(formData.commerceCategoriesTwo);
    } else {
      // If no categories selected, clear dependent subcategories
      setCategoryThree([]);
      setCategoryFour([]);
      // Also clear the selections in formData
      setFormData(prev => ({
        ...prev,
        commerceCategoriesThree: [],
        commerceCategoriesFour: []
      }));
    }
  }, [formData.commerceCategoriesTwo]);

  // Effect to fetch sub-subcategories when subcategories change
  useEffect(() => {
    if (formData.commerceCategoriesThree && formData.commerceCategoriesThree.length > 0) {
      fetchSubCategoriesTwoByCategoryIds(formData.commerceCategoriesThree);
    } else {
      // If no subcategories selected, clear sub-subcategories
      setCategoryFour([]);
      // Also clear the selection in formData
      setFormData(prev => ({
        ...prev,
        commerceCategoriesFour: []
      }));
    }
  }, [formData.commerceCategoriesThree]);

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Product',
    },
  ];

  return (
    <div>
      <Breadcrumb title="Create Product" items={BCrumb} />
      <Grid container spacing={2}>
        {/* SKU and Product Name - Two per row */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="thumbnail-upload" sx={{ mt: 2 }}>
            Product Thumbnail
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
            Product Images
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

        <Grid size={6}>
          <CustomFormLabel htmlFor="pack-name" sx={{ mt: 2 }}>
            SKU
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="pack-name"
            fullWidth
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Enter SKU"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="ProductName" sx={{ mt: 2 }}>
            ProductName
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="ProductName"
            fullWidth
            value={formData.ProductName}
            onChange={(e) => setFormData({ ...formData, ProductName: e.target.value })}
            disabled={loading}
            placeholder="Enter ProductName"
          />
        </Grid>

        {/* Each Price and Stock Level - Two per row */}
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
          <CustomFormLabel htmlFor="stockLevel" sx={{ mt: 2 }}>
            Compare Price
          </CustomFormLabel>
          <CustomOutlinedInput
            id="stockLevel"
            fullWidth
            value={formData.comparePrice}
            onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
            disabled={loading}
            placeholder="Enter Compare Price "
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="stockLevel" sx={{ mt: 2 }}>
            Stock Level
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="stockLevel"
            fullWidth
            value={formData.stockLevel}
            onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
            disabled={loading}
            placeholder="Enter stock Level"
          />
        </Grid>

        {/* Type of Packs Selection - Full Width */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="types-of-packs-select" sx={{ mt: 2 }}>
            Select Type Of Packs (Multiple)
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="types-of-packs-select"
              multiple
              value={packTypes.filter(pack => formData.typesOfPacks.includes(pack._id))}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  typesOfPacks: newValue.map(pack => pack._id)
                });
              }}
              options={packTypes}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || packTypes.length === 0}
              noOptionsText={packTypes.length === 0 ? 'Loading types...' : 'No pack types found'}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={packTypes.length === 0 ? 'Loading types...' : 'Search and select pack types'}
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

        {/* Pricing Group and Commerce Category One - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="pricing-group-select" sx={{ mt: 2 }}>
            Select PricingGroup
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

        {/* commerce categories */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="commerce-category-one-select" sx={{ mt: 2 }}>
            Select Commerce category One (Brand)
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="commerce-category-one-select"
              value={categoryOne.filter(category =>
                formData.commerceCategoriesOne.includes(category._id)
              )}
              onChange={(event, newValue) => {
                const newBrandIds = newValue.map(v => v._id);
                setFormData({
                  ...formData,
                  commerceCategoriesOne: newBrandIds,
                  commerceCategoriesTwo: [],
                  commerceCategoriesThree: [],
                  commerceCategoriesFour: []
                });
                
                // Fetch categories for selected brands
                fetchCategoriesByBrandIds(newBrandIds);
              }}
              options={categoryOne}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryOne.length === 0}
              noOptionsText={categoryOne.length === 0 ? 'Loading brands...' : 'No brands found'}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryOne.length === 0 ? 'Loading brands...' : 'Search and select a brand'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="commerce-category-two-select" sx={{ mt: 2 }}>
            Select Commerce category Two (Multiple)
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="commerce-category-two-select"
              value={categoryTwo.filter(category =>
                formData.commerceCategoriesTwo.includes(category._id)
              )}
              onChange={(event, newValue) => {
                const newCategoryIds = newValue.map(v => v._id);
                setFormData({
                  ...formData,
                  commerceCategoriesTwo: newCategoryIds,
                  commerceCategoriesThree: [],
                  commerceCategoriesFour: []
                });
                
                // Fetch subcategories for selected categories
                fetchSubCategoriesByCategoryIds(newCategoryIds);
              }}
              options={categoryTwo}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryTwo.length === 0}
              noOptionsText={
                formData.commerceCategoriesOne.length === 0 
                  ? 'Please select brands first' 
                  : categoryTwo.length === 0 
                    ? 'No categories available for selected brands' 
                    : 'No categories found'
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    formData.commerceCategoriesOne.length === 0 
                      ? 'Please select brands first' 
                      : categoryTwo.length === 0 
                        ? 'No categories available for selected brands' 
                        : 'Search and select categories'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="commerceCategoryThree-select" sx={{ mt: 2 }}>
            Select Commerce category Three (Multiple)
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="commerceCategoryThree-select"
              value={categoryThree.filter(category =>
                formData.commerceCategoriesThree.includes(category._id)
              )}
              onChange={(event, newValue) => {
                const newSubCategoryIds = newValue.map(v => v._id);
                setFormData({
                  ...formData,
                  commerceCategoriesThree: newSubCategoryIds,
                  commerceCategoriesFour: []
                });
                
                // Fetch sub-subcategories for selected subcategories
                fetchSubCategoriesTwoByCategoryIds(newSubCategoryIds);
              }}
              options={categoryThree}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryThree.length === 0}
              noOptionsText={
                formData.commerceCategoriesTwo.length === 0 
                  ? 'Please select categories first' 
                  : categoryThree.length === 0 
                    ? 'No subcategories available for selected categories' 
                    : 'No subcategories found'
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    formData.commerceCategoriesTwo.length === 0 
                      ? 'Please select categories first' 
                      : categoryThree.length === 0 
                        ? 'No subcategories available for selected categories' 
                        : 'Search and select subcategories'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="commerceCategoryFour-select" sx={{ mt: 2 }}>
            Select Commerce category four (Multiple)
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              multiple
              id="commerceCategoryFour-select"
              value={categoryFour.filter(category =>
                formData.commerceCategoriesFour.includes(category._id)
              )}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  commerceCategoriesFour: newValue.map(v => v._id)
                });
              }}
              options={categoryFour}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryFour.length === 0}
              noOptionsText={
                formData.commerceCategoriesThree.length === 0 
                  ? 'Please select subcategories first' 
                  : categoryFour.length === 0 
                    ? 'No sub-subcategories available for selected subcategories' 
                    : 'No sub-subcategories found'
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    formData.commerceCategoriesThree.length === 0 
                      ? 'Please select subcategories first' 
                      : categoryFour.length === 0 
                        ? 'No sub-subcategories available for selected subcategories' 
                        : 'Search and select sub-subcategories'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.87)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        {/* tax selection */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="taxable-select" sx={{ mt: 2 }}>
            Select taxable
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
            type="number"
            value={formData.sequence}
            onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
            disabled={loading}
            placeholder="Enter Sequence"
          />
        </Grid>

        {/* Store Description - Full Width */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="storeDescription" sx={{ mt: 2 }}>
            Store Description
          </CustomFormLabel>
          <CustomOutlinedInput
            id="storeDescription"
            fullWidth
            multiline
            rows={3}
            value={formData.storeDescription}
            onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
            disabled={loading}
            placeholder="Enter Store Description"
          />
        </Grid>

        {/* Page Title - Full Width */}
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

        {/* Each Barcodes and Pack Barcodes - Two per row */}
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

        {/* Submit Button */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setImageDialogOpen(true)}
            startIcon={<IconPhoto size="1.1rem" />}
            sx={{ ml: 2 }}
          >
            Import Product Images
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

            {/* Hidden inputs */}
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

export default CreateProduct;