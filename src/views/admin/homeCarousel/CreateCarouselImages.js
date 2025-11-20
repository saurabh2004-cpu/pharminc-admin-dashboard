import React, { useState, useRef } from 'react';
import {
    Grid,
    Box,
    Typography,
    Button,
    Backdrop,
    CircularProgress,
    IconButton,
    Card,
    CardMedia,
    TextField
} from '@mui/material';
import { IconUpload, IconX } from '@tabler/icons';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateCarouselImages = () => {
    const [desktopImages, setDesktopImages] = useState([]);
    const [mobileImages, setMobileImages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const desktopFileInputRef = useRef(null);
    const mobileFileInputRef = useRef(null);

    // Handle desktop image selection
    const handleDesktopImageSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types
        const validFiles = files.filter(file =>
            file.type.startsWith('image/')
        );

        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Please select only image files.');
        }

        // Create preview URLs with sequence and url fields
        const newDesktopImages = validFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            sequence: desktopImages.length + index + 1,
            url: ''  // Initialize empty URL
        }));

        setDesktopImages(prev => [...prev, ...newDesktopImages]);
        setError('');

        // Reset file input
        if (desktopFileInputRef.current) {
            desktopFileInputRef.current.value = '';
        }
    };

    // Handle mobile image selection
    const handleMobileImageSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types
        const validFiles = files.filter(file =>
            file.type.startsWith('image/')
        );

        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Please select only image files.');
        }

        // Create preview URLs with sequence and url fields
        const newMobileImages = validFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            sequence: mobileImages.length + index + 1,
            url: ''  // Initialize empty URL
        }));

        setMobileImages(prev => [...prev, ...newMobileImages]);
        setError('');

        // Reset file input
        if (mobileFileInputRef.current) {
            mobileFileInputRef.current.value = '';
        }
    };

    // Handle sequence change for desktop images
    const handleDesktopSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index].sequence = numSequence;
            return newImages;
        });
    };

    // Handle sequence change for mobile images
    const handleMobileSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setMobileImages(prev => {
            const newImages = [...prev];
            newImages[index].sequence = numSequence;
            return newImages;
        });
    };

    // Handle URL change for desktop images
    const handleDesktopUrlChange = (index, newUrl) => {
        setDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index].url = newUrl;
            return newImages;
        });
    };

    // Handle URL change for mobile images
    const handleMobileUrlChange = (index, newUrl) => {
        setMobileImages(prev => {
            const newImages = [...prev];
            newImages[index].url = newUrl;
            return newImages;
        });
    };

    // Remove desktop image
    const removeDesktopImage = (index) => {
        setDesktopImages(prev => {
            const newImages = [...prev];
            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Remove mobile image
    const removeMobileImage = (index) => {
        setMobileImages(prev => {
            const newImages = [...prev];
            // Revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Validate sequence numbers and URLs
    const validateSequences = () => {
        const desktopSequences = desktopImages.map(img => img.sequence);
        const mobileSequences = mobileImages.map(img => img.sequence);

        // Check for duplicates in desktop
        if (new Set(desktopSequences).size !== desktopSequences.length) {
            setError('Desktop images have duplicate sequence numbers. Please use unique sequence numbers.');
            return false;
        }

        // Check for duplicates in mobile
        if (new Set(mobileSequences).size !== mobileSequences.length) {
            setError('Mobile images have duplicate sequence numbers. Please use unique sequence numbers.');
            return false;
        }

        // Check if any sequence is 0 or negative
        if (desktopSequences.some(seq => seq <= 0) || mobileSequences.some(seq => seq <= 0)) {
            setError('All sequence numbers must be greater than 0.');
            return false;
        }

        // Check if all URLs are filled
        if (desktopImages.some(img => !img.url || img.url.trim() === '')) {
            setError('Please provide URL for all desktop images.');
            return false;
        }

        if (mobileImages.some(img => !img.url || img.url.trim() === '')) {
            setError('Please provide URL for all mobile images.');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validation
        if (desktopImages.length === 0) {
            setError('Please select at least one desktop image');
            return;
        }

        if (mobileImages.length === 0) {
            setError('Please select at least one mobile image');
            return;
        }

        if (desktopImages.length !== mobileImages.length) {
            setError('Number of desktop and mobile images should match');
            return;
        }

        // Validate sequence numbers and URLs
        if (!validateSequences()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();

            // Append desktop images with sequence and URL metadata
            desktopImages.forEach((image, index) => {
                formData.append('desktopImages', image.file);
                formData.append(`desktopSequence_${index}`, image.sequence);
                formData.append(`desktopUrl_${index}`, image.url);
            });

            // Append mobile images with sequence and URL metadata
            mobileImages.forEach((image, index) => {
                formData.append('mobileImages', image.file);
                formData.append(`mobileSequence_${index}`, image.sequence);
                formData.append(`mobileUrl_${index}`, image.url);
            });

            const res = await axiosInstance.post('/home-carousel/upload-carousel-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Upload carousel images response:", res);

            if (res.data.statusCode === 201) {
                setSuccess('Carousel images uploaded successfully!');

                // Clear all images and revoke URLs
                desktopImages.forEach(image => URL.revokeObjectURL(image.preview));
                mobileImages.forEach(image => URL.revokeObjectURL(image.preview));

                setDesktopImages([]);
                setMobileImages([]);

                // Navigate to carousel list after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard/home-page-carousel/Edit');
                }, 2000);

            } else {
                setError(res.data.message || 'Failed to upload carousel images');
            }

        } catch (error) {
            console.error('Upload carousel images error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to upload carousel images');
        } finally {
            setLoading(false);
        }
    };

    // Clear all images
    const handleClearForm = () => {
        // Revoke all object URLs to avoid memory leaks
        desktopImages.forEach(image => URL.revokeObjectURL(image.preview));
        mobileImages.forEach(image => URL.revokeObjectURL(image.preview));

        setDesktopImages([]);
        setMobileImages([]);
        setError('');
        setSuccess('');
    };

    // Clean up object URLs when component unmounts
    React.useEffect(() => {
        return () => {
            desktopImages.forEach(image => URL.revokeObjectURL(image.preview));
            mobileImages.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [desktopImages, mobileImages]);

    return (
        <div>
            <Grid container spacing={3} direction="column">
                {/* Desktop Images Section */}
                <Grid item xs={12}>
                    <CustomFormLabel sx={{ mt: 0 }}>
                        Desktop Images
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Upload desktop carousel images (Recommended: 1920x600px)
                    </Typography>

                    <input
                        ref={desktopFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleDesktopImageSelect}
                        style={{ display: 'none' }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => desktopFileInputRef.current?.click()}
                        disabled={loading}
                        startIcon={<IconUpload size="1.1rem" />}
                        sx={{ mb: 2 }}
                    >
                        Select Desktop Images
                    </Button>

                    {/* Desktop Images Preview */}
                    {desktopImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selected Desktop Images ({desktopImages.length})
                            </Typography>

                            <Grid container spacing={2}>
                                {desktopImages.map((image, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card
                                            sx={{
                                                position: 'relative',
                                                border: '2px solid',
                                                borderColor: 'primary.main'
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={image.preview}
                                                alt={`Desktop ${index + 1}`}
                                                sx={{ objectFit: 'cover' }}
                                            />

                                            <IconButton
                                                size="small"
                                                onClick={() => removeDesktopImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,1)',
                                                    }
                                                }}
                                            >
                                                <IconX size="1rem" />
                                            </IconButton>

                                            <Box sx={{ p: 1 }}>
                                                <Typography
                                                    variant="caption"
                                                    noWrap
                                                    title={image.name}
                                                >
                                                    {image.name}
                                                </Typography>

                                                {/* Sequence Input Field */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={image.sequence}
                                                    onChange={(e) => handleDesktopSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input Field */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={image.url}
                                                    onChange={(e) => handleDesktopUrlChange(index, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                    required
                                                />
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Grid>

                {/* Mobile Images Section */}
                <Grid item xs={12}>
                    <CustomFormLabel sx={{ mt: 2 }}>
                        Mobile Images
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Upload mobile carousel images (Recommended: 768x400px)
                    </Typography>

                    <input
                        ref={mobileFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMobileImageSelect}
                        style={{ display: 'none' }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => mobileFileInputRef.current?.click()}
                        disabled={loading}
                        startIcon={<IconUpload size="1.1rem" />}
                        sx={{ mb: 2 }}
                    >
                        Select Mobile Images
                    </Button>

                    {/* Mobile Images Preview */}
                    {mobileImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selected Mobile Images ({mobileImages.length})
                            </Typography>

                            <Grid container spacing={2}>
                                {mobileImages.map((image, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card
                                            sx={{
                                                position: 'relative',
                                                border: '2px solid',
                                                borderColor: 'secondary.main'
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={image.preview}
                                                alt={`Mobile ${index + 1}`}
                                                sx={{ objectFit: 'cover' }}
                                            />

                                            <IconButton
                                                size="small"
                                                onClick={() => removeMobileImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,1)',
                                                    }
                                                }}
                                            >
                                                <IconX size="1rem" />
                                            </IconButton>

                                            <Box sx={{ p: 1 }}>
                                                <Typography
                                                    variant="caption"
                                                    noWrap
                                                    title={image.name}
                                                >
                                                    {image.name}
                                                </Typography>

                                                {/* Sequence Input Field */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={image.sequence}
                                                    onChange={(e) => handleMobileSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input Field */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={image.url}
                                                    onChange={(e) => handleMobileUrlChange(index, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                    required
                                                />
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Grid>

                {/* Image Count Summary */}
                {(desktopImages.length > 0 || mobileImages.length > 0) && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.300'
                            }}
                        >
                            <Typography variant="subtitle2" gutterBottom>
                                Image Selection Summary:
                            </Typography>

                            <Typography variant="body2">
                                Desktop Images: <strong>{desktopImages.length}</strong>
                            </Typography>

                            <Typography variant="body2">
                                Mobile Images: <strong>{mobileImages.length}</strong>
                            </Typography>

                            {desktopImages.length !== mobileImages.length && (
                                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                    ⚠️ Number of desktop and mobile images should match for proper carousel display.
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                )}

                {/* Success Message */}
                {success && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                color: 'success.main',
                                padding: '10px',
                                backgroundColor: 'success.light',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'success.main'
                            }}
                        >
                            {success}
                        </Box>
                    </Grid>
                )}

                {/* Error Message */}
                {error && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                color: 'error.main',
                                padding: '10px',
                                backgroundColor: 'error.light',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'error.main'
                            }}
                        >
                            {error}
                        </Box>
                    </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12} mt={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || desktopImages.length === 0 || mobileImages.length === 0}
                        sx={{
                            minWidth: '120px',
                            backgroundColor: '#2E2F7F',
                            '&:disabled': {
                                backgroundColor: 'grey.300'
                            }
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} color="inherit" />
                                Uploading...
                            </Box>
                        ) : (
                            'Upload Carousel'
                        )}
                    </Button>

                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearForm}
                        disabled={loading}
                        sx={{ ml: 2, minWidth: '120px' }}
                    >
                        Clear All
                    </Button>
                </Grid>
            </Grid>

            {/* Loading Backdrop */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loading}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" size={50} />

                    <Typography variant="h6" color="inherit">
                        Uploading Carousel Images
                    </Typography>

                    <Typography variant="body2" color="inherit">
                        Please wait while we upload your images...
                    </Typography>
                </Box>
            </Backdrop>
        </div>
    );
};

export default CreateCarouselImages;