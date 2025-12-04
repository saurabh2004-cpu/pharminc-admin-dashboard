import React, { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import Loadable from '../layouts/full/shared/loadable/Loadable';
// import { Create } from '@mui/icons-material';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const SalesRepFullLayout = Loadable(lazy(() => import('../layouts/full/SalesRepFullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
// const ModernDash = Loadable(lazy(() => import('../views/dashboard/Modern')));
const EcommerceDash = Loadable(lazy(() => import('../views/dashboard/Ecommerce')));
const SalesRepDashboard = Loadable(lazy(() => import('../views/dashboard/SalesRep')));



// authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login2')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register2')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

//my imports
const CreateBrand = Loadable(lazy(() => import('../views/admin/brand/CreateBrand')));
const BrandsList = Loadable(lazy(() => import('../views/admin/brand/BrandsList')));
const EditBrand = Loadable(lazy(() => import('../views/admin/brand/EditBrand')));
const CreateCategory = Loadable(lazy(() => import('../views/admin/category/CreateCategory')));
const CategoriesList = Loadable(lazy(() => import('../views/admin/category/CategoriesList')));
const EditCategory = Loadable(lazy(() => import('../views/admin/category/EditCategory')));
const CreateSubCategory = Loadable(lazy(() => import('../views/admin/subcategory/CreateSubCategory')));
const SubCategoryList = Loadable(lazy(() => import('../views/admin/subcategory/SubCategoryList')));
const EditSubCategory = Loadable(lazy(() => import('../views/admin/subcategory/EditSubCategory')));
const CreateBadge = Loadable(lazy(() => import('../views/admin/badge/CreateBadge')));
const BadgeList = Loadable(lazy(() => import('../views/admin/badge/BadgeList')));
const EditBadge = Loadable(lazy(() => import('../views/admin/badge/EditBadge')));
const ListPricingGroups = Loadable(lazy(() => import('../views/admin/pricingGroups/ListPricingGroups')));
const CreatePricingGroups = Loadable(lazy(() => import('../views/admin/pricingGroups/CreatePricingGroups')));
const EditPricingGroups = Loadable(lazy(() => import('../views/admin/pricingGroups/EditPricingGroups')));

const CreatePricingGroupsDiscounts = Loadable(lazy(() => import('../views/admin/pricingGroupsDiscounts/CreatePricingGroupsDiscounts')));
const ListPricingGroupsDiscounts = Loadable(lazy(() => import('../views/admin/pricingGroupsDiscounts/ListPricingGroupsDiscounts')));
const EditPricingGroupsDiscounts = Loadable(lazy(() => import('../views/admin/pricingGroupsDiscounts/EditPricingGroupsDiscounts')));

const CreateTax = Loadable(lazy(() => import('../views/admin/tax/CreateTax')));
const ListTax = Loadable(lazy(() => import('../views/admin/tax/ListTax')));
const EditTax = Loadable(lazy(() => import('../views/admin/tax/EditTax')));
const CreateDeliverVendor = Loadable(lazy(() => import('../views/admin/deliverVendor/CreateDeliverVendor')));
const ListDeliveryVendor = Loadable(lazy(() => import('../views/admin/deliverVendor/ListDeliveryVendor')));
const EditDeliveryVendor = Loadable(lazy(() => import('../views/admin/deliverVendor/EditDeliveryVendor')));
const CreatePackTypes = Loadable(lazy(() => import('../views/admin/packTypes/CreatePackTypes')));
const ListPackTypes = Loadable(lazy(() => import('../views/admin/packTypes/ListPackTypes')));
const EditPackTypes = Loadable(lazy(() => import('../views/admin/packTypes/EditPackTypes')));
const CreateProduct = Loadable(lazy(() => import('../views/admin/products/CreateProduct')));
const ListProduct = Loadable(lazy(() => import('../views/admin/products/ListProduct')));
const EditProduct = Loadable(lazy(() => import('../views/admin/products/EditProduct')));
const CreateSalesOrders = Loadable(lazy(() => import('../views/admin/salesOrders/CreateSalesOrders')));
const ListSalesOrders = Loadable(lazy(() => import('../views/admin/salesOrders/ListSalesOrders')));
const EditSalesOrder = Loadable(lazy(() => import('../views/admin/salesOrders/EditSalesOrder')));
const CreateCustomer = Loadable(lazy(() => import('../views/admin/customer/CreateCustomer')));
const ListCustomers = Loadable(lazy(() => import('../views/admin/customer/ListCustomers')));
const EditCustomer = Loadable(lazy(() => import('../views/admin/customer/EditCustomers')));
const ChnagePassword = Loadable(lazy(() => import('../views/admin/customer/ChnagePassword')));
const CreateGroupsDiscounts = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/CreateGroupsDiscounts')));
const ListGroupsDiscounts = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/ListGroupsDiscounts')));
const EditGroupsDiscounts = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/EditGroupsDiscounts')));
const EditCustomersPercentage = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/EditCustomersPercentage')));

const ListNetTerms = Loadable(lazy(() => import('../views/admin/netTerms/ListNetTerms')));

const CreateAdmin = Loadable(lazy(() => import('../views/admin/addAdmin/CreateAdmin')));
const ListAdmins = Loadable(lazy(() => import('../views/admin/addAdmin/ListAdmins')));
const EditAdmin = Loadable(lazy(() => import('../views/admin/addAdmin/EditAdmin')));


const PendingApprovalCustomers = Loadable(lazy(() => import('../views/admin/customer/PendingApprovalCustomers')));

const CreateSubCategoryTwo = Loadable(lazy(() => import('../views/admin/subCategoryTwo/CreateSubCategoryTwo')));
const SubCategoryTwoList = Loadable(lazy(() => import('../views/admin/subCategoryTwo/SubCategoryTwoList')));
const EditSubCategoryTwo = Loadable(lazy(() => import('../views/admin/subCategoryTwo/EditSubCategoryTwo')));

const CustomersByPricingGroups = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/CustomersByPricingGroups')))

const CustomersItemsBasedDiscounts = Loadable(lazy(() => import('../views/admin/pricingGroupsDiscounts/CustomersItemsBasedDiscounts')))
const CustomersSalesOrders = Loadable(lazy(() => import('../views/admin/salesOrders/CustomersSalesOrders')))
const SalesOrderProductsList = Loadable(lazy(() => import('../views/admin/salesOrders/SalesOrderProductsList')))
const Reset = Loadable(lazy(() => import('../views/admin/ResetPassword/Reset')));

const CustomersList = Loadable(lazy(() => import('../views/admin/AbandonedCart/CustomersList')));
const CustomersCartItems = Loadable(lazy(() => import('../views/admin/AbandonedCart/CustomersCartItems')));

const CreateCustomerSpecificAmounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/CreateCustomerSpecificAmounts')));
const ListCustomerSpecificAmounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/ListCustomerSpecificAmounts')));
const CustomerList = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/CustomerList')));
const EditCustomerSpecificDiscounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/EditCustomerSpecificDiscounts')));
const BrandPagesListDetails = Loadable(lazy(() => import('../views/admin/brand/BrandPagesListDetails')));
const CreateBrandPage = Loadable(lazy(() => import('../views/admin/brand/CreateBrandPage')));
const EditBrandPage = Loadable(lazy(() => import('../views/admin/brand/EditBrandPage')));
const CreateBulkDiscounts = Loadable(lazy(() => import('../views/admin/bulkDiscounts/CreateBulkDiscounts')));
const BulkDiscountsList = Loadable(lazy(() => import('../views/admin/bulkDiscounts/BulkDiscountsList')));
const EditBulkDiscounts = Loadable(lazy(() => import('../views/admin/bulkDiscounts/EditBulkDiscounts')));
const BulkDiscountsCustomersList = Loadable(lazy(() => import('../views/admin/bulkDiscounts/BulkDiscountsCustomersList')));
const CreateSalesRep = Loadable(lazy(() => import('../views/admin/salesRep/CreateSalesRep')));
const ListSalesRep = Loadable(lazy(() => import('../views/admin/salesRep/ListSalesRep')));
const EditSalesRep = Loadable(lazy(() => import('../views/admin/salesRep/EditSalesRep')));
const SalesRepCustomersList = Loadable(lazy(() => import('../views/admin/salesRep/SalesRepCustomersList')));

const SalesRepLogin2 = Loadable(lazy(() => import('../views/authentication/auth2/SalesRepLogin2')));
const SalesRepCustomers = Loadable(lazy(() => import('../views/salesRep/customers/CustomersList')));

const CreateProductGroup = Loadable(lazy(() => import('../views/admin/productGroup/CreateProductGroup')));
const ListProductGroup = Loadable(lazy(() => import('../views/admin/productGroup/ListProductGroup')));
const ListProductGroupProducts = Loadable(lazy(() => import('../views/admin/productGroup/ListGroupsProducts')));
const EditProductGroups = Loadable(lazy(() => import('../views/admin/productGroup/EditProductGroups')));

const CreateMetaData = Loadable(lazy(() => import('../views/admin/metaData/CreateMetaData')));
const ListMetaData = Loadable(lazy(() => import('../views/admin/metaData/ListMetaData')));
const EditMetaData = Loadable(lazy(() => import('../views/admin/metaData/EditMetaData')));

const ListContactUsData = Loadable(lazy(() => import('../views/admin/contactUsData/ListContactUsData')));

const AdminEmails = Loadable(lazy(() => import('../views/admin/adminEmailsManager/AdminEmails')));

const CreateCarouselImages = Loadable(lazy(() => import('../views/admin/homeCarousel/CreateCarouselImages')));
const EditCarouselImages = Loadable(lazy(() => import('../views/admin/homeCarousel/EditCarouselImages')));

const CreateNetTermnsList = Loadable(lazy(() => import('../views/admin/netTernsList/CreateNetTermnsList')));
const EditNetTermsList = Loadable(lazy(() => import('../views/admin/netTernsList/EditNetTermsList')));
const ListNetTermsData = Loadable(lazy(() => import('../views/admin/netTernsList/ListNetTermsData')));

const Router = [

  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboards/ecommerce" /> },
      // { path: '/dashboards/modern', exact: true, element: <ModernDash /> },
      { path: '/dashboards/ecommerce', exact: true, element: <EcommerceDash /> },


      { path: '*', element: <Navigate to="/auth/404" /> },


      // my routes


      { path: '/dashboard/Brand', element: <EcommerceDash /> },
      { path: '/dashboard/Brand/create', element: <CreateBrand /> },
      { path: '/dashboard/brands/list', element: <BrandsList /> },
      { path: '/dashboard/brand/edit/:id', element: <EditBrand /> },
      { path: '/dashboard/brand-page/create', element: <CreateBrandPage /> },
      { path: '/dashboard/brand-pages/List', element: <BrandPagesListDetails /> },
      { path: '/dashboard/brand-page/edit/:id', element: <EditBrandPage /> },

      { path: '/dashboard/category/create', element: <CreateCategory /> },
      { path: '/dashboard/category/list', element: <CategoriesList /> },
      { path: '/dashboard/category/edit/:id', element: <EditCategory /> },

      { path: '/dashboard/sub-category/create', element: <CreateSubCategory /> },
      { path: '/dashboard/sub-category/list', element: <SubCategoryList /> },
      { path: '/dashboard/subcategory/edit/:id', element: <EditSubCategory /> },

      { path: '/dashboard/badge/create', element: <CreateBadge /> },
      { path: '/dashboard/badge/list', element: <BadgeList /> },
      { path: '/dashboard/badge/edit/:id', element: <EditBadge /> },

      { path: '/dashboard/pricing-groups/create', element: <CreatePricingGroups /> },
      { path: '/dashboard/pricing-groups/list', element: <ListPricingGroups /> },
      { path: '/dashboard/pricing-groups/edit/:id', element: <EditPricingGroups /> },


      { path: '/dashboard/groups-discounts/create', element: <CreateGroupsDiscounts /> },
      { path: '/dashboard/groups-discounts/list', element: <ListGroupsDiscounts /> },
      { path: '/dashboard/groups-discounts/edit/:id', element: <EditGroupsDiscounts /> },
      { path: '/dashboard/groups-discount/customers/:pricingGroupId', element: <CustomersByPricingGroups /> },
      { path: '/dashboard/edit-customers-percentage/:customerId/:pricingGroupDiscountId/:discountId', element: <EditCustomersPercentage /> },



      { path: '/dashboard/items-based-discounts/create', element: <CreatePricingGroupsDiscounts /> },
      { path: '/dashboard/items-based-discounts/list', element: <ListPricingGroupsDiscounts /> },
      { path: '/dashboard/items-based-discounts/edit/:id', element: <EditPricingGroupsDiscounts /> },
      { path: '/dashboard/customers-items-based-discounts/:id', element: <CustomersItemsBasedDiscounts /> },


      { path: '/dashboard/tax/create', element: <CreateTax /> },
      { path: '/dashboard/tax/list', element: <ListTax /> },
      { path: '/dashboard/tax/edit/:id', element: <EditTax /> },

      { path: '/dashboard/delivery-vendors/create', element: <CreateDeliverVendor /> },
      { path: '/dashboard/delivery-vendors/list', element: <ListDeliveryVendor /> },
      { path: '/dashboard/delivery-vendors/edit/:id', element: <EditDeliveryVendor /> },

      { path: '/dashboard/pack-types/create', element: <CreatePackTypes /> },
      { path: '/dashboard/pack-types/list', element: <ListPackTypes /> },
      { path: '/dashboard/pack-types/edit/:id', element: <EditPackTypes /> },

      { path: '/dashboard/products/create', element: <CreateProduct /> },
      { path: '/dashboard/products/list', element: <ListProduct /> },
      { path: '/dashboard/products/edit/:id', element: <EditProduct /> },

      { path: '/dashboard/sales-order/create', element: <CreateSalesOrders /> },
      { path: '/dashboard/sales-orders/list', element: <ListSalesOrders /> },
      { path: '/dashboard/sales-order/edit/:id', element: <EditSalesOrder /> },
      { path: '/dashboard/sales-order-by-customer/:id', element: <CustomersSalesOrders /> },
      { path: '/dashboard/sales-order-product-list/:documentNo', element: <SalesOrderProductsList /> },

      { path: '/dashboard/customers/create', element: <CreateCustomer /> },
      { path: '/dashboard/customers/list', element: <ListCustomers /> },
      { path: '/dashboard/customers/edit/:id', element: <EditCustomer /> },
      { path: '/dashboard/customers/change-password/:id/:email', element: <ChnagePassword /> },
      { path: '/dashboard/customers/PendingCustomers', element: <PendingApprovalCustomers /> },


      { path: '/dashboard/NetTerms/List', element: <ListNetTerms /> },

      { path: '/dashboard/CreateAdmin', element: <CreateAdmin /> },
      { path: '/dashboard/admin/list', element: <ListAdmins /> },
      { path: '/dashboard/admin/Edit/:id', element: <EditAdmin /> },

      { path: '/dashboard/sub-category-two/create', element: <CreateSubCategoryTwo /> },
      { path: '/dashboard/sub-category-two/list', element: <SubCategoryTwoList /> },
      { path: '/dashboard/sub-category-two/edit/:id', element: <EditSubCategoryTwo /> },


      { path: '/dashboard/abandoned-carts/customers', element: <CustomersList /> },
      { path: '/dashboard/abandoned-cart-items/list/:customerId', element: <CustomersCartItems /> },


      { path: '/dashboard/customer-specific-amounts/create', element: <CreateCustomerSpecificAmounts /> },
      { path: '/dashboard/customer-specific-amounts/list', element: <ListCustomerSpecificAmounts /> },
      { path: '/dashboard/customer-specific-amounts/customers-list/:id', element: <CustomerList /> },
      { path: '/dashboard/customer-specific-amounts/edit/:id', element: <EditCustomerSpecificDiscounts /> },

      { path: '/dashboard/bulk-discounts/create', element: <CreateBulkDiscounts /> },
      { path: '/dashboard/bulk-discounts/list', element: <BulkDiscountsList /> },
      { path: '/dashboard/bulk-discounts/edit/:id', element: <EditBulkDiscounts /> },
      { path: '/dashboard/bulk-discounts/customers/:id', element: <BulkDiscountsCustomersList /> },

      { path: '/dashboard/SalesRep/create', element: <CreateSalesRep /> },
      { path: '/dashboard/SalesRep/list', element: <ListSalesRep /> },
      { path: '/dashboard/SalesRep/customers/:id', element: <SalesRepCustomersList /> },
      { path: '/dashboard/SalesRep/edit/:id', element: <EditSalesRep /> },

      { path: '/dashboard/productGroup/create', element: <CreateProductGroup /> },
      { path: '/dashboard/productGroup/list', element: <ListProductGroup /> },
      { path: '/dashboard/productGroup/products/:id', element: <ListProductGroupProducts /> },
      { path: '/dashboard/productGroup/edit/:id', element: <EditProductGroups /> },

      { path: '/dashboard/meta-data/create', element: <CreateMetaData /> },
      { path: '/dashboard/meta-data/List', element: <ListMetaData /> },
      { path: '/dashboard/meta-data/Edit/:id', element: <EditMetaData /> },

      { path: '/dashboard/contact-us-data/List', element: <ListContactUsData /> },

      { path: '/dashboard/admin/emails', element: <AdminEmails /> },

      { path: '/dashboard/home-page-carousel/Create', element: <CreateCarouselImages /> },
      { path: '/dashboard/home-page-carousel/Edit', element: <EditCarouselImages /> },

      { path: '/dashboard/net-terms-list/create', element: <CreateNetTermnsList /> },
      { path: '/dashboard/net-terms-list/edit/:id', element: <EditNetTermsList /> },
      { path: '/dashboard/net-terms-list', element: <ListNetTermsData /> },


    ],
  },

  //salre rep routes
  {
    path: '/',
    element: <SalesRepFullLayout />,
    children: [
      { path: '/salesrep/dashboard', element: <Navigate to="/salesrep/dashboard/ecommerce" /> },

      { path: '/salesrep/dashboards/ecommerce', exact: true, element: <SalesRepDashboard /> },

      { path: '*', element: <Navigate to="/auth/404" /> },

      { path: '/salesrep/dashboards/customers/list', element: <SalesRepCustomers /> },

      { path: '/salesrep/dashboards/customer/salesOrders/:customerName', element: <CustomersSalesOrders /> },


    ],
  },


  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      { path: '/auth/login', element: <Login2 /> },
      // { path: '/auth/register', element: <Register2 /> },
      { path: '/reset-password', element: <Reset /> },

      { path: '/salas-rep/login', element: <SalesRepLogin2 /> },



      // { path: '/auth/forgot-password', element: <ForgotPassword /> },
      // { path: '/auth/forgot-password2', element: <ForgotPassword2 /> },
      // { path: '/auth/two-steps', element: <TwoSteps /> },
      // { path: '/auth/two-steps2', element: <TwoSteps2 /> },
      // { path: '/auth/maintenance', element: <Maintenance /> },
      // { path: '/landingpage', element: <Landingpage /> },
      // { path: '/frontend-pages/homepage', element: <Homepage /> },
      // { path: '/frontend-pages/about', element: <About /> },
      // { path: '/frontend-pages/contact', element: <Contact /> },
      // { path: '/frontend-pages/portfolio', element: <Portfolio /> },
      // { path: '/frontend-pages/pricing', element: <PagePricing /> },
      // { path: '/frontend-pages/blog', element: <BlogPage /> },
      // { path: '/frontend-pages/blog/detail/:id', element: <BlogPost /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
