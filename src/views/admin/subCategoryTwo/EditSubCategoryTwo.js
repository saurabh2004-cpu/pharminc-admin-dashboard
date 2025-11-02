import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';

const EditSubCategoryTwo = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    subCategory: ''  // Initialize as empty string instead of undefined variable
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [subCategoryList, setSubCategoryList] = React.useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null);
  const { id } = useParams();

  // Handle subcategory name change
  const handleNameChange = (e) => {
    const name = e.target.value;
    let slug = name.trim().replace(/\s+/g, '-').toLowerCase();

    if (selectedSubCategory) {
      const brandSlug = selectedSubCategory.category?.brand?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const catSlug = selectedSubCategory?.category?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const subCatSlug = selectedSubCategory?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();

      slug = `${brandSlug}/${catSlug}/${subCatSlug}/${slug}`;
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
    const categoryObj = subCategoryList.find((cat) => cat._id === categoryId);

    setFormData({
      ...formData,
      subCategory: categoryId,  // Changed from 'category' to 'subCategory'
    });

    setSelectedSubCategory(categoryObj || null);

    // regenerate slug if subcategory name is already typed
    if (formData.name.trim() && categoryObj) {
      const subSlug = formData.name.trim().replace(/\s+/g, '-').toLowerCase();
      const brandSlug = categoryObj.category?.brand?.name  // Fixed path
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const catSlug = categoryObj.category?.name  // Fixed path
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const subCatSlug = categoryObj?.name  // This is the subcategory name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();

      setFormData((prev) => ({
        ...prev,
        slug: `${brandSlug}/${catSlug}/${subCatSlug}/${subSlug}`,
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('SubcategoryTwo name is required');
      return;
    }
    if (!formData.subCategory) {  // Changed from 'category' to 'subCategory'
      setError('Please select a sub category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.put(
        `/subcategoryTwo/update-sub-category-two/${id}`,  // Updated endpoint for edit
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data.statusCode === 200) {
        navigate('/dashboard/sub-category-two/list');
      } else if (res.data.statusCode === 400) {
        setError(res.data.message);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to update subcategory two'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch category list
  const fetchSubCategoryList = async () => {
    try {
      const response = await axiosInstance.get('/subcategory/get-sub-categories');

      if (response.data.statusCode === 200) {
        const list = response.data.data;
        setSubCategoryList(list);
      }
    } catch (error) {
      console.error('Error fetching subcategory list:', error);
      setError(error.message);
    }
  };

  const fetchSubCategoryTwo = async () => {
    try {
      const response = await axiosInstance.get(`/subcategoryTwo/get-sub-category-two/${id}`);
      console.log("response sub categories", response.data.data);

      if (response.data.statusCode === 200) {
        const data = response.data.data;
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          subCategory: data.subCategory?._id || data.subCategory || ''  // Handle both populated and non-populated cases
        });

        // Set the selected subcategory object for display purposes
        if (data.subCategory) {
          setSelectedSubCategory(data.subCategory);
        }
      }
    } catch (error) {
      console.error('Error fetching sub category Two:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchSubCategoryTwo(),
        fetchSubCategoryList()
      ]);
    };
    init();
  }, [id]);

  // Update selectedSubCategory when subCategoryList is loaded and formData has subCategory
  React.useEffect(() => {
    if (subCategoryList.length > 0 && formData.subCategory) {
      const matched = subCategoryList.find((sub) => sub._id === formData.subCategory);
      if (matched && !selectedSubCategory) {
        setSelectedSubCategory(matched);
      }
    }
  }, [subCategoryList, formData.subCategory, selectedSubCategory]);

  return (
    <div>
      <Grid container spacing={2}>
        {/* Subcategory Name */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-two-name" sx={{ mt: 0 }}>
            SubCategory Two Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-two-name"
            fullWidth
            value={formData.name}
            onChange={handleNameChange}
            disabled={loading}
            placeholder="Enter subcategory two name"
          />
        </Grid>

        {/* Category Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-select" sx={{ mt: 2 }}>
            Select subCategory
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth>
            <Autocomplete
              id="subcategory-select"
              value={subCategoryList.find(subcategory => subcategory._id === formData.subCategory) || null}
              onChange={(event, newValue) => {
                handleCategoryChange({
                  target: {
                    value: newValue ? newValue._id : ''
                  }
                });
              }}
              options={subCategoryList}
              getOptionLabel={(option) =>
                option.category?.name
                  ? `${option.name} (${option.category.name})`
                  : option.name
              }
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || subCategoryList.length === 0}
              noOptionsText={subCategoryList.length === 0 ? 'Loading subcategories...' : 'No subcategories found'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={subCategoryList.length === 0 ? 'Loading subcategories...' : 'Search and select a subcategory'}
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
            {loading ? 'Updating...' : 'Update SubCategory'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setFormData({ name: '', slug: '', subCategory: '' });
              setSelectedSubCategory(null);
              setError('');
            }}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default EditSubCategoryTwo;