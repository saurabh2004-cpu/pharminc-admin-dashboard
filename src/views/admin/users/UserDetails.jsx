import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Snackbar
} from '@mui/material';
import { IconCamera } from '@tabler/icons-react';
import { useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { getUserById, uploadUserImages } from '../../../services/userService';
import { getApplicationsByUserId } from '../../../services/applicationService';
import { format } from 'date-fns';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/users/list', title: 'Users' },
    { title: 'User Details' },
];

function stringToColor(string) {
    if (!string) return '#10163A';
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name) {
    if (!name) return { children: 'U', bgcolor: '#10163A' };
    const splitName = name.split(' ').filter(Boolean);
    const firstLetter = splitName[0]?.[0] || '';
    const secondLetter = splitName[1]?.[0] || '';
    return {
        bgcolor: stringToColor(name),
        children: `${firstLetter}${secondLetter}`.toUpperCase(),
    };
}

// Reusable component for displaying field rows
const FieldRow = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5} borderBottom="1px solid rgba(0,0,0,0.05)">
            <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
            <Typography variant="body1" fontWeight="500" textAlign="right">{value}</Typography>
        </Box>
    );
};

const UserDetails = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Applications State
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState(null);

    // Image Upload State
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Handle Image Upload
    const handleImageUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        setImageUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append(type === 'cover' ? 'coverImage' : 'profileImage', file);
        formData.append('userId', id);

        try {
            const response = await uploadUserImages(formData);
            if (response.data) {
                setUser((prev) => ({
                    ...prev,
                    profile_picture: response.data.profileImage || prev.profile_picture,
                    banner_picture: response.data.coverImage || prev.banner_picture
                }));
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to upload image";
            setUploadError(errorMessage);
            setOpenSnackbar(true);
        } finally {
            setImageUploading(false);
            // Reset input
            event.target.value = null;
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserById(id);
                if (response.data) {
                    setUser(response.data);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.response?.data?.error || err.message || "Failed to load user details");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    // Fetch Applications Independently
    useEffect(() => {
        const fetchApplications = async () => {
            setApplicationsLoading(true);
            try {
                const response = await getApplicationsByUserId(id);
                // Depending on API response structure, usually it's in response.data or response.data.applications
                const data = response.data?.applications || response.data?.data || response.data || [];
                setApplications(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching applications:", err);
                setApplicationsError(err.response?.data?.error || err.message || "Failed to load applications");
            } finally {
                setApplicationsLoading(false);
            }
        };
        if (id) {
            fetchApplications();
        }
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !user) {
        return (
            <PageContainer title="User Details" description="View user profile">
                <Breadcrumb title="User Details" items={BCrumb} />
                <Alert severity="error">{error || "User not found"}</Alert>
            </PageContainer>
        );
    }

    const fallbackProps = !user.profile_picture ? stringAvatar(`${user.firstName || ''} ${user.lastName || ''}`.trim()) : {};

    return (
        <PageContainer title="User Details" description="View user profile">
            <Breadcrumb title="User Details" items={BCrumb} />

            {/* TOP SECTION: Cover & Profile Avatar */}
            <Card sx={{ padding: 0, mb: 3, overflow: 'visible' }}>
                <Box sx={{
                    height: '220px',
                    background: user.banner_picture ? `url(${user.banner_picture})` : 'linear-gradient(135deg, #10163A 0%, #3e4e9b 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}>
                    {/* Cover Image Upload Button */}
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="cover-image-upload"
                            type="file"
                            onChange={(e) => handleImageUpload(e, 'cover')}
                            disabled={imageUploading}
                        />
                        <label htmlFor="cover-image-upload">
                            <IconButton
                                component="span"
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': { backgroundColor: 'white' },
                                    boxShadow: 1
                                }}
                                disabled={imageUploading}
                            >
                                {imageUploading ? <CircularProgress size={24} /> : <IconCamera size="1.2rem" color="#10163A" />}
                            </IconButton>
                        </label>
                    </Box>

                    <Box sx={{
                        position: 'absolute',
                        bottom: '-65px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={user.profile_picture || undefined}
                                alt={user.firstName}
                                sx={{
                                    width: 130,
                                    height: 130,
                                    border: '4px solid white',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: fallbackProps.bgcolor || 'white',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}
                            >
                                {fallbackProps.children}
                            </Avatar>

                            {/* Profile Image Upload Button */}
                            <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="profile-image-upload"
                                    type="file"
                                    onChange={(e) => handleImageUpload(e, 'profile')}
                                    disabled={imageUploading}
                                />
                                <label htmlFor="profile-image-upload">
                                    <IconButton
                                        component="span"
                                        size="small"
                                        sx={{
                                            backgroundColor: 'white',
                                            '&:hover': { backgroundColor: '#f0f0f0' },
                                            boxShadow: 2,
                                            border: '2px solid white'
                                        }}
                                        disabled={imageUploading}
                                    >
                                        {imageUploading ? <CircularProgress size={16} /> : <IconCamera size="1rem" color="#10163A" />}
                                    </IconButton>
                                </label>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <CardContent sx={{ pt: 10, pb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="700" gutterBottom>
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}
                    </Typography>

                    {user.headline && (
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
                            {user.headline}
                        </Typography>
                    )}

                    <Box display="flex" justifyContent="center" gap={2} mt={2}>
                        <Chip
                            label={user.role || 'USER'}
                            color="primary"
                            variant="outlined"
                        />
                        {/* Verify Badge: Only show if verified is strictly false */}
                        {user.verified === false && (
                            <Chip
                                size="small"
                                color="warning"
                                label="Unverified"
                            />
                        )}
                        {user.verified === true && (
                            <Chip
                                size="small"
                                color="success"
                                label="Verified"
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* MAIN CONTENT LAYOUT */}
            <Grid container spacing={3}>

                {/* LEFT SECTION: Professional Details */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Professional Details
                            </Typography>

                            <Box display="flex" flexDirection="column">
                                <FieldRow label="Experience" value={user.experience ? `${user.experience} Years` : null} />
                                <FieldRow label="Specialization" value={user.specialization} />
                                <FieldRow label="Speciality" value={user.speciality} />
                                <FieldRow label="Sub-Speciality" value={user.subSpeciality} />
                            </Box>

                            {/* Professional info fallback if all are empty */}
                            {(!user.experience && !user.specialization && !user.speciality && !user.subSpeciality) && (
                                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                    No professional details provided.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* RIGHT SECTION: Basic & Academic Info */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Personal Info
                            </Typography>

                            <Box display="flex" flexDirection="column">
                                <FieldRow label="Email" value={user.email} />
                                <FieldRow label="Gender" value={user.gender} />
                                <FieldRow label="Location" value={user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city} />
                                <FieldRow label="Degree" value={user.degree} />
                                <FieldRow label="University" value={user.university} />
                                <FieldRow label="Year Of Study" value={user.yearOfStudy} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* BELOW SECTIONS */}
            <Grid container spacing={3} mt={0}>

                {user.about && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={2}>About</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                                    {user.about}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {user.skills && user.skills.length > 0 && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={2}>Skills</Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {user.skills.map((skill, index) => (
                                        <Chip key={index} label={skill} variant="filled" sx={{ borderRadius: '8px', px: 1 }} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {user.userLinks && user.userLinks.length > 0 && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={2}>Links</Typography>
                                <Box display="flex" flexDirection="column" gap={1}>
                                    {user.userLinks.map((linkObj, index) => (
                                        linkObj.links && linkObj.links.map((linkStr, i) => (
                                            <Typography key={`${index}-${i}`} variant="body1">
                                                <a href={linkStr} target="_blank" rel="noopener noreferrer" style={{ color: '#10163A', textDecoration: 'none', fontWeight: '500' }}>
                                                    {linkStr}
                                                </a>
                                            </Typography>
                                        ))
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Education and Experience history (if provided from backend relations) */}
                {user.userEducations && user.userEducations.length > 0 && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={3}>Education History</Typography>
                                {user.userEducations.map((edu, idx) => (
                                    <Box key={idx} mb={idx === user.userEducations.length - 1 ? 0 : 3}>
                                        <Typography variant="h6" fontWeight="600">{edu.instituteName}</Typography>
                                        <Typography variant="body1" color="textSecondary">{edu.degree}</Typography>
                                        <Typography variant="body2" color="textSecondary" mt={0.5}>
                                            {new Date(edu.startDate).getFullYear()} - {edu.isCurrentJob ? 'Present' : new Date(edu.endDate).getFullYear()}
                                        </Typography>
                                        {idx !== user.userEducations.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {user.userExperiences && user.userExperiences.length > 0 && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={3}>Experience History</Typography>
                                {user.userExperiences.map((exp, idx) => (
                                    <Box key={idx} mb={idx === user.userExperiences.length - 1 ? 0 : 3}>
                                        <Typography variant="h6" fontWeight="600">{exp.role}</Typography>
                                        <Typography variant="body1" color="textSecondary" fontWeight="500">{exp.organizationName}</Typography>
                                        <Typography variant="body2" color="textSecondary" mt={0.5}>
                                            {new Date(exp.startDate).getFullYear()} - {exp.isCurrentJob ? 'Present' : new Date(exp.endDate).getFullYear()} | {exp.locationType}
                                        </Typography>
                                        {exp.description && (
                                            <Typography variant="body2" mt={1} sx={{ whiteSpace: 'pre-line' }}>{exp.description}</Typography>
                                        )}
                                        {idx !== user.userExperiences.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                )}

            </Grid>

            {/* APPLICATIONS SECTION */}
            <Box mt={4}>
                <Typography variant="h5" fontWeight="600" mb={3}>
                    Jobs Applied By User
                </Typography>

                <Card>
                    <CardContent>
                        {applicationsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : applicationsError ? (
                            <Alert severity="error">{applicationsError}</Alert>
                        ) : applications && applications.length > 0 ? (
                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Table sx={{ minWidth: 650 }} aria-label="applications table">
                                    <TableHead sx={{ backgroundColor: '#f0f8ff' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Salary</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Institute Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Application Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Job Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Job Role</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {applications.map((app, index) => (
                                            <TableRow key={app.id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="500">
                                                        {app.job?.title || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {app.job?.salaryMin && app.job?.salaryMax ? (
                                                        <Typography variant="body2">
                                                            {app.job.salaryCurrency || '$'} {app.job.salaryMin} - {app.job.salaryMax}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">Not specified</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {app.job?.institute?.name || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={app.status || 'Pending'}
                                                        color={
                                                            app.status === 'accepted' ? 'success' :
                                                                app.status === 'rejected' ? 'error' :
                                                                    app.status === 'shortlisted' ? 'info' : 'warning'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {app.created_at ? format(new Date(app.created_at), 'MMM dd, yyyy') : 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {app.job?.jobType || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {app.job?.role || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box display="flex" justifyContent="center" py={4}>
                                <Typography variant="body1" color="textSecondary">
                                    No Applications Found
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {uploadError}
                </Alert>
            </Snackbar>

        </PageContainer>
    );
};

export default UserDetails;