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
import { useNavigate, useParams } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

// Image size configurations
const IMAGE_SIZES = {
  brandImage: { width: 600, height: 300, label: 'Brand Image (600 × 300 px)' },
  heroCarousel: { width: 4478, height: 1415, label: 'Hero Carousel Images (4478 × 1415 px)' },
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
const IndividualFilePreview = ({ title, preview, onRemove, onFileChange, required = false, existingImage = null, onRemoveExisting = null, error = false, imageSize }) => (
  <Box sx={{ mb: 2 }}>
    <CustomFormLabel>
      {title}
      {required && <span style={{ color: 'red' }}>*</span>}
    </CustomFormLabel>
    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
      Required size: {imageSize}
    </Typography>

    {/* Show existing image if no new file is selected */}
    {existingImage && !preview && (
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2, mr: 2 }}>
        <img
          src={existingImage}
          alt={`Existing ${title}`}
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'cover',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        {onRemoveExisting && (
          <IconButton
            size="small"
            color="error"
            onClick={onRemoveExisting}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:hover': { backgroundColor: '#ffebee' }
            }}
          >
            <IconX size="1rem" />
          </IconButton>
        )}
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Current image
        </Typography>
      </Box>
    )}

    {/* Show new file preview */}
    {preview && (
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2, mr: 2 }}>
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': { backgroundColor: '#ffebee' }
          }}
        >
          <IconX size="1rem" />
        </IconButton>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'green' }}>
          New image selected
        </Typography>
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
      sx={{
        mt: 1,
        borderColor: error ? 'red' : undefined,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: error ? 'red' : undefined,
        }
      }}
      error={error}
    />
    {error && (
      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
        {title} is required
      </Typography>
    )}
  </Box>
);

// Bulk File Preview Component (for hero carousel and carousel images)
const BulkFilePreviewSection = ({ title, previews, onRemove, acceptMultiple = true, fileHandler, existingImages = [], onRemoveExisting = null, error = false, imageSize }) => (
  <Box sx={{ mb: 2 }}>
    <CustomFormLabel>
      {title}
      {title.includes('*') && <span style={{ color: 'red' }}>*</span>}
    </CustomFormLabel>
    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
      Required size: {imageSize}
    </Typography>

    {/* Show existing images */}
    {existingImages.length > 0 && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
          Current images:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {existingImages.map((img, index) => (
            <Box key={`existing-${index}`} sx={{ position: 'relative' }}>
              <img
                src={img}
                alt={`Existing ${index + 1}`}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              {onRemoveExisting && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveExisting(index)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    '&:hover': { backgroundColor: '#ffebee' }
                  }}
                >
                  <IconX size="1rem" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    )}

    {/* Show new file previews */}
    {previews.length > 0 && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'green', fontWeight: 'bold' }}>
          New images to add:
        </Typography>
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  '&:hover': { backgroundColor: '#ffebee' }
                }}
              >
                <IconX size="1rem" />
              </IconButton>
            </Box>
          ))}
        </Box>
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
      sx={{
        borderColor: error ? 'red' : undefined,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: error ? 'red' : undefined,
        }
      }}
      error={error}
    />
    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
      {acceptMultiple ? 'You can select multiple images at once - they will be added to existing images' : 'Select one image'}
    </Typography>
    {error && (
      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
        {title} is required
      </Typography>
    )}
  </Box>
);

