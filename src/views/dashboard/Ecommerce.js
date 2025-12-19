import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router';

import PageContainer from 'src/components/container/PageContainer';

import WeeklyStats from 'src/components/dashboards/modern/WeeklyStats';
import YearlySales from 'src/components/dashboards/ecommerce/YearlySales';
import PaymentGateways from 'src/components/dashboards/ecommerce/PaymentGateways';
import WelcomeCard from 'src/components/dashboards/ecommerce/WelcomeCard';
import Expence from 'src/components/dashboards/ecommerce/Expence';
import Growth from 'src/components/dashboards/ecommerce/Growth';
import RevenueUpdates from 'src/components/dashboards/ecommerce/RevenueUpdates';
import SalesOverview from 'src/components/dashboards/ecommerce/SalesOverview';
import SalesTwo from 'src/components/dashboards/ecommerce/SalesTwo';
import Sales from 'src/components/dashboards/ecommerce/Sales';
import MonthlyEarnings from 'src/components/dashboards/ecommerce/MonthlyEarnings';
import ProductPerformances from 'src/components/dashboards/ecommerce/ProductPerformances';
import RecentTransactions from 'src/components/dashboards/ecommerce/RecentTransactions';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../axios/axiosInstance';
import { login, salesRepLogin } from '../../store/authSlice';

const Ecommerce = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndNavigate = async () => {
      try {
        // First, try to fetch current admin
        const adminResponse = await axiosInstance.get('/admin/get-current-admin');
        
        // console.log('Admin response:', adminResponse);
        
        // Check the inner statusCode (not the HTTP status)
        if (adminResponse.data.statusCode === 200 && adminResponse.data.data) {
          const userData = adminResponse.data.data;
          dispatch(login(userData));
          // console.log("Current admin user logged in:", userData);
          
          // Navigate to admin dashboard if not already there
          if (window.location.pathname !== '/dashboards/ecommerce') {
            navigate('/dashboards/ecommerce');
          }
          return;
        } else {
          // Admin not authenticated, try sales rep
          // console.log('Admin not authenticated, checking for sales rep...');
          throw new Error('Admin not authenticated');
        }
      } catch (adminError) {
        // console.log('No admin user found, checking for sales rep...');
        
        try {
          // If admin fetch fails, try to fetch current sales rep
          const salesRepResponse = await axiosInstance.get('/sales-rep/get-current-sales-rep');
          
          // console.log('Sales rep response:', salesRepResponse);
          
          // Check the inner statusCode (not the HTTP status)
          if (salesRepResponse.data.statusCode === 200 && salesRepResponse.data.data) {
            const salesRepData = salesRepResponse.data.data;
            dispatch(salesRepLogin(salesRepData));
            // console.log("Current salesRep logged in:", salesRepData);
            
            // Navigate to sales rep dashboard
            navigate('/salesrep/dashboards/ecommerce');
            return;
          } else {
            // Sales rep not authenticated either
            // console.log('Sales rep not authenticated');
            throw new Error('Sales rep not authenticated');
          }
        } catch (salesRepError) {
          console.error('No sales rep found either:', salesRepError);
          // If both fail, redirect to login
          window.location.href = '/auth/login';
        }
      }
    };

    checkUserAndNavigate();
  }, [dispatch, navigate]);

  return (
    <PageContainer title="eCommerce Dashboard" description="this is eCommerce Dashboard page">
      <Grid container spacing={3}>
        {/* column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <WelcomeCard />
        </Grid>

        {/* column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid spacing={3} container columns={{ xs: 12, sm: 6 }}>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <Expence />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <Sales />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <RevenueUpdates />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <SalesOverview />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Grid container spacing={3} columns={{ xs: 12, sm: 6 }}>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <SalesTwo />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <Growth />
            </Grid>
            <Grid size={12}>
              <MonthlyEarnings />
            </Grid>
          </Grid>
        </Grid>
        {/* column */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <WeeklyStats />
        </Grid>
        {/* column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <YearlySales />
        </Grid>
        {/* column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <PaymentGateways />
        </Grid>
        {/* column */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <RecentTransactions />
        </Grid>
        {/* column */}

        <Grid size={{ xs: 12, lg: 8 }}>
          <ProductPerformances />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Ecommerce;