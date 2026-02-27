import React from 'react';
import { Link } from 'react-router';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// components
import PageContainer from 'src/components/container/PageContainer';
import { ReactComponent as LogoLight } from 'src/assets/images/logos/point-austrelia-logo.svg';
import AuthLogin from '../authForms/AuthLogin';
import Logo from 'src/assets/images/logos/logo.png';

const Login2 = () => {
    return (
        <PageContainer title="Login" description="this is Login page">
            <Box
                sx={{
                    position: 'relative',
                    '&:before': {
                        content: '""',
                        background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
                        backgroundSize: '400% 400%',
                        animation: 'gradient 15s ease infinite',
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        opacity: '0.3',
                    },
                }}
            >
                <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
                    <Grid
                        size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '450px' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    mb: 3,
                                    textAlign: 'center'
                                }}
                            >
                                <img
                                    src={Logo}
                                    alt="logo"
                                    style={{
                                        height: 80,
                                        width: 'auto',
                                        objectFit: 'contain',
                                        display: 'block',
                                        margin: '0 auto'
                                    }}
                                />
                            </Box>

                            <AuthLogin

                            />
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
};

export default Login2;
