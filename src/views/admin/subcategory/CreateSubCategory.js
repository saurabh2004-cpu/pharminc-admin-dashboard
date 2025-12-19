import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl, Dialog, Backdrop, Box, CircularProgress, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { IconFileImport, IconUpload } from '@tabler/icons';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateSubCategory = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    descriptionColour: '#000000',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);

  // Handle subcategory name change
  const handleNameChange = (e) => {
    const name = e.target.value;
    let slug = name.trim().replace(/\s+/g, '-').toLowerCase();

    if (selectedCategory) {
      const brandSlug = selectedCategory.brand?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const catSlug = selectedCategory.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      slug = `${brandSlug}/${catSlug}/${slug}`;
    }

    setFormData({
      ...formData,
      name: name,
      slug: slug,
    });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const categoryObj = categoryList.find((cat) => cat._id === categoryId);

    setFormData({
      ...formData,
      category: categoryId,
    });

    setSelectedCategory(categoryObj || null);

    // regenerate slug if subcategory name is already typed
    if (formData.name.trim() && categoryObj) {
      const subSlug = formData.name.trim().replace(/\s+/g, '-').toLowerCase();
      const brandSlug = categoryObj.brand?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const catSlug = categoryObj.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();

      setFormData((prev) => ({
        ...prev,
        slug: `${brandSlug}/${catSlug}/${subSlug}`,
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Subcategory name is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post(
        '/subcategory/create-sub-category',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data.statusCode === 200) {
        setFormData({
          name: '',
          slug: '',
          category: '',
          description: '',
          descriptionColour: '#000000',
        });
        navigate('/dashboard/sub-category/list');
      } else if (res.data.statusCode === 400) {
        setError(res.data.message);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to create subcategory'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch category list
  const fetchCategoryList = async () => {
    try {
      const response = await axiosInstance.get('/category/get-categories');
      if (response.data.statusCode === 200) {
        setCategoryList(response.data.data || []);
      }
    } catch (error) {
      setError('Failed to fetch category list');
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
      formDataForUpload.append('commerce-categories', selectedFile);

      const res = await axiosInstance.post('/brand/import-commerce-categories', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // console.log("CSV imported", res.data);

      if (res.data.statusCode === 200) {
        setCsvDialogOpen(false);
        setSelectedFile(null);

        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';

        navigate('/dashboard/category/list');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create SubCategory',
    },
  ];


  return (
    <div>

      <Breadcrumb title="Create SubCategory" items={BCrumb} />

      <Grid container spacing={2} marginTop={4}>
        {/* Subcategory Name */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-name" sx={{ mt: 0 }}>
            SubCategory Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-name"
            fullWidth
            value={formData.name}
            onChange={handleNameChange}
            disabled={loading}
            placeholder="Enter subcategory name"
          />
        </Grid>

        {/* Description */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-description" sx={{ mt: 2 }}>
            Description
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={loading}
            placeholder="Enter subcategory description"
          />
        </Grid>

        {/* Description Colour */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="description-colour" sx={{ mt: 2 }}>
            Description Colour
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <input
              id="description-colour"
              type="color"
              value={formData.descriptionColour}
              onChange={(e) => setFormData({ ...formData, descriptionColour: e.target.value })}
              disabled={loading}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            />
            <CustomOutlinedInput
              fullWidth
              value={formData.descriptionColour}
              onChange={(e) => {
                const value = e.target.value;
                // Allow hex color format with or without #
                if (value.match(/^#?[0-9A-Fa-f]{0,6}$/)) {
                  const formattedValue = value.startsWith('#') ? value : `#${value}`;
                  setFormData({ ...formData, descriptionColour: formattedValue });
                }
              }}
              disabled={loading}
              placeholder="#000000"
              inputProps={{
                maxLength: 7,
              }}
            />
            {/* {formData.description && (
              <Box
                sx={{
                  minWidth: '100px',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: formData.descriptionColour,
                    fontWeight: 500,
                  }}
                >
                  Preview
                </Typography>
              </Box>
            )} */}
          </Box>
        </Grid>

        {/* Category Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="category-select" sx={{ mt: 2 }}>
            Select Category
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth>
            <Autocomplete
              id="category-select"
              value={categoryList.find(category => category._id === formData.category) || null}
              onChange={(event, newValue) => {
                handleCategoryChange({
                  target: {
                    value: newValue ? newValue._id : ''
                  }
                });
              }}
              options={categoryList}
              getOptionLabel={(option) =>
                option.brand?.name
                  ? `${option.name} (${option.brand.name})`
                  : option.name
              }
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || categoryList.length === 0}
              noOptionsText={categoryList.length === 0 ? 'Loading categories...' : 'No categories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={categoryList.length === 0 ? 'Loading categories...' : 'Search and select a category'}
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

        {/* Slug (auto-generated) */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-slug" sx={{ mt: 2 }}>
            Slug
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-slug"
            fullWidth
            disabled
            value={formData.slug}
            placeholder="Auto-generated from category & subcategory name"
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
                border: '1px solid #ffcdd2',
              }}
            >
              {error}
            </div>
          </Grid>
        )}

        {/* Submit / Clear */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Creating...' : 'Create SubCategory'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setFormData({
                name: '',
                slug: '',
                category: '',
                description: '',
                descriptionColour: '#000000'
              });
              setSelectedCategory(null);
              setError('');
            }}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Clear
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            disabled={loading}
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
          Import Commerce Categories from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple commerce categories at once.
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
    </div>
  );
};

export default CreateSubCategory;