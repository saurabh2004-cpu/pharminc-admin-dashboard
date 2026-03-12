import React, { useEffect, useState } from 'react';
import { Box, CardContent, Typography } from '@mui/material';
import { Grid } from '@mui/material';

import icon1 from '../../../assets/images/svgs/icon-connect.svg';
import icon2 from '../../../assets/images/svgs/icon-user-male.svg';
import icon3 from '../../../assets/images/svgs/588hospital_100778.svg';
import icon4 from '../../../assets/images/svgs/icon-briefcase.svg';
import icon5 from '../../../assets/images/svgs/resume_business_cv_work_job_curriculum_icon_175611.svg';
import { getStats } from '../../../services/adminService';





const TopCards = () => {

  const [stats, setStats] = useState([])

  const fetchStats = async () => {
    try {
      const stats = await getStats()
      if (stats.data) {
        setStats(stats.data)
      }
    } catch (error) {
      throw error
    }
  }


  useEffect(() => {
    fetchStats()
  }, [])



  const topcards = [
    {
      icon: icon2,
      title: 'Users',
      digits: `${stats.usersCount || 0}`,
      bgcolor: 'primary',
    },
    {
      icon: icon3,
      title: 'Institutes',
      digits: `${stats.institutesCount || 0}`,
      bgcolor: 'warning',
    },
    {
      icon: icon4,
      title: 'Jobs',
      digits: `${stats.jobsCount || 0}`,
      bgcolor: 'secondary',
    },
    {
      icon: icon5,
      title: 'Applications',
      digits: `${stats.applicationsCount || 0}`,
      bgcolor: 'error',
    },
    // {
    //   icon: icon6,
    //   title: 'Payroll',
    //   digits: '$96k',
    //   bgcolor: 'success',
    // },
    // {
    //   icon: icon1,
    //   title: 'Reports',
    //   digits: '59',
    //   bgcolor: 'info',
    // },
  ];


  return (
    <Grid container spacing={3}>
      {topcards.map((topcard, i) => (
        <Grid size={{ xs: 12, sm: 4, lg: 2 }} key={i}>
          <Box bgcolor={topcard.bgcolor + '.light'} textAlign="center">
            <CardContent>
              <img src={topcard.icon} alt={topcard.icon} width="50" />
              <Typography
                color={topcard.bgcolor + '.main'}
                mt={1}
                variant="subtitle1"
                fontWeight={600}
              >
                {topcard.title}
              </Typography>
              <Typography color={topcard.bgcolor + '.main'} variant="h4" fontWeight={600}>
                {topcard.digits}
              </Typography>
            </CardContent>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;
