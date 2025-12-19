import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl, Box, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';
import { set } from 'lodash';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditSubCategory = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    descriptionColour: '#000000'
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [dataLoading, setDataLoading] = React.useState(true);
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = React.useState([]);
  const { id } = useParams();

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.trim().replace(/\s+/g, '-')?.toLowerCase();

    setFormData({
      ...formData,
      name: name,
      slug: slug,
    });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value // This will be the category ID
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('SubCategory name is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.put(`/subcategory/update-sub-category/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // console.log("Update subcategory response:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/sub-category/list');
      } else if (res.data.statusCode === 400) {
        // console.log("Update subcategory error:", res.data.message);
        setError(res.data.message);
      }

    } catch (error) {
      console.error('Update subcategory error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      slug: '',
      category: '',
      description: '',
      descriptionColour: '#000000'
    });
    setError('');
  };

  const handleCancel = () => {
    navigate('/dashboard/sub-category/list');
  };

  const fetchCategoryList = async () => {
    try {
      const response = await axiosInstance.get('/category/get-categories');
      // console.log("response categories", response.data);

      if (response.data.statusCode === 200) {
        setCategoryList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching category list:', error);
      setError('Failed to fetch category list');
    }
  };

  const fetchSubCategoryDetails = async () => {
    try {
      setDataLoading(true);
      const response = await axiosInstance.get(`/subcategory/get-sub-category/${id}`);
      // console.log("response subcategory", response.data);

      if (response.data.statusCode === 200) {
        const subcategoryData = response.data.data;

        // Handle different possible structures of category data
        let categoryId = '';
        if (subcategoryData.category) {
          // If category is populated as an object
          if (typeof subcategoryData.category === 'object' && subcategoryData.category._id) {
            categoryId = subcategoryData.category._id;
          }
          // If category is just an ID string
          else if (typeof subcategoryData.category === 'string') {
            categoryId = subcategoryData.category;
          }
        }

        setFormData({
          name: subcategoryData.name || '',
          slug: subcategoryData.slug || '',
          category: categoryId,
          description: subcategoryData.description || '',
          descriptionColour: subcategoryData.descriptionColour || '#000000',
        });
      } else {
        setError('Failed to fetch subcategory details');
      }
    } catch (error) {
      console.error('Error fetching subcategory details:', error);
      setError('Failed to fetch subcategory details');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubCategoryDetails();
    }
  }, [id]);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading subcategory details...
      </div>
    );
  }

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Edit SubCategory',
    },
  ];

  return (
    <div>

      <Breadcrumb title="Edit SubCategory" items={BCrumb} />

      <Grid container spacing={2} marginTop={4}>
        {/* SubCategory Name */}
        <Grid size={12}>
          <CustomFormLabel
            htmlFor="subcategory-name"
            sx={{ mt: 0 }}
          >
            SubCategory Name
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-name"
            fullWidth
            value={formData.name}
            onChange={(e) => handleNameChange(e)}
            disabled={loading}
            placeholder="Enter subcategory name"
          />
        </Grid>

        {/* Description */}
        <Grid size={12}>
          <CustomFormLabel
            htmlFor="subcategory-description"
            sx={{ mt: 2 }}
          >
            SubCategory Description
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
            {formData.description && (
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
            )}
          </Box>
        </Grid>

        {/* Category Selection */}
        <Grid size={12}>
          <CustomFormLabel
            htmlFor="category-select"
            sx={{ mt: 2 }}
          >
            Select Category
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
              getOptionLabel={(option) => option.name || ''}
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

        {/* Slug */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-slug" sx={{ mt: 2 }}>
            Slug
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-slug"
            fullWidth
            disabled
            value={formData.slug}
            placeholder="Auto-generated from subcategory name"
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
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Updating...' : 'Update SubCategory'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default EditSubCategory;