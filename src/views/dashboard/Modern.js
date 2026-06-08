import React from 'react';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';

import TopCards from '../../components/dashboards/modern/TopCards';
import RevenueUpdates from '../../components/dashboards/modern/RevenueUpdates';
import YearlyBreakup from '../../components/dashboards/modern/YearlyBreakup';
import MonthlyEarnings from '../../components/dashboards/modern/MonthlyEarnings';
import EmployeeSalary from '../../components/dashboards/modern/EmployeeSalary';
import Customers from '../../components/dashboards/modern/Customers';
import Projects from '../../components/dashboards/modern/Projects';
import Social from '../../components/dashboards/modern/Social';
import SellingProducts from '../../components/dashboards/modern/SellingProducts';
import WeeklyStats from '../../components/dashboards/modern/WeeklyStats';
import TopPerformers from '../../components/dashboards/modern/TopPerformers';
import Welcome from 'src/layouts/full/shared/welcome/Welcome';
import {useSelector} from 'react-redux';

const Modern = () => {

  const user = useSelector((state) => state.auth.userData);

  // console.log("user", user);
  return (
    <Box>
      <Grid container spacing={3}>
        {/* All dashboard widgets commented out to prevent API calls and show empty UI */}
        {/* <Grid size={12}>
          <TopCards />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueUpdates />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid spacing={3} container columns={{ xs: 12, sm: 6 }}>
            <Grid size={12}>
              <YearlyBreakup />
            </Grid>
            <Grid size={12}>
              <MonthlyEarnings />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <EmployeeSalary />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid spacing={3} container columns={{ xs: 12, sm: 6 }}>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <Customers />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 'grow' }}>
              <Projects />
            </Grid>
            <Grid size={12}>
              <Social />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SellingProducts />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <WeeklyStats />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <TopPerformers />
        </Grid> */}
      </Grid>
      <Welcome />
    </Box>
  );
};

export default Modern;
