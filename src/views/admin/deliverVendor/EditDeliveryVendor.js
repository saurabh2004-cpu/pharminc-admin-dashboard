import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditDeliveryVendor = () => {
  const [formData, setFormData] = React.useState({
    vendorName: '',
    vendorTrackingUrl: 0,
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { id } = useParams()


  const handleSubmit = async () => {
    // Validation
    if (!formData.vendorName.trim()) {
      setError('Vendor name is required');
      return;
    }
    if (!formData.vendorTrackingUrl) {
      setError('Please enter a vendor tracking URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.put(`/delivery-vendor/update-delivery-vendor/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("update delivery vendor response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          vendorName: '',
          vendorTrackingUrl: '',
        });

        navigate('/dashboard/delivery-vendors/list');

      } else if (res.data.statusCode === 400) {
        console.log("update delivery vendor error:", res.data.message);
      }


    } catch (error) {
      console.error('update delivery vendor error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update delivery vendor');
    } finally {
      setLoading(false);
    }
  };


  const fetchDeliveryVendor = async () => {
    try {
      const response = await axiosInstance.get(`/delivery-vendor/get-delivery-vendor/${id}`);
      console.log("response delivery vendor details", response);
      if (response.data.statusCode === 200) {
        setFormData({
          vendorName: response.data.data.vendorName,
          vendorTrackingUrl: response.data.data.vendorTrackingUrl,
        });
      }

    } catch (error) {
      console.error('Fetch delivery vendor error:', error);
    }
  };

  useEffect(() => {
    fetchDeliveryVendor();
  }, [id]);

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Edit Deliver Vendor',
    },
  ];
  return (
    <div>
      <Breadcrumb title="Edit Deliver Vendor" items={BCrumb} />
      <Grid container spacing={2}>

        {/* Vendor Name */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="vendor-name" sx={{ mt: 2 }}>
            Vendor Name
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="vendor-name"
            fullWidth
            // disabled
            type="text"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            placeholder="Enter vendor name"
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel
            htmlFor="tax-name"
            sx={{ mt: 0 }}
          >
            Vendor Tracking Url
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="vendor-tracking-url"
            fullWidth
            value={formData.vendorTrackingUrl}
            onChange={(e) => setFormData({ ...formData, vendorTrackingUrl: e.target.value })}
            disabled={loading}
            placeholder="Enter vendor tracking URL"
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
            {loading ? 'Creating...' : 'Update Deliver Vendor'}
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
        </Grid>
      </Grid>
    </div>
  );
};

export default EditDeliveryVendor;