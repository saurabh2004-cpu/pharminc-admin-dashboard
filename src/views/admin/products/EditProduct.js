import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Checkbox, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';

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
    pageTitle: '',
    storeDescription: '',
    eachBarcodes: '',
    packBarcodes: '',
  });

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const { id } = useParams();

  const [packTypes, setPackTypes] = useState([]);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [categoryOne, setCategoryOne] = useState([]);
  const [categoryTwo, setCategoryTwo] = useState([]);
  const [categoryThree, setCategoryThree] = useState([]);
  const [categoryFour, setCategoryFour] = useState([]);
  const [typesList, setTypesList] = useState(["Inventory Item", "Kit/Package", "Service", "Non-Inventory Item"]);

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
      // Use PUT for update instead of POST
      const res = await axiosInstance.put(`/products/update-product/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Update product response:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/products/list');
      } else if (res.data.statusCode === 400) {
        setError(res.data.message || 'Failed to update product');
      }

    } catch (error) {
      console.error('Update product error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update product');
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

  const fetchSubCategoryTwoList = async () => {
    try {
      const response = await axiosInstance.get('/subcategoryTwo/get-sub-categories-two');
      console.log("response sub categories", response.data.data);

      if (response.data.statusCode === 200) {
        setCategoryFour(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sub category list:', error);
      setError(error.message);
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
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  React.useEffect(() => {
    fetchSubCategoryTwoList();
    fetchPackTypesList();
    fetchPricingGroups();
    fetchBrandsList();
    fetchCategoryList();
    fetchSubCategoryList();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
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
              disabled={loading || packTypes.length === 0}
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
            Select Commerce category One
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="commerce-category-one-select"
              value={formData.commerceCategoriesOne}
              onChange={(e) => setFormData({ ...formData, commerceCategoriesOne: e.target.value })}
              disabled={loading || packTypes.length === 0}
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
                {categoryOne.length === 0 ? 'Loading types...' : 'Select a type'}
              </MenuItem>
              {categoryOne.map((category) => (
                <MenuItem key={category.name} value={category._id}>
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
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="commerce-category-two-select"
              value={formData.commerceCategoriesTwo}
              onChange={(e) => setFormData({ ...formData, commerceCategoriesTwo: e.target.value })}
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
                {categoryTwo.length === 0 ? 'Loading types...' : 'Select a type'}
              </MenuItem>
              {categoryTwo.map((category) => (
                <MenuItem key={category.name} value={category._id}>
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
              onChange={(e) => setFormData({ ...formData, commerceCategoriesThree: e.target.value })}
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
                {categoryThree.length === 0 ? 'Loading types...' : 'Select a type'}
              </MenuItem>
              {categoryThree.map((category) => (
                <MenuItem key={category.name} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="commerceCategoryThree-select" sx={{ mt: 2 }}>
            Select Commerce category four
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="commerceCategoryThree-select"
              value={formData.commerceCategoriesFour}
              onChange={(e) => setFormData({ ...formData, commerceCategoriesFour: e.target.value })}
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
                {categoryFour.length === 0 ? 'NO CATEGORY' : 'Select a type'}
              </MenuItem>
              {categoryFour.map((category) => (
                <MenuItem key={category.name} value={category._id}>
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