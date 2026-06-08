import React, { useState } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Paper, Grid } from '@mui/material';
import { IconUpload, IconFileSpreadsheet } from '@tabler/icons-react';
import { importKeywords } from '../../../services/keywordService';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/keywords/list', title: 'Keywords' },
    { title: 'Import CSV' },
];

const KeywordsImport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [stats, setStats] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a valid .csv file');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
            setStats(null);
            setSuccessMsg('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please choose a CSV file first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMsg('');
        setStats(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importKeywords(formData);
            const data = res.data?.data || res.data;
            
            setSuccessMsg('CSV file imported successfully!');
            setStats(data);
            setFile(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(msg || 'Failed to import CSV file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer title="Import Keywords" description="Upload CSV file with keywords to database">
            <Breadcrumb title="Import Keywords" items={BCrumb} />
            <Box mt={3}>
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item>
                            <Box sx={{ color: 'primary.main', mb: 1 }}>
                                <IconFileSpreadsheet size="4rem" />
                            </Box>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5" fontWeight="600" gutterBottom>
                                Upload CSV File
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                                Make sure your CSV file has a single column with the first row as the heading <strong>"keyword"</strong>.
                            </Typography>
                        </Grid>
                        
                        <Grid item>
                            <input
                                accept=".csv"
                                style={{ display: 'none' }}
                                id="csv-file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="csv-file-upload">
                                <Button variant="outlined" color="primary" component="span" startIcon={<IconUpload size="1.1rem" />}>
                                    Select CSV File
                                </Button>
                            </label>
                        </Grid>

                        {file && (
                            <Grid item>
                                <Typography variant="subtitle2" color="textPrimary" fontWeight="600">
                                    Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
                                </Typography>
                            </Grid>
                        )}

                        <Grid item mt={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpload}
                                disabled={!file || loading}
                                sx={{ minWidth: 150 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Import Keywords'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {stats && (
                    <Paper variant="outlined" sx={{ p: 3, mt: 3, borderColor: 'success.light', backgroundColor: '#fafffa' }}>
                        <Typography variant="h6" color="success.main" fontWeight="600" gutterBottom>
                            Import Summary
                        </Typography>
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Total Rows Processed</Typography>
                                <Typography variant="h5" fontWeight="700">{stats.totalRowsProcessed || 0}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">New Keywords Inserted</Typography>
                                <Typography variant="h5" fontWeight="700" color="primary.main">{stats.insertedCount || 0}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Existing Keywords Matched</Typography>
                                <Typography variant="h5" fontWeight="700">{stats.matchedCount || 0}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {error && (
                    <Box mt={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {successMsg && (
                    <Box mt={3}>
                        <Alert severity="success">{successMsg}</Alert>
                    </Box>
                )}
            </Box>
        </PageContainer>
    );
};

export default KeywordsImport;
