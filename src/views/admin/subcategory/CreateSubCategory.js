import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateSubCategory = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    category: ''
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState(null);

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

  useEffect(() => {
    fetchCategoryList();
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
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

        {/* Category Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="category-select" sx={{ mt: 2 }}>
            Select Category
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth>
            <Select
              id="category-select"
              value={formData.category}
              onChange={handleCategoryChange}
              disabled={loading || categoryList.length === 0}
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
                {categoryList.length === 0
                  ? 'Loading categories...'
                  : 'Select a category'}
              </MenuItem>
              {categoryList.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name} ({category.brand?.name})
                </MenuItem>
              ))}
            </Select>
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
              setFormData({ name: '', slug: '', category: '' });
              setSelectedCategory(null);
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

export default CreateSubCategory;
