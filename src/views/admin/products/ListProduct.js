import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance';
import ListTable from './ListTable';
import { CustomizerContext } from '../../../context/CustomizerContext'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Products',
  },
];

const ListProduct = () => {
  const headCells = [
    {
      id: 'Actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions',
    },
    {
      id: 'Image',
      numeric: false,
      disablePadding: false,
      label: 'Image',
    },
    {
      id: 'sku',
      numeric: false,
      disablePadding: false,
      label: 'SKU',
    },
    {
      id: 'ProductName', // Corrected to match API response (capital P)
      numeric: false,
      disablePadding: false,
      label: 'Product Name',
    },
    {
      id: 'EachPrice', // Corrected to match API response (capital P)
      numeric: false,
      disablePadding: false,
      label: 'Each Price',
    },
    {
      id: 'ComparePrice', // Corrected to match API response (capital P)
      numeric: false,
      disablePadding: false,
      label: 'Compare Price',
    },
    {
      id: 'Type', // Corrected to match API response (capital P)
      numeric: false,
      disablePadding: false,
      label: 'Type',
    },
    {
      id: 'stockLevel',
      numeric: true,
      disablePadding: false,
      label: 'Stock Level',
    },
    {
      id: 'pricingGroup',
      numeric: false,
      disablePadding: false,
      label: 'Pricing Group',
    },
    {
      id: 'commerceCategoriesOne',
      numeric: false,
      disablePadding: false,
      label: 'Commerce Category One',
    },
    {
      id: 'commerceCategoriesTwo',
      numeric: false,
      disablePadding: false,
      label: 'Commerce Category Two',
    },
    {
      id: 'commerceCategoriesThree',
      numeric: false,
      disablePadding: false,
      label: 'Commerce Category Three',
    },
    {
      id: 'commerceCategoriesFour',
      numeric: false,
      disablePadding: false,
      label: 'Commerce Category Four',
    },
    {
      id: 'Badges',
      numeric: false,
      disablePadding: false,
      label: 'Badges',
    },

    {
      id: 'storeDescription',
      numeric: false,
      disablePadding: false,
      label: 'Store Description',
    },
    {
      id: 'pageTitle',
      numeric: false,
      disablePadding: false,
      label: 'Page Title',
    },
    {
      id: 'eachBarcodes',
      numeric: false,
      disablePadding: false,
      label: 'Each Barcodes',
    },
    {
      id: 'packBarcodes',
      numeric: false,
      disablePadding: false,
      label: 'Pack Barcodes',
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: 'Status',
    },
    {
      id: 'createdAt',
      numeric: false,
      disablePadding: false,
      label: 'Created Date',
    },

  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchProductsList = async () => {
    try {
      const response = await axiosInstance.get('/products/get-all-products-dashboard');

      if (response.data.statusCode === 200) {
        const productsData = response.data.data?.docs || response.data.data || response.data.products
          ;
        console.log("response products dashboard", response.data);

        // Filter out duplicates based on _id
        const getUniqueProducts = (products) => {
          if (!Array.isArray(products)) return [];

          const uniqueProducts = [];
          const seenIds = new Set();

          products.forEach(product => {
            if (product._id && !seenIds.has(product._id)) {
              seenIds.add(product._id);
              uniqueProducts.push(product);
            }
          });

          return uniqueProducts;
        };

        setTableData(getUniqueProducts(productsData));
      }

    } catch (error) {
      console.error('Error fetching products list:', error);
      setError(error.message);
    }
  };

  const { isCollapse } = React.useContext(CustomizerContext);

  React.useEffect(() => {
    fetchProductsList();
  }, []);

  return (
    <ProductProvider>
      <PageContainer title="Products List" description="this is Products List page">
        {/* breadcrumb */}
        <Breadcrumb title="Products List" items={BCrumb} />
        {/* end breadcrumb */}
        <Box
        // sx={{
        //     minWidth: isCollapse === "mini-sidebar" ? '120%' : '105%', // keep as number, not string
        //     marginLeft: isCollapse === "mini-sidebar" ? "-110px" : "-24px", // adjust values
        //     transition: "margin-left 0.3s ease", // smooth animation
        // }}
        >
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isProductsList={true}
            setTableData={setTableData}
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListProduct;