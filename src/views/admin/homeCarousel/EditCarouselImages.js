import React, { useState, useRef, useEffect } from 'react';
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
    Alert,
    TextField
} from '@mui/material';
import { IconUpload, IconX } from '@tabler/icons';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import axiosInstance from '../../../axios/axiosInstance';

const EditCarouselImages = () => {
    const [desktopImages, setDesktopImages] = useState([]);
    const [mobileImages, setMobileImages] = useState([]);
    const [newDesktopImages, setNewDesktopImages] = useState([]);
    const [newMobileImages, setNewMobileImages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState('');

    const desktopFileInputRef = useRef(null);
    const mobileFileInputRef = useRef(null);

    // Extract image name from URL
    const extractImageName = (url) => {
        if (!url) return '';
        return url.split('/').pop();
    };

    // Fetch carousel data
    const fetchCarouselData = async () => {
        try {
            setFetchLoading(true);
            const res = await axiosInstance.get('/home-carousel/get-carousel');

            console.log("res.data", res.data)

            if (res.data.statusCode === 200) {
                const carousel = res.data.data;
                setDesktopImages(carousel?.desktopImages || []);
                setMobileImages(carousel?.mobileImages || []);
            } else {
                setError('Failed to fetch carousel data');
            }
        } catch (error) {
            console.error('Error fetching carousel data:', error);
            setError('Failed to fetch carousel data');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchCarouselData();
    }, []);

    // Handle existing desktop image sequence change
    const handleExistingDesktopSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                ...newImages[index],
                sequence: numSequence
            };
            return newImages;
        });
    };

    // Handle existing desktop image URL change
    const handleExistingDesktopUrlChange = (index, newUrl) => {
        setDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                ...newImages[index],
                url: newUrl
            };
            return newImages;
        });
    };

    // Handle existing mobile image sequence change
    const handleExistingMobileSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setMobileImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                ...newImages[index],
                sequence: numSequence
            };
            return newImages;
        });
    };

    // Handle existing mobile image URL change
    const handleExistingMobileUrlChange = (index, newUrl) => {
        setMobileImages(prev => {
            const newImages = [...prev];
            newImages[index] = {
                ...newImages[index],
                url: newUrl
            };
            return newImages;
        });
    };

    // Handle new desktop image selection with sequence and URL fields
    const handleNewDesktopImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Please select only image files.');
        }

        // Calculate next sequence based on existing desktop images
        const nextSequence = desktopImages.length + newDesktopImages.length + 1;

        const newImages = validFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            sequence: nextSequence + index,
            url: ''  // Initialize empty URL
        }));

        setNewDesktopImages(prev => [...prev, ...newImages]);
        setError('');

        if (desktopFileInputRef.current) {
            desktopFileInputRef.current.value = '';
        }
    };

    // Handle new mobile image selection with sequence and URL fields
    const handleNewMobileImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Please select only image files.');
        }

        // Calculate next sequence based on existing mobile images
        const nextSequence = mobileImages.length + newMobileImages.length + 1;

        const newImages = validFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            sequence: nextSequence + index,
            url: ''  // Initialize empty URL
        }));

        setNewMobileImages(prev => [...prev, ...newImages]);
        setError('');

        if (mobileFileInputRef.current) {
            mobileFileInputRef.current.value = '';
        }
    };

    // Handle new desktop sequence change
    const handleNewDesktopSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setNewDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index].sequence = numSequence;
            return newImages;
        });
    };

    // Handle new desktop URL change
    const handleNewDesktopUrlChange = (index, newUrl) => {
        setNewDesktopImages(prev => {
            const newImages = [...prev];
            newImages[index].url = newUrl;
            return newImages;
        });
    };

    // Handle new mobile sequence change
    const handleNewMobileSequenceChange = (index, newSequence) => {
        const numSequence = parseInt(newSequence) || 0;
        setNewMobileImages(prev => {
            const newImages = [...prev];
            newImages[index].sequence = numSequence;
            return newImages;
        });
    };

    // Handle new mobile URL change
    const handleNewMobileUrlChange = (index, newUrl) => {
        setNewMobileImages(prev => {
            const newImages = [...prev];
            newImages[index].url = newUrl;
            return newImages;
        });
    };

    // Remove new desktop image
    const removeNewDesktopImage = (index) => {
        setNewDesktopImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Remove new mobile image
    const removeNewMobileImage = (index) => {
        setNewMobileImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Handle delete single image
    const handleDeleteSingleImage = async (imageType, imageUrl) => {
        if (!window.confirm(`Are you sure you want to delete this ${imageType} image? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const imageName = extractFilenameFromUrl(imageUrl);
            console.log("Deleting image:", imageName, imageType);

            const res = await axiosInstance.delete(`/home-carousel/delete-single-image/${imageType}/${imageName}`);

            if (res.data.statusCode === 200) {
                setSuccess(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image deleted successfully!`);

                // Update local state - CORRECTED
                if (imageType === 'desktop') {
                    setDesktopImages(prev => prev.filter(img => {
                        const imgUrl = img.image; // img is now an object with image property
                        const imgFilename = extractFilenameFromUrl(imgUrl);
                        return imgFilename !== imageName;
                    }));
                } else {
                    setMobileImages(prev => prev.filter(img => {
                        const imgUrl = img.image; // img is now an object with image property
                        const imgFilename = extractFilenameFromUrl(imgUrl);
                        return imgFilename !== imageName;
                    }));
                }
            } else {
                setError(res.data.message || `Failed to delete ${imageType} image`);
            }
        } catch (error) {
            console.error('Delete single image error:', error);
            setError(error.response?.data?.message || error.message || `Failed to delete ${imageType} image`);
        } finally {
            setLoading(false);
        }
    };

    // Validate sequence numbers and URLs
    const validateSequences = (desktop, mobile, includeUrlCheck = true) => {
        const desktopSequences = desktop.map(img => img.sequence);
        const mobileSequences = mobile.map(img => img.sequence);

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

        // // Check URLs if required
        // if (includeUrlCheck) {
        //     if (desktop.some(img => !img.url || img.url.trim() === '')) {
        //         setError('Please provide URL for all desktop images.');
        //         return false;
        //     }

        //     if (mobile.some(img => !img.url || img.url.trim() === '')) {
        //         setError('Please provide URL for all mobile images.');
        //         return false;
        //     }
        // }

        return true;
    };

    // Helper function to extract filename from URL
    const extractFilenameFromUrl = (url) => {
        if (!url) return '';
        // Extract just the filename from the full URL
        return url.split('/').pop();
    };

    const handleUpdateMetadata = async () => {
        if (desktopImages.length === 0 && mobileImages.length === 0) {
            setError('No existing images to update');
            return;
        }

        // Validate sequences for existing images
        if (!validateSequences(desktopImages, mobileImages, false)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare the update data - extract just the filename from URLs
            const updateData = {
                desktopImages: desktopImages.map(img => ({
                    image: extractFilenameFromUrl(img.image), // Extract just the filename
                    sequence: img.sequence,
                    url: img.url || '' // Ensure URL is at least an empty string
                })),
                mobileImages: mobileImages.map(img => ({
                    image: extractFilenameFromUrl(img.image), // Extract just the filename
                    sequence: img.sequence,
                    url: img.url || '' // Ensure URL is at least an empty string
                }))
            };

            console.log('Sending update data:', updateData); // Debug log
            console.log('Desktop images:', updateData.desktopImages);
            console.log('Mobile images:', updateData.mobileImages);

            const res = await axiosInstance.put('/home-carousel/update-carousel-metadata', updateData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Update response:', res);

            if (res.data.statusCode === 200) {
                setSuccess('Carousel metadata updated successfully!');
                // Refresh the data to show updated sequences/URLs
                await fetchCarouselData();
            } else {
                setError(res.data.message || 'Failed to update metadata');
            }
        } catch (error) {
            console.error('Update metadata error:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.message || error.message || 'Failed to update metadata');
        } finally {
            setLoading(false);
        }
    };

    // Handle update with new images including sequences and URLs
    const handleUpdate = async () => {
        if (newDesktopImages.length === 0 && newMobileImages.length === 0) {
            setError('Please select new images to add');
            return;
        }

        // Validate sequences and URLs before updating
        if (!validateSequences(newDesktopImages, newMobileImages, true)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();

            // Append new desktop images with sequence and URL metadata
            newDesktopImages.forEach((image, index) => {
                formData.append('desktopImages', image.file);
                formData.append(`desktopSequence_${index}`, image.sequence);
                formData.append(`desktopUrl_${index}`, image.url);
            });

            // Append new mobile images with sequence and URL metadata
            newMobileImages.forEach((image, index) => {
                formData.append('mobileImages', image.file);
                formData.append(`mobileSequence_${index}`, image.sequence);
                formData.append(`mobileUrl_${index}`, image.url);
            });

            const res = await axiosInstance.put('/home-carousel/update-carousel-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.statusCode === 200) {
                setSuccess('Carousel updated successfully!');
                const updatedCarousel = res.data.data;
                setDesktopImages(updatedCarousel?.desktopImages || []);
                setMobileImages(updatedCarousel?.mobileImages || []);

                // Clear new images
                newDesktopImages.forEach(image => URL.revokeObjectURL(image.preview));
                newMobileImages.forEach(image => URL.revokeObjectURL(image.preview));
                setNewDesktopImages([]);
                setNewMobileImages([]);
            } else {
                setError(res.data.message || 'Failed to update carousel');
            }
        } catch (error) {
            console.error('Update error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update carousel');
        } finally {
            setLoading(false);
        }
    };

    // Handle replace all images including sequences and URLs
    const handleReplaceAll = async () => {
        if (newDesktopImages.length === 0 || newMobileImages.length === 0) {
            setError('Please select both desktop and mobile images');
            return;
        }

        // Validate sequences and URLs before replacing
        if (!validateSequences(newDesktopImages, newMobileImages, true)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();

            // Append desktop images with sequence and URL metadata
            newDesktopImages.forEach((image, index) => {
                formData.append('desktopImages', image.file);
                formData.append(`desktopSequence_${index}`, image.sequence);
                formData.append(`desktopUrl_${index}`, image.url);
            });

            // Append mobile images with sequence and URL metadata
            newMobileImages.forEach((image, index) => {
                formData.append('mobileImages', image.file);
                formData.append(`mobileSequence_${index}`, image.sequence);
                formData.append(`mobileUrl_${index}`, image.url);
            });

            const res = await axiosInstance.post('/home-carousel/upload-carousel-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.statusCode === 201) {
                setSuccess('Carousel replaced successfully!');
                const updatedCarousel = res.data.data;
                setDesktopImages(updatedCarousel?.desktopImages || []);
                setMobileImages(updatedCarousel?.mobileImages || []);

                newDesktopImages.forEach(image => URL.revokeObjectURL(image.preview));
                newMobileImages.forEach(image => URL.revokeObjectURL(image.preview));
                setNewDesktopImages([]);
                setNewMobileImages([]);
            } else {
                setError(res.data.message || 'Failed to replace carousel');
            }
        } catch (error) {
            console.error('Replace error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to replace carousel');
        } finally {
            setLoading(false);
        }
    };

    // Delete entire carousel
    const handleDeleteEntireCarousel = async () => {
        if (!window.confirm('Are you sure you want to delete the entire carousel? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await axiosInstance.delete('/home-carousel/delete-entire-carousel');

            if (res.data.statusCode === 200) {
                setSuccess('Entire carousel deleted successfully!');
                setDesktopImages([]);
                setMobileImages([]);
            } else {
                setError(res.data.message || 'Failed to delete entire carousel');
            }
        } catch (error) {
            console.error('Delete entire carousel error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to delete entire carousel');
        } finally {
            setLoading(false);
        }
    };

    // Clear new images
    const handleClearNewImages = () => {
        newDesktopImages.forEach(image => URL.revokeObjectURL(image.preview));
        newMobileImages.forEach(image => URL.revokeObjectURL(image.preview));
        setNewDesktopImages([]);
        setNewMobileImages([]);
        setError('');
    };

    // Cleanup
    useEffect(() => {
        return () => {
            newDesktopImages.forEach(image => URL.revokeObjectURL(image.preview));
            newMobileImages.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [newDesktopImages, newMobileImages]);

    // Helper function to get image URL
    const getImageUrl = (imageData) => {
        return typeof imageData === 'string' ? imageData : imageData.image;
    };

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading carousel...</Typography>
            </Box>
        );
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Manage Carousel Images
            </Typography>

            <Grid container spacing={3} direction="column">
                {/* Current Desktop Images */}
                <Grid item xs={12}>
                    <CustomFormLabel>Current Desktop Images ({desktopImages.length})</CustomFormLabel>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Edit sequence and URL for existing images, or delete individual images
                    </Typography>

                    {desktopImages.length > 0 ? (
                        <Grid container spacing={2}>
                            {desktopImages.map((imageData, index) => {
                                const imageUrl = getImageUrl(imageData);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card sx={{ position: 'relative', height: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={imageUrl}
                                                alt={`Desktop ${index + 1}`}
                                                sx={{
                                                    objectFit: 'cover',
                                                    width: '100%'
                                                }}
                                                onError={(e) => {
                                                    console.error('Error loading image:', imageUrl);
                                                    e.target.style.backgroundColor = '#f0f0f0';
                                                    e.target.alt = 'Failed to load image';
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteSingleImage('desktop', imageUrl)}
                                                disabled={loading}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,0,0,0.8)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,0,0,1)',
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: 'rgba(200,200,200,0.8)',
                                                    }
                                                }}
                                            >
                                                <IconX size="1rem" />
                                            </IconButton>
                                            <Box sx={{ p: 1 }}>
                                                <Typography variant="caption" noWrap>
                                                    Desktop {index + 1}
                                                </Typography>

                                                {/* Sequence Input */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={imageData.sequence || ''}
                                                    onChange={(e) => handleExistingDesktopSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={imageData.url || ''}
                                                    onChange={(e) => handleExistingDesktopUrlChange(index, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Alert severity="info">No desktop images yet</Alert>
                    )}
                </Grid>

                {/* Current Mobile Images */}
                <Grid item xs={12}>
                    <CustomFormLabel>Current Mobile Images ({mobileImages.length})</CustomFormLabel>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Edit sequence and URL for existing images, or delete individual images
                    </Typography>

                    {mobileImages.length > 0 ? (
                        <Grid container spacing={2}>
                            {mobileImages.map((imageData, index) => {
                                const imageUrl = getImageUrl(imageData);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card sx={{ position: 'relative', height: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={imageUrl}
                                                alt={`Mobile ${index + 1}`}
                                                sx={{
                                                    objectFit: 'cover',
                                                    width: '100%'
                                                }}
                                                onError={(e) => {
                                                    console.error('Error loading image:', imageUrl);
                                                    e.target.style.backgroundColor = '#f0f0f0';
                                                    e.target.alt = 'Failed to load image';
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteSingleImage('mobile', imageUrl)}
                                                disabled={loading}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255,0,0,0.8)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,0,0,1)',
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: 'rgba(200,200,200,0.8)',
                                                    }
                                                }}
                                            >
                                                <IconX size="1rem" />
                                            </IconButton>
                                            <Box sx={{ p: 1 }}>
                                                <Typography variant="caption" noWrap>
                                                    Mobile {index + 1}
                                                </Typography>

                                                {/* Sequence Input */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={imageData.sequence || ''}
                                                    onChange={(e) => handleExistingMobileSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={imageData.url || ''}
                                                    onChange={(e) => handleExistingMobileUrlChange(index, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Alert severity="info">No mobile images yet</Alert>
                    )}
                </Grid>

                {/* Update Metadata Button */}
                {(desktopImages.length > 0 || mobileImages.length > 0) && (
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleUpdateMetadata}
                            disabled={loading}
                            sx={{ backgroundColor: '#2E2F7F', minWidth: '200px' }}
                        >
                            Update Sequence & URLs
                        </Button>
                    </Grid>
                )}

                {/* Add New Desktop Images */}
                <Grid item xs={12}>
                    <CustomFormLabel>Add New Desktop Images</CustomFormLabel>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Select new desktop images to add to the carousel
                    </Typography>

                    <input
                        ref={desktopFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewDesktopImageSelect}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => desktopFileInputRef.current?.click()}
                        disabled={loading}
                        startIcon={<IconUpload />}
                        sx={{ mb: 2 }}
                    >
                        Select Desktop Images
                    </Button>

                    {newDesktopImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                New Desktop Images to Add ({newDesktopImages.length})
                            </Typography>
                            <Grid container spacing={2}>
                                {newDesktopImages.map((image, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card sx={{ position: 'relative', height: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={image.preview}
                                                alt={`New Desktop ${index + 1}`}
                                                sx={{
                                                    objectFit: 'cover',
                                                    width: '100%'
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeNewDesktopImage(index)}
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
                                                <Typography variant="caption" noWrap title={image.name}>
                                                    {image.name}
                                                </Typography>

                                                {/* Sequence Input */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={image.sequence}
                                                    onChange={(e) => handleNewDesktopSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={image.url}
                                                    onChange={(e) => handleNewDesktopUrlChange(index, e.target.value)}
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

                {/* Add New Mobile Images */}
                <Grid item xs={12}>
                    <CustomFormLabel>Add New Mobile Images</CustomFormLabel>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Select new mobile images to add to the carousel
                    </Typography>

                    <input
                        ref={mobileFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewMobileImageSelect}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => mobileFileInputRef.current?.click()}
                        disabled={loading}
                        startIcon={<IconUpload />}
                        sx={{ mb: 2 }}
                    >
                        Select Mobile Images
                    </Button>

                    {newMobileImages.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                New Mobile Images to Add ({newMobileImages.length})
                            </Typography>
                            <Grid container spacing={2}>
                                {newMobileImages.map((image, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card sx={{ position: 'relative', height: '100%' }}>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={image.preview}
                                                alt={`New Mobile ${index + 1}`}
                                                sx={{
                                                    objectFit: 'cover',
                                                    width: '100%'
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeNewMobileImage(index)}
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
                                                <Typography variant="caption" noWrap title={image.name}>
                                                    {image.name}
                                                </Typography>

                                                {/* Sequence Input */}
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    label="Sequence"
                                                    value={image.sequence}
                                                    onChange={(e) => handleNewMobileSequenceChange(index, e.target.value)}
                                                    inputProps={{ min: '1' }}
                                                    fullWidth
                                                    sx={{ mt: 1 }}
                                                />

                                                {/* URL Input */}
                                                <TextField
                                                    type="text"
                                                    size="small"
                                                    label="URL"
                                                    placeholder="Enter redirect URL"
                                                    value={image.url}
                                                    onChange={(e) => handleNewMobileUrlChange(index, e.target.value)}
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

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={loading || (newDesktopImages.length === 0 && newMobileImages.length === 0)}
                        sx={{ mr: 2, backgroundColor: '#2E2F7F', minWidth: '150px' }}
                    >
                        {loading ? 'Updating...' : 'Add New Images'}
                    </Button>

                    {/* <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleReplaceAll}
                        disabled={loading || newDesktopImages.length === 0 || newMobileImages.length === 0}
                        sx={{ mr: 2, minWidth: '150px' }}
                    >
                        Replace All Images
                    </Button> */}

                    <Button
                        variant="outlined"
                        onClick={handleClearNewImages}
                        disabled={loading || (newDesktopImages.length === 0 && newMobileImages.length === 0)}
                        sx={{ mr: 2, minWidth: '150px' }}
                    >
                        Clear New Images
                    </Button>

                    {(desktopImages.length > 0 || mobileImages.length > 0) && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeleteEntireCarousel}
                            disabled={loading}
                            sx={{ minWidth: '150px' }}
                        >
                            Delete Entire Carousel
                        </Button>
                    )}
                </Grid>
            </Grid>

            {/* Messages */}
            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Backdrop open={loading}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" />
                    <Typography>Processing...</Typography>
                </Box>
            </Backdrop>
        </div>
    );
};

export default EditCarouselImages;