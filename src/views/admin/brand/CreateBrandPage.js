import React, { useEffect, useState } from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconFileImport, IconUpload, IconPlus, IconTrash, IconX } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

// Image size configurations - ADDED MOBILE HERO CAROUSEL
const IMAGE_SIZES = {
  brandImage: { width: 600, height: 300, label: 'Brand Image (600 × 300 px)' },
  desktopHeroCarousel: { width: 4478, height: 1415, label: 'Desktop Hero Carousel Images (4478 × 1415 px)' },
  mobileHeroCarousel: { label: 'Mobile Hero Carousel Images (768 × 400 px)' },
  categoryImage: { width: 1188, height: 1064, label: 'Category Images (1188 × 1064 px)' },
  brandLogo: { width: 2332, height: 868, label: 'Brand Logos (2332 × 868 px)' },
  carouselImage: { width: 694, height: 228, label: 'Carousel Images (694 × 228 px)' }
};

// Function to validate image dimensions
const validateImageDimensions = (file, requiredWidth, requiredHeight) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const isValid = img.width === requiredWidth && img.height === requiredHeight;
      resolve({ isValid, width: img.width, height: img.height });
    };
    img.onerror = () => resolve({ isValid: false, width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
};

// File Preview Component for individual items
const IndividualFilePreview = ({ title, preview, onRemove, onFileChange, required = false, imageSize }) => (
  <Box sx={{ mb: 2 }}>
    <CustomFormLabel>
      {title}
      {required && <span style={{ color: 'red' }}>*</span>}
    </CustomFormLabel>
    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
      Required size: {imageSize}
    </Typography>
    {preview && (
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
        <img
          src={preview}
          alt={`Preview`}
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'cover',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <IconButton
          size="small"
          color="error"
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#ffebee' }
          }}
        >
          <IconX size="1rem" />
        </IconButton>
      </Box>
    )}
    <CustomOutlinedInput
      fullWidth
      type="file"
      accept=".png,.jpg,.jpeg,.svg,.webp"
      onChange={onFileChange}
      inputProps={{
        style: { cursor: 'pointer' },
        multiple: false
      }}
    />
  </Box>
);

// Bulk File Preview Component (for hero carousel and carousel images)
const BulkFilePreviewSection = ({ title, previews, onRemove, acceptMultiple = true, fileHandler, imageSize }) => (
  <Box sx={{ mb: 2 }}>
    <CustomFormLabel>
      {title}
      {title.includes('*') && <span style={{ color: 'red' }}>*</span>}
    </CustomFormLabel>
    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
      Required size: {imageSize}
    </Typography>
    {previews.length > 0 && (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {previews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(index)}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#ffebee' }
              }}
            >
              <IconX size="1rem" />
            </IconButton>
          </Box>
        ))}
      </Box>
    )}
    <CustomOutlinedInput
      fullWidth
      type="file"
      accept=".png,.jpg,.jpeg,.svg,.webp"
      onChange={fileHandler}
      inputProps={{
        style: { cursor: 'pointer' },
        multiple: acceptMultiple
      }}
    />
    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
      {acceptMultiple ? 'You can select multiple images at once' : 'Select one image'}
    </Typography>
  </Box>
);