const EditBrandPage = () => {
  const [formData, setFormData] = useState({
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

  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const { id } = useParams();

  // File states for bulk uploads
  const [brandImage, setBrandImage] = useState(null);
  const [brandImagePreview, setBrandImagePreview] = useState('');
  const [heroCarouselImages, setHeroCarouselImages] = useState([]);
  const [heroCarouselPreviews, setHeroCarouselPreviews] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselImagePreviews, setCarouselImagePreviews] = useState([]);

  // Existing images state
  const [existingBrandImage, setExistingBrandImage] = useState('');
  const [existingHeroCarouselImages, setExistingHeroCarouselImages] = useState([]);
  const [existingCarouselImages, setExistingCarouselImages] = useState([]);

  // Removed existing images state
  const [removedExistingImages, setRemovedExistingImages] = useState({
    brandImage: false,
    heroCarousel: [],
    carousel: []
  });

  const fetchBrandPageById = async () => {
    try {
      const response = await axiosInstance.get(`/brand-page/get-brand-page/${id}`);
      console.log("response brand page", response.data.data);

      if (response.data.statusCode === 200) {
        const data = response.data.data;

        // Set existing images
        setExistingBrandImage(data.brandImages || '');
        setExistingHeroCarouselImages(data.heroCarouselImages || []);
        setExistingCarouselImages(data.carouselImages || []);

        // Initialize removed images arrays
        setRemovedExistingImages({
          brandImage: false,
          heroCarousel: Array(data.heroCarouselImages?.length || 0).fill(false),
          carousel: Array(data.carouselImages?.length || 0).fill(false)
        });

        // Transform categories and brands for the form
        const transformedCategories = data.categories?.map(cat => ({
          categoryTitle: cat.categoryTitle || '',
          categoryUrl: cat.categoryUrl || '',
          categoryImage: null,
          categoryImagePreview: cat.categoryImage || ''
        })) || [{ categoryTitle: '', categoryUrl: '', categoryImage: null, categoryImagePreview: '' }];

        const transformedBrands = data.brands?.map(brand => ({
          brandUrl: brand.brandUrl || '',
          brandImage: null,
          brandImagePreview: brand.brandImage || ''
        })) || [{ brandUrl: '', brandImage: null, brandImagePreview: '' }];

        setFormData({
          brand: data.brand?._id || '',
          brandTitle: data.brandTitle || '',
          brandTitleColor: data.brandTitleColor || '#000000',
          brandDescription: data.brandDescription || '',
          brandDescriptionColor: data.brandDescriptionColor || '#000000',
          categoryHeadingText: data.categoryHeadingText || '',
          categoryHeadingTextColor: data.categoryHeadingTextColor || '#000000',
          categoryDescription: data.categoryDescription || '',
          categoryDescriptionColor: data.categoryDescriptionColor || '#000000',
          categoryTitleBgColor: data.categoryTitleBgColor || '#004b97ff',
          categoryTitleColor: data.categoryTitleColor || '#000000ff',
          categories: transformedCategories,
          brandHeadingText: data.brandHeadingText || '',
          brandHeadingTextColor: data.brandHeadingTextColor || '#000000',
          brandHeadingDescription: data.brandHeadingDescription || '',
          brandHeadingDescriptionColor: data.brandHeadingDescriptionColor || '#000000',
          brands: transformedBrands,
          QnaSectionBgColor: data.QnaSectionBgColor || '#ffffff',
          QnaHeadingText: data.QnaHeadingText || '',
          QnaHeadingTextColor: data.QnaHeadingTextColor || '#000000',
          questions: data.questions || [''],
          answers: data.answers || [''],
          trustedByHeadingText: data.trustedByHeadingText || '',
          trustedByHeadingTextColor: data.trustedByHeadingTextColor || '#000000'
        });
      }
    } catch (error) {
      console.error('Error fetching brand page:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBrandPageById();
  }, [id]);

  const fetchBrandsList = async () => {
    try {
      const response = await axiosInstance.get('/brand/get-brands-list');
      console.log("response brands", response);

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

  // File Handlers for bulk uploads with size validation
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
      // Clear validation error for brand image
      setValidationErrors(prev => ({ ...prev, brandImage: false }));
    }
  };

  const handleHeroCarouselImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate all files first
      for (const file of files) {
        const { isValid, width, height } = await validateImageDimensions(
          file,
          IMAGE_SIZES.heroCarousel.width,
          IMAGE_SIZES.heroCarousel.height
        );

        if (!isValid) {
          setError(`Hero carousel image must be exactly ${IMAGE_SIZES.heroCarousel.width} × ${IMAGE_SIZES.heroCarousel.height} px. Current size: ${width} × ${height} px`);
          return;
        }
      }

      // Add new files to existing array (don't replace)
      setHeroCarouselImages([...heroCarouselImages, ...files]);

      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setHeroCarouselPreviews([...heroCarouselPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      setError('');
      // Clear validation error for hero carousel
      setValidationErrors(prev => ({ ...prev, heroCarouselImages: false }));
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

      // Add new files to existing array (don't replace)
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
      // Clear validation error for carousel images
      setValidationErrors(prev => ({ ...prev, carouselImages: false }));
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
      // Clear validation error for this category image
      setValidationErrors(prev => ({
        ...prev,
        [`categoryImage_${index}`]: false
      }));
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
      // Clear validation error for this brand logo
      setValidationErrors(prev => ({
        ...prev,
        [`brandLogo_${index}`]: false
      }));
    }
  };

  // Remove file handlers for bulk uploads
  const removeHeroCarouselImage = (index) => {
    setHeroCarouselImages(heroCarouselImages.filter((_, i) => i !== index));
    setHeroCarouselPreviews(heroCarouselPreviews.filter((_, i) => i !== index));
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

  // Remove existing images handlers
  const removeExistingBrandImage = () => {
    setRemovedExistingImages(prev => ({
      ...prev,
      brandImage: true
    }));
    setExistingBrandImage('');
  };

  const removeExistingHeroCarouselImage = (index) => {
    setRemovedExistingImages(prev => ({
      ...prev,
      heroCarousel: prev.heroCarousel.map((item, i) => i === index ? true : item)
    }));
  };

  const removeExistingCarouselImage = (index) => {
    setRemovedExistingImages(prev => ({
      ...prev,
      carousel: prev.carousel.map((item, i) => i === index ? true : item)
    }));
  };

  const removeExistingCategoryImage = (categoryIndex) => {
    const newCategories = [...formData.categories];
    newCategories[categoryIndex].categoryImagePreview = '';
    setFormData({ ...formData, categories: newCategories });
  };

  const removeExistingBrandLogo = (brandIndex) => {
    const newBrands = [...formData.brands];
    newBrands[brandIndex].brandImagePreview = '';
    setFormData({ ...formData, brands: newBrands });
  };

  // Helper function to filter existing images based on removal status
  const getFilteredExistingImages = (images, removedIndices) => {
    return images.filter((_, index) => !removedIndices[index]);
  };

  const filteredExistingHeroCarouselImages = getFilteredExistingImages(
    existingHeroCarouselImages,
    removedExistingImages.heroCarousel
  );

  const filteredExistingCarouselImages = getFilteredExistingImages(
    existingCarouselImages,
    removedExistingImages.carousel
  );

  // Categories Handlers
  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index][field] = value;
    setFormData({ ...formData, categories: newCategories });

    // Clear validation error when user starts typing
    if (field === 'categoryTitle' && value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [`categoryTitle_${index}`]: false
      }));
    }
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

    // Clear validation error when user starts typing
    if (value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [`question_${index}`]: false
      }));
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });

    // Clear validation error when user starts typing
    if (value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [`answer_${index}`]: false
      }));
    }
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

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Required field validations
    if (!formData.brand) {
      errors.brand = 'Brand selection is required';
    }
    if (!formData.brandTitle.trim()) {
      errors.brandTitle = 'Brand title is required';
    }
    if (!formData.categoryHeadingText.trim()) {
      errors.categoryHeadingText = 'Category heading text is required';
    }
    if (!formData.brandHeadingText.trim()) {
      errors.brandHeadingText = 'Brand heading text is required';
    }
    if (!formData.QnaHeadingText.trim()) {
      errors.QnaHeadingText = 'Q&A heading text is required';
    }
    if (!formData.trustedByHeadingText.trim()) {
      errors.trustedByHeadingText = 'Trusted by heading text is required';
    }

    // Brand image validation
    if (!existingBrandImage && !brandImage) {
      errors.brandImage = true;
    }

    // Hero carousel images validation
    if (filteredExistingHeroCarouselImages.length === 0 && heroCarouselImages.length === 0) {
      errors.heroCarouselImages = true;
    }

    // Carousel images validation
    if (filteredExistingCarouselImages.length === 0 && carouselImages.length === 0) {
      errors.carouselImages = true;
    }

    // Categories validation
    formData.categories.forEach((category, index) => {
      if (!category.categoryTitle.trim()) {
        errors[`categoryTitle_${index}`] = true;
      }
      // Category image validation
      if (!category.categoryImagePreview && !category.categoryImage) {
        errors[`categoryImage_${index}`] = true;
      }
    });

    // Q&A validation
    formData.questions.forEach((question, index) => {
      if (!question.trim()) {
        errors[`question_${index}`] = true;
      }
    });

    formData.answers.forEach((answer, index) => {
      if (!answer.trim()) {
        errors[`answer_${index}`] = true;
      }
    });

    // Check if at least one category has title
    const hasValidCategory = formData.categories.some(cat => cat.categoryTitle.trim());
    if (!hasValidCategory) {
      errors.categories = 'At least one category with title is required';
    }

    // Check if at least one Q&A pair is complete
    const hasValidQnA = formData.questions.some((q, index) => q.trim() && formData.answers[index]?.trim());
    if (!hasValidQnA) {
      errors.qna = 'At least one complete Q&A pair is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      setError('Please Fill All Required Fields ...');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create FormData for update
      const submitFormData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'categories' && key !== 'brands' && key !== 'questions' && key !== 'answers') {
          submitFormData.append(key, formData[key]);
        }
      });

      // Append arrays as JSON (without image files)
      const categoriesForJson = formData.categories.map(cat => ({
        categoryTitle: cat.categoryTitle,
        categoryUrl: cat.categoryUrl
      }));

      const brandsForJson = formData.brands.map(brand => ({
        brandUrl: brand.brandUrl
      }));

      submitFormData.append('categories', JSON.stringify(categoriesForJson));
      submitFormData.append('brands', JSON.stringify(brandsForJson));
      submitFormData.append('questions', JSON.stringify(formData.questions.filter(q => q.trim())));
      submitFormData.append('answers', JSON.stringify(formData.answers.filter(a => a.trim())));

      // Append removed existing images info
      submitFormData.append('removedBrandImage', removedExistingImages.brandImage.toString());
      submitFormData.append('removedHeroCarouselIndices', JSON.stringify(
        removedExistingImages.heroCarousel
          .map((removed, index) => removed ? index : -1)
          .filter(index => index !== -1)
      ));
      submitFormData.append('removedCarouselIndices', JSON.stringify(
        removedExistingImages.carousel
          .map((removed, index) => removed ? index : -1)
          .filter(index => index !== -1)
      ));

      // Append files only if they are selected (for update)
      if (brandImage) {
        submitFormData.append('brandImages', brandImage);
      }

      // Append new hero carousel images (these will be ADDED to existing ones)
      heroCarouselImages.forEach(image => {
        submitFormData.append('heroCarouselImages', image);
      });

      // Append individual category images only if they are selected
      formData.categories.forEach((category, index) => {
        if (category.categoryImage) {
          submitFormData.append('categoryImages', category.categoryImage);
        }
      });

      // Append individual brand logos only if they are selected
      formData.brands.forEach((brandItem, index) => {
        if (brandItem.brandImage) {
          submitFormData.append('brandLogos', brandItem.brandImage);
        }
      });

      // Append new carousel images (these will be ADDED to existing ones)
      carouselImages.forEach(image => {
        submitFormData.append('carouselImages', image);
      });

      // Use PUT request for update
      const res = await axiosInstance.put(`/brand-page/update-brand-page/${id}`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("update brand page - response", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/brand-pages/list');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Error updating brand page:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Brand Page
      </Typography>

      <Grid container spacing={2}>
        {/* Brand Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="brand-select">
            Select Brand
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth error={!!validationErrors.brand}>
            <Select
              id="brand-select"
              value={formData.brand}
              onChange={(e) => {
                setFormData({ ...formData, brand: e.target.value });
                if (e.target.value) {
                  setValidationErrors(prev => ({ ...prev, brand: false }));
                }
              }}
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
          {validationErrors.brand && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.brand}
            </Typography>
          )}
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
            error={!!validationErrors.brandTitle}
          />
          {validationErrors.brandTitle && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.brandTitle}
            </Typography>
          )}
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
            existingImage={existingBrandImage}
            onRemoveExisting={removeExistingBrandImage}
            error={validationErrors.brandImage}
            required={true}
            imageSize={`${IMAGE_SIZES.brandImage.width} × ${IMAGE_SIZES.brandImage.height} px`}
          />
        </Grid>

        <Grid size={12}>
          <BulkFilePreviewSection
            title={IMAGE_SIZES.heroCarousel.label}
            previews={heroCarouselPreviews}
            onRemove={removeHeroCarouselImage}
            acceptMultiple={true}
            fileHandler={handleHeroCarouselImagesChange}
            existingImages={filteredExistingHeroCarouselImages}
            onRemoveExisting={removeExistingHeroCarouselImage}
            error={validationErrors.heroCarouselImages}
            imageSize={`${IMAGE_SIZES.heroCarousel.width} × ${IMAGE_SIZES.heroCarousel.height} px`}
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
            error={!!validationErrors.categoryHeadingText}
          />
          {validationErrors.categoryHeadingText && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.categoryHeadingText}
            </Typography>
          )}
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
            <Card variant="outlined" sx={{ mb: 2, borderColor: validationErrors[`categoryTitle_${index}`] ? 'red' : undefined }}>
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
                      error={!!validationErrors[`categoryTitle_${index}`]}
                    />
                    {validationErrors[`categoryTitle_${index}`] && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Category title is required
                      </Typography>
                    )}
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
                      preview={category.categoryImagePreview && typeof category.categoryImagePreview === 'string' && !category.categoryImagePreview.startsWith('data:') ? '' : category.categoryImagePreview}
                      onRemove={() => removeCategoryImage(index)}
                      onFileChange={(e) => handleCategoryImageChange(index, e)}
                      existingImage={category.categoryImagePreview && typeof category.categoryImagePreview === 'string' && category.categoryImagePreview.startsWith('http') ? category.categoryImagePreview : null}
                      onRemoveExisting={() => removeExistingCategoryImage(index)}
                      error={!!validationErrors[`categoryImage_${index}`]}
                      required={true}
                      imageSize={`${IMAGE_SIZES.categoryImage.width} × ${IMAGE_SIZES.categoryImage.height} px`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {validationErrors.categories && (
          <Grid size={12}>
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
              {validationErrors.categories}
            </Typography>
          </Grid>
        )}

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
            error={!!validationErrors.brandHeadingText}
          />
          {validationErrors.brandHeadingText && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.brandHeadingText}
            </Typography>
          )}
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
                      preview={brandItem.brandImagePreview && typeof brandItem.brandImagePreview === 'string' && !brandItem.brandImagePreview.startsWith('data:') ? '' : brandItem.brandImagePreview}
                      onRemove={() => removeBrandLogo(index)}
                      onFileChange={(e) => handleBrandLogoChange(index, e)}
                      existingImage={brandItem.brandImagePreview && typeof brandItem.brandImagePreview === 'string' && brandItem.brandImagePreview.startsWith('http') ? brandItem.brandImagePreview : null}
                      onRemoveExisting={() => removeExistingBrandLogo(index)}
                      error={!!validationErrors[`brandLogo_${index}`]}
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
            error={!!validationErrors.QnaHeadingText}
          />
          {validationErrors.QnaHeadingText && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.QnaHeadingText}
            </Typography>
          )}
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
            <Card variant="outlined" sx={{ mb: 2, borderColor: (validationErrors[`question_${index}`] || validationErrors[`answer_${index}`]) ? 'red' : undefined }}>
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
                    <CustomFormLabel>Question *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Enter question"
                      error={!!validationErrors[`question_${index}`]}
                    />
                    {validationErrors[`question_${index}`] && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Question is required
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <CustomFormLabel>Answer *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter answer"
                      error={!!validationErrors[`answer_${index}`]}
                    />
                    {validationErrors[`answer_${index}`] && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Answer is required
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {validationErrors.qna && (
          <Grid size={12}>
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
              {validationErrors.qna}
            </Typography>
          </Grid>
        )}

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
            error={!!validationErrors.trustedByHeadingText}
          />
          {validationErrors.trustedByHeadingText && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {validationErrors.trustedByHeadingText}
            </Typography>
          )}
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
            existingImages={filteredExistingCarouselImages}
            onRemoveExisting={removeExistingCarouselImage}
            error={validationErrors.carouselImages}
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
            {loading ? 'Updating...' : 'Update Brand Page'}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/dashboard/brand-pages/list')}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>

      {/* Loading Backdrop */}
      <Backdrop open={loading}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={50} />
          <Typography variant="body2" color="inherit">
            Updating brand page...
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
};

export default EditBrandPage;