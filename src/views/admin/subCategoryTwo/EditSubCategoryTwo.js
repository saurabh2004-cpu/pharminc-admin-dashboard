import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditSubCategoryTwo = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    subCategory: '',
    description: '',
    descriptionColour: '#000000',
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
      subCategory: categoryId,
    });

    setSelectedSubCategory(categoryObj || null);

    // regenerate slug if subcategory name is already typed
    if (formData.name.trim() && categoryObj) {
      const subSlug = formData.name.trim().replace(/\s+/g, '-').toLowerCase();
      const brandSlug = categoryObj.category?.brand?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const catSlug = categoryObj.category?.name
        ?.trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const subCatSlug = categoryObj?.name
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
    if (!formData.subCategory) {
      setError('Please select a sub category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.put(
        `/subcategoryTwo/update-sub-category-two/${id}`,
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
          subCategory: data.subCategory?._id || data.subCategory || '',
          description: data.description || '',
          descriptionColour: data.descriptionColour || '#000000',
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

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Edit SubCategory Two',
    },
  ];

  return (
    <div>

      <Breadcrumb title="Edit SubCategory Two" items={BCrumb} />


      <Grid container spacing={2} marginTop={4}>
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

        <Grid size={12}>
          <CustomFormLabel htmlFor="subcategory-two-Description" sx={{ mt: 0 }}>
            SubCategory Two Description
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="subcategory-two-Description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={loading}
            placeholder="Enter subcategory two Description"
          />
        </Grid>

        {/* Description Colour */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="description-colour" sx={{ mt: 2 }}>
            Description Colour
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="color"
              id="description-colour"
              value={formData.descriptionColour}
              onChange={(e) => setFormData({ ...formData, descriptionColour: e.target.value })}
              disabled={loading}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            />
            <CustomOutlinedInput
              fullWidth
              value={formData.descriptionColour}
              onChange={(e) => {
                const value = e.target.value;
                // Allow typing hex colors
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                  setFormData({ ...formData, descriptionColour: value });
                }
              }}
              disabled={loading}
              placeholder="#000000"
              inputProps={{
                maxLength: 7,
                style: { textTransform: 'uppercase' }
              }}
            />
          </div>
          {/* <div
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: formData.descriptionColour,
              color: getContrastColor(formData.descriptionColour),
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Preview: Description text color
          </div> */}
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
              setFormData({
                name: '',
                slug: '',
                subCategory: '',
                description: '',
                descriptionColour: '#000000'
              });
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

// Helper function to determine contrasting text color
function getContrastColor(hexColor) {
  if (!hexColor || hexColor.length < 7) return '#000000';

  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default EditSubCategoryTwo;