const CreateBrandPage = () => {
  const [formData, setFormData] = useState({
    brand: '',

    // Brand Section
    brandTitle: '',
    brandTitleColor: '#000000',
    brandDescription: '',
    brandDescriptionColor: '#000000',

    // Category Section
    categoryHeadingText: '',
    categoryHeadingTextColor: '#000000',
    categoryDescription: '',
    categoryDescriptionColor: '#000000',
    categoryTitleBgColor: '#004b97ff',
    categoryTitleColor: '#000000ff',
    categories: [{ categoryTitle: '', categoryUrl: '', categoryImage: null, categoryImagePreview: '' }],

    // Brands Section
    brandHeadingText: '',
    brandHeadingTextColor: '#000000',
    brandHeadingDescription: '',
    brandHeadingDescriptionColor: '#000000',
    brands: [{ brandUrl: '', brandImage: null, brandImagePreview: '' }],

    // Q&A Section
    QnaSectionBgColor: '#ffffff',
    QnaHeadingText: '',
    QnaHeadingTextColor: '#000000',
    questions: [''],
    answers: [''],

    // Trusted By Section
    trustedByHeadingText: '',
    trustedByHeadingTextColor: '#000000'
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);

  // File states for bulk uploads - UPDATED TO SEPARATE DESKTOP AND MOBILE
  const [brandImage, setBrandImage] = useState(null);
  const [brandImagePreview, setBrandImagePreview] = useState('');
  const [desktopHeroCarouselImages, setDesktopHeroCarouselImages] = useState([]);
  const [desktopHeroCarouselPreviews, setDesktopHeroCarouselPreviews] = useState([]);
  const [mobileHeroCarouselImages, setMobileHeroCarouselImages] = useState([]);
  const [mobileHeroCarouselPreviews, setMobileHeroCarouselPreviews] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselImagePreviews, setCarouselImagePreviews] = useState([]);

  const fetchBrandsList = async () => {
    try {
      const response = await axiosInstance.get('/brand/get-brands-list');
      // console.log("response brands", response);

      if (response.data.statusCode === 200) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBrandsList();
  }, []);

  // Brand Selection
  const handleBrandChange = (e) => {
    setFormData({
      ...formData,
      brand: e.target.value
    });
  };

  // File Handlers for bulk uploads with size validation - UPDATED FOR DESKTOP/MOBILE SEPARATION
  const handleBrandImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { isValid, width, height } = await validateImageDimensions(
        file,
        IMAGE_SIZES.brandImage.width,
        IMAGE_SIZES.brandImage.height
      );

      if (!isValid) {
        setError(`Brand image must be exactly ${IMAGE_SIZES.brandImage.width} × ${IMAGE_SIZES.brandImage.height} px. Current size: ${width} × ${height} px`);
        return;
      }

      setBrandImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBrandImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Desktop Hero Carousel Images Handler
  const handleDesktopHeroCarouselImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate all files first
      for (const file of files) {
        const { isValid, width, height } = await validateImageDimensions(
          file,
          IMAGE_SIZES.desktopHeroCarousel.width,
          IMAGE_SIZES.desktopHeroCarousel.height
        );

        if (!isValid) {
          setError(`Desktop hero carousel image must be exactly ${IMAGE_SIZES.desktopHeroCarousel.width} × ${IMAGE_SIZES.desktopHeroCarousel.height} px. Current size: ${width} × ${height} px`);
          return;
        }
      }

      setDesktopHeroCarouselImages([...desktopHeroCarouselImages, ...files]);

      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setDesktopHeroCarouselPreviews([...desktopHeroCarouselPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      setError('');
    }
  };

  // Mobile Hero Carousel Images Handler
  const handleMobileHeroCarouselImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate all files first
      // for (const file of files) {
      //   const { isValid, width, height } = await validateImageDimensions(
      //     file,
      //     IMAGE_SIZES.mobileHeroCarousel.width,
      //     IMAGE_SIZES.mobileHeroCarousel.height
      //   );

      //   if (!isValid) {
      //     setError(`Mobile hero carousel image must be exactly ${IMAGE_SIZES.mobileHeroCarousel.width} × ${IMAGE_SIZES.mobileHeroCarousel.height} px. Current size: ${width} × ${height} px`);
      //     return;
      //   }
      // }

      setMobileHeroCarouselImages([...mobileHeroCarouselImages, ...files]);

      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setMobileHeroCarouselPreviews([...mobileHeroCarouselPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      setError('');
    }
  };

  const handleCarouselImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate all files first
      for (const file of files) {
        const { isValid, width, height } = await validateImageDimensions(
          file,
          IMAGE_SIZES.carouselImage.width,
          IMAGE_SIZES.carouselImage.height
        );

        if (!isValid) {
          setError(`Carousel image must be exactly ${IMAGE_SIZES.carouselImage.width} × ${IMAGE_SIZES.carouselImage.height} px. Current size: ${width} × ${height} px`);
          return;
        }
      }

      setCarouselImages([...carouselImages, ...files]);

      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setCarouselImagePreviews([...carouselImagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      setError('');
    }
  };

  // Individual Category Image Handler with size validation
  const handleCategoryImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const { isValid, width, height } = await validateImageDimensions(
        file,
        IMAGE_SIZES.categoryImage.width,
        IMAGE_SIZES.categoryImage.height
      );

      if (!isValid) {
        setError(`Category image must be exactly ${IMAGE_SIZES.categoryImage.width} × ${IMAGE_SIZES.categoryImage.height} px. Current size: ${width} × ${height} px`);
        return;
      }

      const newCategories = [...formData.categories];
      newCategories[index].categoryImage = file;

      const reader = new FileReader();
      reader.onloadend = () => {
        newCategories[index].categoryImagePreview = reader.result;
        setFormData({ ...formData, categories: newCategories });
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Individual Brand Logo Handler with size validation
  const handleBrandLogoChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const { isValid, width, height } = await validateImageDimensions(
        file,
        IMAGE_SIZES.brandLogo.width,
        IMAGE_SIZES.brandLogo.height
      );

      if (!isValid) {
        setError(`Brand logo must be exactly ${IMAGE_SIZES.brandLogo.width} × ${IMAGE_SIZES.brandLogo.height} px. Current size: ${width} × ${height} px`);
        return;
      }

      const newBrands = [...formData.brands];
      newBrands[index].brandImage = file;

      const reader = new FileReader();
      reader.onloadend = () => {
        newBrands[index].brandImagePreview = reader.result;
        setFormData({ ...formData, brands: newBrands });
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Remove file handlers for bulk uploads - UPDATED FOR DESKTOP/MOBILE SEPARATION
  const removeDesktopHeroCarouselImage = (index) => {
    setDesktopHeroCarouselImages(desktopHeroCarouselImages.filter((_, i) => i !== index));
    setDesktopHeroCarouselPreviews(desktopHeroCarouselPreviews.filter((_, i) => i !== index));
  };

  const removeMobileHeroCarouselImage = (index) => {
    setMobileHeroCarouselImages(mobileHeroCarouselImages.filter((_, i) => i !== index));
    setMobileHeroCarouselPreviews(mobileHeroCarouselPreviews.filter((_, i) => i !== index));
  };

  const removeCarouselImage = (index) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== index));
    setCarouselImagePreviews(carouselImagePreviews.filter((_, i) => i !== index));
  };

  // Remove individual category image
  const removeCategoryImage = (index) => {
    const newCategories = [...formData.categories];
    newCategories[index].categoryImage = null;
    newCategories[index].categoryImagePreview = '';
    setFormData({ ...formData, categories: newCategories });
  };

  // Remove individual brand logo
  const removeBrandLogo = (index) => {
    const newBrands = [...formData.brands];
    newBrands[index].brandImage = null;
    newBrands[index].brandImagePreview = '';
    setFormData({ ...formData, brands: newBrands });
  };

  // Categories Handlers
  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index][field] = value;
    setFormData({ ...formData, categories: newCategories });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { categoryTitle: '', categoryUrl: '', categoryImage: null, categoryImagePreview: '' }]
    });
  };

  const removeCategory = (index) => {
    if (formData.categories.length > 1) {
      const newCategories = formData.categories.filter((_, i) => i !== index);
      setFormData({ ...formData, categories: newCategories });
    }
  };

  // Brands Handlers
  const handleBrandItemChange = (index, field, value) => {
    const newBrands = [...formData.brands];
    newBrands[index][field] = value;
    setFormData({ ...formData, brands: newBrands });
  };

  const addBrandItem = () => {
    setFormData({
      ...formData,
      brands: [...formData.brands, { brandUrl: '', brandImage: null, brandImagePreview: '' }]
    });
  };

  const removeBrandItem = (index) => {
    if (formData.brands.length > 1) {
      const newBrands = formData.brands.filter((_, i) => i !== index);
      setFormData({ ...formData, brands: newBrands });
    }
  };

  // Q&A Handlers
  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const addQnA = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, ''],
      answers: [...formData.answers, '']
    });
  };

  const removeQnA = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData({ ...formData, questions: newQuestions, answers: newAnswers });
    }
  };

  // CSV Import Handlers
  const handleImportCsvFile = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    try {
      setLoading(true);
      const formDataForUpload = new FormData();
      formDataForUpload.append('brand-pages', selectedFile);

      const res = await axiosInstance.post('/brand-page/import-brand-pages', formDataForUpload, {
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

        navigate('/dashboard/brand-pages/list');
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

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.brand) {
        setError('Please select a brand');
        return;
      }
      if (!brandImage) {
        setError('Please select a brand image');
        return;
      }
      if (desktopHeroCarouselImages.length === 0) {
        setError('Please select at least one desktop hero carousel image');
        return;
      }
      if (mobileHeroCarouselImages.length === 0) {
        setError('Please select at least one mobile hero carousel image');
        return;
      }
      if (carouselImages.length === 0) {
        setError('Please select at least one carousel image');
        return;
      }
      if (!formData.brandTitle) {
        setError('Please enter brand title');
        return;
      }
      if (!formData.categoryHeadingText) {
        setError('Please enter category heading text');
        return;
      }
      if (!formData.brandHeadingText) {
        setError('Please enter brand heading text');
        return;
      }
      if (!formData.QnaHeadingText) {
        setError('Please enter Q&A heading text');
        return;
      }
      if (!formData.trustedByHeadingText) {
        setError('Please enter trusted by heading text');
        return;
      }

      // Validate categories
      const validCategories = formData.categories.filter(cat => cat.categoryTitle.trim());
      if (validCategories.length === 0) {
        setError('Please provide at least one category with a title');
        return;
      }

      // Validate category images
      const categoriesWithImages = formData.categories.filter(cat => cat.categoryImage);
      if (categoriesWithImages.length !== formData.categories.length) {
        setError('Please provide an image for each category');
        return;
      }

      // Validate brands
      const brandsWithImages = formData.brands.filter(brand => brand.brandImage);
      if (brandsWithImages.length !== formData.brands.length) {
        setError('Please provide an image for each brand item');
        return;
      }

      // Validate Q&A
      const validQuestions = formData.questions.filter(q => q.trim());
      const validAnswers = formData.answers.filter(a => a.trim());

      if (validQuestions.length === 0 || validAnswers.length === 0) {
        setError('Please provide at least one question and answer');
        return;
      }
      if (validQuestions.length !== validAnswers.length) {
        setError('Number of questions and answers must match');
        return;
      }

      setLoading(true);

      // Create FormData
      const submitFormData = new FormData();

      // Append all text fields including the new global category colors
      Object.keys(formData).forEach(key => {
        if (key !== 'categories' && key !== 'brands' && key !== 'questions' && key !== 'answers') {
          submitFormData.append(key, formData[key]);
        }
      });

      // Append arrays as JSON (without image files)
      const categoriesForJson = formData.categories.map(cat => ({
        categoryTitle: cat.categoryTitle,
        categoryUrl: cat.categoryUrl
        // Don't include image files in JSON
      }));

      const brandsForJson = formData.brands.map(brand => ({
        brandUrl: brand.brandUrl
        // Don't include image files in JSON
      }));

      submitFormData.append('categories', JSON.stringify(categoriesForJson));
      submitFormData.append('brands', JSON.stringify(brandsForJson));
      submitFormData.append('questions', JSON.stringify(formData.questions.filter(q => q.trim())));
      submitFormData.append('answers', JSON.stringify(formData.answers.filter(a => a.trim())));

      // Append files
      if (brandImage) {
        submitFormData.append('brandImages', brandImage);
      }

      // Append desktop hero carousel images
      desktopHeroCarouselImages.forEach(image => {
        submitFormData.append('desktopHeroCarouselImages', image);
      });

      // Append mobile hero carousel images
      mobileHeroCarouselImages.forEach(image => {
        submitFormData.append('mobileHeroCarouselImages', image);
      });

      // Append individual category images
      formData.categories.forEach((category, index) => {
        if (category.categoryImage) {
          submitFormData.append('categoryImages', category.categoryImage);
        }
      });

      // Append individual brand logos
      formData.brands.forEach((brandItem, index) => {
        if (brandItem.brandImage) {
          submitFormData.append('brandLogos', brandItem.brandImage);
        }
      });

      // Append carousel images
      carouselImages.forEach(image => {
        submitFormData.append('carouselImages', image);
      });

      const res = await axiosInstance.post('/brand-page/create-brand-page', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // console.log("create brand page - response", res);

      if (res.data.statusCode === 200) {
        // Reset form
        setFormData({
          brand: '',
          brandTitle: '',
          brandTitleColor: '#000000',
          brandDescription: '',
          brandDescriptionColor: '#000000',
          categoryHeadingText: '',
          categoryHeadingTextColor: '#000000',
          categoryDescription: '',
          categoryDescriptionColor: '#000000',
          categoryTitleBgColor: '#004b97ff',
          categoryTitleColor: '#000000ff',
          categories: [{ categoryTitle: '', categoryUrl: '', categoryImage: null, categoryImagePreview: '' }],
          brandHeadingText: '',
          brandHeadingTextColor: '#000000',
          brandHeadingDescription: '',
          brandHeadingDescriptionColor: '#000000',
          brands: [{ brandUrl: '', brandImage: null, brandImagePreview: '' }],
          QnaSectionBgColor: '#ffffff',
          QnaHeadingText: '',
          QnaHeadingTextColor: '#000000',
          questions: [''],
          answers: [''],
          trustedByHeadingText: '',
          trustedByHeadingTextColor: '#000000'
        });

        // Clear all file states
        setBrandImage(null);
        setBrandImagePreview('');
        setDesktopHeroCarouselImages([]);
        setDesktopHeroCarouselPreviews([]);
        setMobileHeroCarouselImages([]);
        setMobileHeroCarouselPreviews([]);
        setCarouselImages([]);
        setCarouselImagePreviews([]);

        navigate('/dashboard/brand-pages/list');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Error creating brand page:', error);
    } finally {
      setLoading(false);
    }
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Brand Page',
    },
  ];

  return (
    <div>
      <Breadcrumb title="Create Brand Page" items={BCrumb} />
      <Grid container spacing={2} marginTop={4}>
        {/* Brand Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="brand-select">
            Select Brand
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="brand-select"
              value={formData.brand}
              onChange={handleBrandChange}
              disabled={loading || brands.length === 0}
              displayEmpty
            >
              <MenuItem value="" disabled>
                {brands.length === 0 ? 'Loading brands...' : 'Select a brand'}
              </MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Brand Section */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
            Brand Section
          </Typography>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Title *</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            value={formData.brandTitle}
            onChange={(e) => setFormData({ ...formData, brandTitle: e.target.value })}
            placeholder="Enter brand title"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Title Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.brandTitleColor}
            onChange={(e) => setFormData({ ...formData, brandTitleColor: e.target.value })}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel>Brand Description</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            multiline
            rows={3}
            value={formData.brandDescription}
            onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
            placeholder="Enter brand description"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Description Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.brandDescriptionColor}
            onChange={(e) => setFormData({ ...formData, brandDescriptionColor: e.target.value })}
          />
        </Grid>

        {/* File Uploads */}
        <Grid size={12}>
          <IndividualFilePreview
            title={IMAGE_SIZES.brandImage.label}
            preview={brandImagePreview}
            onRemove={() => {
              setBrandImage(null);
              setBrandImagePreview('');
            }}
            onFileChange={handleBrandImageChange}
            required={true}
            imageSize={`${IMAGE_SIZES.brandImage.width} × ${IMAGE_SIZES.brandImage.height} px`}
          />
        </Grid>

        {/* Desktop Hero Carousel Images */}
        <Grid size={12}>
          <BulkFilePreviewSection
            title={IMAGE_SIZES.desktopHeroCarousel.label + ' *'}
            previews={desktopHeroCarouselPreviews}
            onRemove={removeDesktopHeroCarouselImage}
            acceptMultiple={true}
            fileHandler={handleDesktopHeroCarouselImagesChange}
            imageSize={`${IMAGE_SIZES.desktopHeroCarousel.width} × ${IMAGE_SIZES.desktopHeroCarousel.height} px`}
          />
        </Grid>

        {/* Mobile Hero Carousel Images */}
        <Grid size={12}>
          <BulkFilePreviewSection
            title={IMAGE_SIZES.mobileHeroCarousel.label + ' *'}
            previews={mobileHeroCarouselPreviews}
            onRemove={removeMobileHeroCarouselImage}
            acceptMultiple={true}
            fileHandler={handleMobileHeroCarouselImagesChange}
            imageSize={`${IMAGE_SIZES.mobileHeroCarousel.width} × ${IMAGE_SIZES.mobileHeroCarousel.height} px`}
          />
        </Grid>

        {/* Category Section */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
            Category Section
          </Typography>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Category Heading Text *</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            value={formData.categoryHeadingText}
            onChange={(e) => setFormData({ ...formData, categoryHeadingText: e.target.value })}
            placeholder="Enter category heading text"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Category Heading Text Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.categoryHeadingTextColor}
            onChange={(e) => setFormData({ ...formData, categoryHeadingTextColor: e.target.value })}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel>Category Description</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            multiline
            rows={3}
            value={formData.categoryDescription}
            onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
            placeholder="Enter category description"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Category Description Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.categoryDescriptionColor}
            onChange={(e) => setFormData({ ...formData, categoryDescriptionColor: e.target.value })}
          />
        </Grid>

        {/* Global Category Colors */}
        <Grid size={6}>
          <CustomFormLabel>All Categories Title Background Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.categoryTitleBgColor}
            onChange={(e) => setFormData({ ...formData, categoryTitleBgColor: e.target.value })}
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>All Categories Title Text Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.categoryTitleColor}
            onChange={(e) => setFormData({ ...formData, categoryTitleColor: e.target.value })}
          />
        </Grid>

        {/* Category Items with Individual Image Uploads */}
        {formData.categories.map((category, index) => (
          <Grid size={12} key={index}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">Category {index + 1}</Typography>
                  {formData.categories.length > 1 && (
                    <IconButton color="error" onClick={() => removeCategory(index)}>
                      <IconTrash size="1.2rem" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CustomFormLabel>Category Title *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      value={category.categoryTitle}
                      onChange={(e) => handleCategoryChange(index, 'categoryTitle', e.target.value)}
                      placeholder="Enter category title"
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel>Category URL</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      value={category.categoryUrl}
                      onChange={(e) => handleCategoryChange(index, 'categoryUrl', e.target.value)}
                      placeholder="Enter category URL"
                    />
                  </Grid>
                  <Grid size={12}>
                    <IndividualFilePreview
                      title={IMAGE_SIZES.categoryImage.label}
                      preview={category.categoryImagePreview}
                      onRemove={() => removeCategoryImage(index)}
                      onFileChange={(e) => handleCategoryImageChange(index, e)}
                      required={true}
                      imageSize={`${IMAGE_SIZES.categoryImage.width} × ${IMAGE_SIZES.categoryImage.height} px`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Button
            variant="outlined"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={addCategory}
            sx={{ mb: 2 }}
          >
            Add Category
          </Button>
        </Grid>

        {/* Brands Section */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
            Brands Section
          </Typography>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Heading Text *</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            value={formData.brandHeadingText}
            onChange={(e) => setFormData({ ...formData, brandHeadingText: e.target.value })}
            placeholder="Enter brand heading text"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Heading Text Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.brandHeadingTextColor}
            onChange={(e) => setFormData({ ...formData, brandHeadingTextColor: e.target.value })}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel>Brand Heading Description</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            multiline
            rows={3}
            value={formData.brandHeadingDescription}
            onChange={(e) => setFormData({ ...formData, brandHeadingDescription: e.target.value })}
            placeholder="Enter brand heading description"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Brand Heading Description Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.brandHeadingDescriptionColor}
            onChange={(e) => setFormData({ ...formData, brandHeadingDescriptionColor: e.target.value })}
          />
        </Grid>

        {/* Brand Items with Individual Logo Uploads */}
        {formData.brands.map((brandItem, index) => (
          <Grid size={12} key={index}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">Brand Item {index + 1}</Typography>
                  {formData.brands.length > 1 && (
                    <IconButton color="error" onClick={() => removeBrandItem(index)}>
                      <IconTrash size="1.2rem" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <CustomFormLabel>Brand URL</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      value={brandItem.brandUrl}
                      onChange={(e) => handleBrandItemChange(index, 'brandUrl', e.target.value)}
                      placeholder="Enter brand URL"
                    />
                  </Grid>
                  <Grid size={12}>
                    <IndividualFilePreview
                      title={IMAGE_SIZES.brandLogo.label}
                      preview={brandItem.brandImagePreview}
                      onRemove={() => removeBrandLogo(index)}
                      onFileChange={(e) => handleBrandLogoChange(index, e)}
                      required={true}
                      imageSize={`${IMAGE_SIZES.brandLogo.width} × ${IMAGE_SIZES.brandLogo.height} px`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Button
            variant="outlined"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={addBrandItem}
            sx={{ mb: 2 }}
          >
            Add Brand Item
          </Button>
        </Grid>

        {/* Q&A Section */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
            Q&A Section
          </Typography>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Q&A Heading Text *</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            value={formData.QnaHeadingText}
            onChange={(e) => setFormData({ ...formData, QnaHeadingText: e.target.value })}
            placeholder="Enter Q&A heading text"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Q&A Heading Text Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.QnaHeadingTextColor}
            onChange={(e) => setFormData({ ...formData, QnaHeadingTextColor: e.target.value })}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel>Q&A Section Background Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.QnaSectionBgColor}
            onChange={(e) => setFormData({ ...formData, QnaSectionBgColor: e.target.value })}
          />
        </Grid>

        {/* Q&A Items */}
        {formData.questions.map((question, index) => (
          <Grid size={12} key={index}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">Q&A {index + 1}</Typography>
                  {formData.questions.length > 1 && (
                    <IconButton color="error" onClick={() => removeQnA(index)}>
                      <IconTrash size="1.2rem" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <CustomFormLabel>Question</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Enter question"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomFormLabel>Answer</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter answer"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Button
            variant="outlined"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={addQnA}
            sx={{ mb: 2 }}
          >
            Add Q&A
          </Button>
        </Grid>

        {/* Trusted By Section */}
        <Grid size={12}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
            Trusted By Section
          </Typography>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Trusted By Heading Text *</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            value={formData.trustedByHeadingText}
            onChange={(e) => setFormData({ ...formData, trustedByHeadingText: e.target.value })}
            placeholder="Enter trusted by heading text"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel>Trusted By Heading Text Color</CustomFormLabel>
          <CustomOutlinedInput
            fullWidth
            type="color"
            value={formData.trustedByHeadingTextColor}
            onChange={(e) => setFormData({ ...formData, trustedByHeadingTextColor: e.target.value })}
          />
        </Grid>

        <Grid size={12}>
          <BulkFilePreviewSection
            title={IMAGE_SIZES.carouselImage.label}
            previews={carouselImagePreviews}
            onRemove={removeCarouselImage}
            acceptMultiple={true}
            fileHandler={handleCarouselImagesChange}
            imageSize={`${IMAGE_SIZES.carouselImage.width} × ${IMAGE_SIZES.carouselImage.height} px`}
          />
        </Grid>

        {/* Error Display */}
        {error && (
          <Grid size={12}>
            <Box sx={{ color: 'red', p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
              {error}
            </Box>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: '#2E2F7F', minWidth: '120px' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Brand Page'}
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
          Import Brand Pages from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple brand pages at once.
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

      {/* Loading Backdrop */}
      <Backdrop open={loading}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={50} />
          <Typography variant="body2" color="inherit">
            Creating brand page...
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
};

export default CreateBrandPage;