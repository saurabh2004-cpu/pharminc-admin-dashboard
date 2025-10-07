import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Checkbox, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
// import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconPhoto, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const CreateProduct = () => {
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
    pageTitle: '',
    storeDescription: '',
    eachBarcodes: '',
    packBarcodes: '',
    productImg: '',
    taxable: false,
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
  const [categoryOne, setCategoryOne] = useState([]);
  const [categoryTwo, setCategoryTwo] = useState([]);
  const [categoryThree, setCategoryThree] = useState([]);
  const [categoryFour, setCategoryFour] = useState([]);
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




    setLoading(true);
    setError('');

    // Create FormData object for multipart form submission
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
    if (formData.taxable) formDataToSend.append('taxable', formData.taxable);

    // Append thumbnail image
    formDataToSend.append('thumbnail', thumbnailFile);

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
          commerceCategoriesOne: '',
          commerceCategoriesTwo: '',
          commerceCategoriesThree: '',
          commerceCategoriesFour: '',
          storeDescription: '',
          pageTitle: '',
          eachBarcodes: '',
          packBarcodes: ''
        });

        handleRemoveThumbnail();
        setImageFiles([]);
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImagePreviews([]);

        navigate('/dashboard/products/list');

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
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  // New function to handle image file selection
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate that all files are images
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

      // Append all images with the key 'images' as expected by the backend
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
        setPackTypes(response.data.data.packs);
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

  // Fixed useEffect hooks with proper dependencies and cleanup
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

  React.useEffect(() => {
    fetchPackTypesList();
    fetchPricingGroups();
    fetchBrandsList();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        {/* SKU and Product Name - Two per row */}

        {/* Thumbnail Image Upload */}
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
        <Grid size={12}>
          <CustomFormLabel htmlFor="types-of-packs-select" sx={{ mt: 2 }}>
            Select Type Of Packs (Multiple)
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="types-of-packs-select"
              multiple
              value={formData.typesOfPacks}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, typesOfPacks: Array.isArray(value) ? value : [value] });
              }}
              disabled={loading || packTypes.length === 0}
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return 'Select pack types';
                }
                const selectedNames = selected.map(id => {
                  const pack = packTypes.find(p => p._id === id);
                  return pack ? pack.name : id;
                });
                return selectedNames.join(', ');
              }}
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
                {packTypes.length === 0 ? 'Loading types...' : 'Select pack types'}
              </MenuItem>
              {packTypes.map((type) => (
                <MenuItem key={type._id} value={type._id}>
                  <Checkbox checked={formData.typesOfPacks.indexOf(type._id) > -1} />
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Pricing Group and Commerce Category One - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="pricing-group-select" sx={{ mt: 2 }}>
            Select PricingGroup
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="pricing-group-select"
              value={formData.pricingGroup}
              onChange={(e) => setFormData({ ...formData, pricingGroup: e.target.value })}
              disabled={loading || pricingGroups.length === 0}
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
        <Grid size={6}>
          <CustomFormLabel htmlFor="commerce-category-one-select" sx={{ mt: 2 }}>
            Select Commerce category One (Brand)
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

        {/* Commerce Category Two and Three - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="commerce-category-two-select" sx={{ mt: 2 }}>
            Select Commerce category Two

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
        <Grid size={6}>
          <CustomFormLabel htmlFor="commerceCategoryThree-select" sx={{ mt: 2 }}>
            Select Commerce category Three
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
          <CustomFormLabel htmlFor="commerceCategoryFour-select" sx={{ mt: 2 }}>
            Select Commerce category four
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
                {categoryFour.length === 0 ? 'No SubCategory TWo Available' : 'Select a sub-subcategory'}
              </MenuItem>
              {categoryFour.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
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