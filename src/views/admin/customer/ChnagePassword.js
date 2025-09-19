'use client';
import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const ChnagePassword = () => {
  const [formData, setFormData] = React.useState({
    newPassword: '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { email } = useParams();


  const handleSubmit = async () => {
    // Validation
    if (!formData.newPassword) {
      setError('Please Enter new password');
      return;
    }


    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.patch(`/admin/chnage-user-password/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Create subcategory response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          newPassword: '',
        });

        navigate('/dashboard/customers/list');

      } else if (res.data.statusCode === 400) {
        console.log("Failed to update password", res.data.message);
      }


    } catch (error) {
      console.error('Change password error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };


  const handleSendMail = async () => {

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('http://localhost:3000/api/v1/admin/send-password-email', {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("email sent to user:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/customers/list');

      } else if (res.data.statusCode === 400) {
        console.log("Failed to send email", res.data.message);
        setError(res.data.message);
      }

    } catch (error) {
      console.error('Change password error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Grid container spacing={2}>

        {/* mew password */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="category-slug" sx={{ mt: 2 }}>
            New Password
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="category-slug"
            fullWidth
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Enter Password"
          />
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={12} mt={2}>
            <div
              style={{
                color: 'red',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #ffcdd2'
              }}
            >
              {error}
            </div>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setFormData({ name: '', slug: '', brand: '' });
              setError('');
            }}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleSendMail()}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Send Mail
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default ChnagePassword;