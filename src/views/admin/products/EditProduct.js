import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Checkbox, Dialog, Chip, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconX, IconPhoto } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';

const EditProduct = () => {
  const [formData, setFormData] = React.useState({
    sku: '',
    ProductName: '',
    eachPrice: '',
    primaryUnitsType: '',
    pricingGroup: '',
    stockLevel: '',
    typesOfPacks: [],
    commerceCategoriesOne: '',
    commerceCategoriesTwo: '',
    commerceCategoriesThree: '',
    commerceCategoriesFour: '',
    badge: '',
    pageTitle: '',
    storeDescription: '',
    eachBarcodes: '',
    packBarcodes: '',
    comparePrice: 0,
    taxable: false,
    sequence: null,
  });

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const { id } = useParams();

  const [thumbnailFile, setThumbnailFile] = React.useState(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState(null);
  const [imageFiles, setImageFiles] = React.useState([]);
  const [imagePreviews, setImagePreviews] = React.useState([]);

  const [existingImages, setExistingImages] = React.useState([]);

  // Track which images are being replaced
  const [replacementImages, setReplacementImages] = React.useState({});

  // New state for image import dialog
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);


  const [packTypes, setPackTypes] = useState([]);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [categoryOne, setCategoryOne] = useState([]);
  const [categoryTwo, setCategoryTwo] = useState([]);
  const [categoryThree, setCategoryThree] = useState([]);
  const [categoryFour, setCategoryFour] = useState([]);
  const [badges, setBadges] = useState([]);
  const [typesList, setTypesList] = useState(["Inventory Item", "Kit/Package", "Service", "Non-Inventory Item"]);
  const [taxOptions, setTaxOptions] = useState([true, false]);


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

  // Handle replacement of existing images
  const handleReplaceExistingImage = (e, imageIndex) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setReplacementImages(prev => ({
        ...prev,
        [imageIndex]: {
          file: file,
          preview: URL.createObjectURL(file)
        }
      }));
      setError('');
    }
  };

  // Remove replacement image
  const handleRemoveReplacement = (imageIndex) => {
    if (replacementImages[imageIndex]?.preview) {
      URL.revokeObjectURL(replacementImages[imageIndex].preview);
    }

    setReplacementImages(prev => {
      const newReplacements = { ...prev };
      delete newReplacements[imageIndex];
      return newReplacements;
    });
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
    if (!formData.pricingGroup) {
      setError('Please enter a pricing group');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('ProductName', formData.ProductName);
      formDataToSend.append('eachPrice', formData.eachPrice);
      formDataToSend.append('stockLevel', formData.stockLevel);
      formDataToSend.append('pricingGroup', formData.pricingGroup);

      // Append array fields
      formData.typesOfPacks.forEach(pack => {
        formDataToSend.append('typesOfPacks', pack);
      });

      // Append optional fields
      if (formData.commerceCategoriesOne) formDataToSend.append('commerceCategoriesOne', formData.commerceCategoriesOne);
      if (formData.commerceCategoriesTwo) formDataToSend.append('commerceCategoriesTwo', formData.commerceCategoriesTwo);
      if (formData.commerceCategoriesThree) formDataToSend.append('commerceCategoriesThree', formData.commerceCategoriesThree);
      if (formData.commerceCategoriesFour) formDataToSend.append('commerceCategoriesFour', formData.commerceCategoriesFour);
      if (formData.storeDescription) formDataToSend.append('storeDescription', formData.storeDescription);
      if (formData.pageTitle) formDataToSend.append('pageTitle', formData.pageTitle);
      if (formData.eachBarcodes) formDataToSend.append('eachBarcodes', formData.eachBarcodes);
      if (formData.packBarcodes) formDataToSend.append('packBarcodes', formData.packBarcodes);
      if (formData.badge) formDataToSend.append('badge', formData.badge);
      if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
      formDataToSend.append('taxable', formData.taxable);

      // Append thumbnail if new one is selected
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }

      // Append replacement images with their indices
      Object.entries(replacementImages).forEach(([index, imageData]) => {
        formDataToSend.append(`replaceImage_${index}`, imageData.file);
      });

      // Append additional images if selected
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const res = await axiosInstance.put(`/products/update-product/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Update product response:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/products/list');
      } else {
        setError(res.data.message || 'Failed to update product');
      }

    } catch (error) {
      console.error('Update product error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const response = await axiosInstance.get(`/products/get-product/${id}`);
      console.log("response product details", response.data);

      if (response.data.statusCode === 200) {
        const product = response.data.data;

        setFormData({
          sku: product.sku || '',
          ProductName: product.ProductName || '',
          eachPrice: product.eachPrice || '',
          stockLevel: product.stockLevel || '',
          typesOfPacks: product.typesOfPacks ? product.typesOfPacks.map(pack => pack._id) : [],
          pricingGroup: product.pricingGroup?._id || '',
          commerceCategoriesOne: product.commerceCategoriesOne?._id || '',
          commerceCategoriesTwo: product.commerceCategoriesTwo?._id || '',
          commerceCategoriesThree: product.commerceCategoriesThree?._id || '',
          commerceCategoriesFour: product.commerceCategoriesFour?._id || '',
          storeDescription: product.storeDescription || '',
          pageTitle: product.pageTitle || '',
          eachBarcodes: product.eachBarcodes || '',
          packBarcodes: product.packBarcodes || '',
          badge: product.badge?._id || '',
          comparePrice: product.comparePrice || '',
          taxable: product.taxable || false,
          sequence: product.sequence || null,
        });

        // Set existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
          // Set thumbnail preview to first image
          setThumbnailPreview(product.images[0]);
        }

        // Fetch subcategory two if needed
        if (product.commerceCategoriesThree?._id) {
          fetchSubCategoryTwoList(product.commerceCategoriesThree._id);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
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

  const handleCloseCsvDialog = () => {
    setCsvDialogOpen(false);
    setSelectedFile(null);
    setError('');
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
  };

  const fetchPackTypesList = async () => {
    try {
      const response = await axiosInstance.get('/packs-types/get-all-packs-types');
      console.log("response pack types list", response);

      if (response.status === 200) {
        setPackTypes(response.data.data.packs);
      }

    } catch (error) {
      console.error('Error fetching pack types list:', error);
      setError(error.message);
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
      setError(error.message);
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
      setError(error.message);
    }
  };

  const fetchCategoryList = async () => {
    try {
      const response = await axiosInstance.get('/category/get-categories');
      console.log("response categories", response);

      if (response.data.statusCode === 200) {
        setCategoryTwo(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching category list:', error);
      setError(error.message);
    }
  };

  const fetchSubCategoryList = async () => {
    try {
      const response = await axiosInstance.get('/subcategory/get-sub-categories');
      console.log("response sub categories", response.data.data);

      if (response.data.statusCode === 200) {
        setCategoryThree(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sub category list:', error);
      setError(error.message);
    }
  };

  const fetchSubCategoryTwoList = async (subcategoryId) => {
    try {
      // Clear existing categoryFour when subcategory changes
      if (!subcategoryId) {
        setCategoryFour([]);
        // Clear the form field when no subcategory is selected
        setFormData(prev => ({ ...prev, commerceCategoriesFour: '' }));
        return;
      }

      const response = await axiosInstance.get(`/subcategoryTwo/get-sub-categories-two-by-category-id/${subcategoryId}`);
      console.log("response sub categories two", response.data.data);

      if (response.data.statusCode === 200) {
        setCategoryFour(response.data.data);
      } else {
        setCategoryFour([]);
      }
    } catch (error) {
      console.error('Error fetching sub category two list:', error);
      setCategoryFour([]);
      setError(error.message);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axiosInstance.get('/badge/get-badges');
      console.log("response badges", response);

      if (response.data.statusCode === 200) {
        setBadges(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching badges list:', error);
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access if needed
      }
    }
  }

  // Handle subcategory three change to fetch subcategory two
  const handleSubcategoryThreeChange = (value) => {
    setFormData({ ...formData, commerceCategoriesThree: value, commerceCategoriesFour: '' });
    fetchSubCategoryTwoList(value);
  };

  React.useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  React.useEffect(() => {
    fetchPackTypesList();
    fetchPricingGroups();
    fetchBrandsList();
    fetchCategoryList();
    fetchSubCategoryList();
    fetchBadges();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>

        {/* Thumbnail Image Upload */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="thumbnail-upload" sx={{ mt: 2 }}>
            Product Thumbnail
            {!existingImages.length && <span style={{ color: 'red' }}>*</span>}
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
              {existingImages.length > 0 ? 'Change Thumbnail' : 'Choose Thumbnail'}
            </Button>
            {thumbnailFile && (
              <Typography variant="body2" color="primary">
                {thumbnailFile.name} (New)
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
              {thumbnailFile && (
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
              )}
            </Box>
          )}
        </Grid>

        {/* Existing Product Images with Replace Option */}
        {existingImages.length > 1 && (
          <Grid size={12}>
            <CustomFormLabel sx={{ mt: 2 }}>
              Current Product Images (Click to Replace)
            </CustomFormLabel>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {existingImages.slice(1).map((imageUrl, index) => {
                const imageIndex = index + 1;
                const replacement = replacementImages[imageIndex];

                return (
                  <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                    <input
                      id={`replace-image-${imageIndex}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReplaceExistingImage(e, imageIndex)}
                      style={{ display: 'none' }}
                    />
                    <Box
                      component="label"
                      htmlFor={`replace-image-${imageIndex}`}
                      sx={{
                        cursor: 'pointer',
                        display: 'block',
                        position: 'relative',
                        '&:hover img': { opacity: 0.7 }
                      }}
                    >
                      <img
                        src={replacement ? replacement.preview : imageUrl}
                        alt={`Product ${imageIndex + 1}`}
                        style={{
                          maxWidth: '150px',
                          maxHeight: '150px',
                          borderRadius: '4px',
                          border: replacement ? '2px solid #4caf50' : '1px solid #ddd',
                          transition: 'opacity 0.2s'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: replacement ? 'rgba(76, 175, 80, 0.9)' : 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '4px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          borderBottomLeftRadius: '4px',
                          borderBottomRightRadius: '4px'
                        }}
                      >
                        {replacement ? 'New Image Selected' : 'Click to Replace'}
                      </Box>
                    </Box>
                    {replacement && (
                      <Button
                        size="small"
                        onClick={() => handleRemoveReplacement(imageIndex)}
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
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>
        )}

        {/* Multiple Product Images Upload */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="images-upload" sx={{ mt: 2 }}>
            {existingImages.length > 0 ? 'Add More Images (Max 10)' : 'Product Images (Max 10)'}
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
                {imageFiles.length} new image{imageFiles.length > 1 ? 's' : ''} selected
              </Typography>
            )}
          </Box>
          {imagePreviews.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {imagePreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={preview}
                    alt={`New Product ${index + 1}`}
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


        {/* SKU and Product Name - Two per row */}
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
          <CustomFormLabel htmlFor="comparePrice" sx={{ mt: 2 }}>
            Compare Price
          </CustomFormLabel>
          <CustomOutlinedInput
            id="comparePrice"
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
                  placeholder={pricingGroups.length === 0 ? 'Loading types...' : 'Search and select a type'}
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
          <CustomFormLabel htmlFor="commerce-category-one-select" sx={{ mt: 2 }}>
            Select Commerce category One
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="commerce-category-one-select"
              value={categoryOne.find(category => category._id === formData.commerceCategoriesOne) || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, commerceCategoriesOne: newValue ? newValue._id : '' });
              }}
              options={categoryOne}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryOne.length === 0}
              noOptionsText={categoryOne.length === 0 ? 'Loading types...' : 'No categories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryOne.length === 0 ? 'Loading types...' : 'Search and select a type'}
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

        {/* Commerce Category Two and Three - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="commerce-category-two-select" sx={{ mt: 2 }}>
            Select Commerce category Two
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="commerce-category-two-select"
              value={categoryTwo.find(category => category._id === formData.commerceCategoriesTwo) || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, commerceCategoriesTwo: newValue ? newValue._id : '' });
              }}
              options={categoryTwo}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryTwo.length === 0}
              noOptionsText={categoryTwo.length === 0 ? 'Loading types...' : 'No categories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryTwo.length === 0 ? 'Loading types...' : 'Search and select a type'}
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
            Select Commerce category Three
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="commerceCategoryThree-select"
              value={categoryThree.find(category => category._id === formData.commerceCategoriesThree) || null}
              onChange={(event, newValue) => {
                handleSubcategoryThreeChange(newValue ? newValue._id : '');
              }}
              options={categoryThree}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryThree.length === 0}
              noOptionsText={categoryThree.length === 0 ? 'Loading types...' : 'No categories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryThree.length === 0 ? 'Loading types...' : 'Search and select a type'}
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
          <CustomFormLabel htmlFor="commerce-category-four-select" sx={{ mt: 2 }}>
            Select Commerce category four
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="commerce-category-four-select"
              value={categoryFour.find(category => category._id === formData.commerceCategoriesFour) || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, commerceCategoriesFour: newValue ? newValue._id : '' });
              }}
              options={categoryFour}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryFour.length === 0}
              noOptionsText={categoryFour.length === 0 ? 'NO CATEGORY' : 'No categories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryFour.length === 0 ? 'NO CATEGORY' : 'Search and select a type'}
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
          <CustomFormLabel htmlFor="stockLevel" sx={{ mt: 2 }}>
            Sequence
          </CustomFormLabel>
          <CustomOutlinedInput
            id="stockLevel"
            fullWidth
            value={formData.sequence}
            onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
            disabled={loading}
            placeholder="Enter Sequence"
          />
        </Grid>


        <Grid size={6}>
          <CustomFormLabel htmlFor="badge-select" sx={{ mt: 2 }}>
            Select badge
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="badge-select"
              value={badges.find(badge => badge._id === formData.badge) || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, badge: newValue ? newValue._id : '' });
              }}
              options={badges}
              getOptionLabel={(option) => `${option.name} - (text-${option.text})`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || badges.length === 0}
              noOptionsText={badges.length === 0 ? 'NO BADGES' : 'No badges found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={badges.length === 0 ? 'NO BADGES' : 'Search and select a badge'}
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

        {/* Store Description - Full Width */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="storeDescription" sx={{ mt: 2 }}>
            Store Description
          </CustomFormLabel>
          <CustomOutlinedInput
            id="storeDescription"
            fullWidth
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
                color: 'red',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #ffcdd2'
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
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Import CSV
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
        <DialogTitle>
          Import Products from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple pricing group discounts at once.
              Expected format: pricingGroupId, customerId, productSku, percentage
            </Typography>

            <input
              id="csv-file-input"
              type="file"
              accept=".csv/xlsx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                htmlFor="csv-file-input"
                startIcon={<IconUpload size="1.1rem" />}
                disabled={loading}
              >
                Choose File
              </Button>

              {selectedFile && (
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
          <Button onClick={handleCloseCsvDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImportCsvFile}
            variant="contained"
            disabled={!selectedFile || loading}
            startIcon={<IconFileImport size="1.1rem" />}
            sx={{ backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditProduct;