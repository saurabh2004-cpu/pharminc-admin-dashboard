import React, { useEffect } from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions, FormControl, Select, MenuItem, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconFileImport, IconUpload, IconPlus, IconTrash } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const CreateBrandPage = () => {
  const [formData, setFormData] = React.useState({
    brand: '',
    heroImage: null,
    question: '',
    answers: [''], // Start with one empty answer
    carouselImages: [],
  });
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [brands, setBrands] = React.useState([]);
  const [heroImagePreview, setHeroImagePreview] = React.useState('');
  const [carouselPreviews, setCarouselPreviews] = React.useState([]);

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

  const handleBrandChange = (e) => {
    setFormData({
      ...formData,
      brand: e.target.value
    });
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        heroImage: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const handleCarouselImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        carouselImages: [...formData.carouselImages, ...files]
      });

      // Create previews for all new images
      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setCarouselPreviews([...carouselPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      setError('');
    }
  };

  const removeCarouselImage = (index) => {
    const newCarouselImages = formData.carouselImages.filter((_, i) => i !== index);
    const newPreviews = carouselPreviews.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      carouselImages: newCarouselImages
    });
    setCarouselPreviews(newPreviews);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({
      ...formData,
      answers: newAnswers
    });
  };

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, '']
    });
  };

  const removeAnswer = (index) => {
    if (formData.answers.length > 1) {
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        answers: newAnswers
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.brand) {
        setError('Please select a brand');
        return;
      }
      if (!formData.heroImage) {
        setError('Please select a hero image');
        return;
      }
      if (!formData.question) {
        setError('Please enter a question');
        return;
      }

      // Filter out empty answers
      const validAnswers = formData.answers.filter(answer => answer.trim());
      if (validAnswers.length === 0) {
        setError('Please provide at least one answer');
        return;
      }

      // Create FormData for multipart/form-data
      const submitFormData = new FormData();
      submitFormData.append('brand', formData.brand);
      submitFormData.append('Question', formData.question);

      // ❌ REMOVE THIS LINE - It's causing the issue:
      // submitFormData.append('answers', formData.answers);

      // Append hero image
      if (formData.heroImage) {
        submitFormData.append('heroimage', formData.heroImage);
      }

      // ✅ Append answers correctly - each one individually with 'answers[]' syntax
      validAnswers.forEach((answer) => {
        submitFormData.append('answers[]', answer);
      });

      // Append carousel images
      formData.carouselImages.forEach((image) => {
        submitFormData.append('carouselImages', image);
      });
      

      const res = await axiosInstance.post('/brand-page/create-brand-page', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("create brand page - response", res);

      if (res.data.statusCode === 200) {
        setFormData({
          brand: '',
          heroImage: null,
          question: '',
          answers: [''],
          carouselImages: [],
        });
        setHeroImagePreview('');
        setCarouselPreviews([]);
        navigate('/dashboard/brand-pages/list');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error(error.message);
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
      formDataForUpload.append('brand-pages', selectedFile);

      const res = await axiosInstance.post('/brand-page/import-brand-pages', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("CSV imported", res.data);

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

  return (
    <div>
      <Grid container>
        {/* Brand Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="brand-select" sx={{ mt: 0 }}>
            Select Brand
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth>
            <Select
              id="brand-select"
              value={formData.brand}
              onChange={handleBrandChange}
              disabled={loading || brands.length === 0}
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

        {/* Hero Image */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="hero-image-file" sx={{ mt: 2 }}>
            Hero Image
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          {heroImagePreview && (
            <Box sx={{ mb: 2 }}>
              <img
                src={heroImagePreview}
                alt="Hero Preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
            </Box>
          )}
          <CustomOutlinedInput
            id="hero-image-file"
            fullWidth
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleHeroImageChange}
            inputProps={{
              style: { cursor: 'pointer' }
            }}
          />
        </Grid>

        {/* Question */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="question-input" sx={{ mt: 2 }}>
            Question
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="question-input"
            fullWidth
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter your question"
          />
        </Grid>

        {/* Answers */}
        <Grid size={12}>
          <CustomFormLabel sx={{ mt: 2 }}>
            Answers
          </CustomFormLabel>
        </Grid>
        {formData.answers.map((answer, index) => (
          <Grid size={12} key={index} sx={{ mb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CustomOutlinedInput
                fullWidth
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Answer ${index + 1}`}
              />
              {formData.answers.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeAnswer(index)}
                  sx={{ flexShrink: 0 }}
                >
                  <IconTrash size="1.2rem" />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
        <Grid size={12}>
          <Button
            variant="outlined"
            startIcon={<IconPlus size="1.1rem" />}
            onClick={addAnswer}
            sx={{ mb: 2 }}
          >
            Add Answer
          </Button>
        </Grid>

        {/* Carousel Images */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="carousel-images-file" sx={{ mt: 2 }}>
            Carousel Images (Multiple)
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          {carouselPreviews.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {carouselPreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Carousel ${index + 1}`}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeCarouselImage(index)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: '#ffebee' }
                    }}
                  >
                    <IconTrash size="1rem" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          <CustomOutlinedInput
            id="carousel-images-file"
            fullWidth
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleCarouselImagesChange}
            inputProps={{
              style: { cursor: 'pointer' },
              multiple: true
            }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            You can select multiple images at once
          </Typography>
        </Grid>



        {error && (
          <Grid size={12} mt={2}>
            <div style={{ color: 'red' }}>
              {error}
            </div>
          </Grid>
        )}

        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: '#2E2F7F' }}
            onClick={handleSubmit}
          >
            Submit
          </Button>

          {/* <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            Import CSV
          </Button> */}
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
    </div>
  );
};

export default CreateBrandPage;