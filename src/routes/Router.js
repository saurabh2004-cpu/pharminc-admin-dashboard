import React, { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import Loadable from '../layouts/full/shared/loadable/Loadable';
// import { Create } from '@mui/icons-material';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
// const ModernDash = Loadable(lazy(() => import('../views/dashboard/Modern')));
const EcommerceDash = Loadable(lazy(() => import('../views/dashboard/Ecommerce')));



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
const ListNetTerms = Loadable(lazy(() => import('../views/admin/netTerms/ListNetTerms')));

const CreateAdmin = Loadable(lazy(() => import('../views/admin/addAdmin/CreateAdmin')));
const PendingApprovalCustomers = Loadable(lazy(() => import('../views/admin/customer/PendingApprovalCustomers')));

const CreateSubCategoryTwo = Loadable(lazy(() => import('../views/admin/subCategoryTwo/CreateSubCategoryTwo')));
const SubCategoryTwoList = Loadable(lazy(() => import('../views/admin/subCategoryTwo/SubCategoryTwoList')));
const EditSubCategoryTwo = Loadable(lazy(() => import('../views/admin/subCategoryTwo/EditSubCategoryTwo')));
const CustomersPricingGroups = Loadable(lazy(() => import('../views/admin/groupsDiscounts.js/CustomersPricingGroups')))
const CustomersItemsBasedDiscounts = Loadable(lazy(() => import('../views/admin/pricingGroupsDiscounts/CustomersItemsBasedDiscounts')))
const CustomersSalesOrders = Loadable(lazy(() => import('../views/admin/salesOrders/CustomersSalesOrders')))
const SalesOrderProductsList = Loadable(lazy(() => import('../views/admin/salesOrders/SalesOrderProductsList')))
const Reset = Loadable(lazy(() => import('../views/admin/ResetPassword/Reset')));

const CustomersList = Loadable(lazy(() => import('../views/admin/AbandonedCart/CustomersList')));

const CreateCustomerSpecificAmounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/CreateCustomerSpecificAmounts')));
const ListCustomerSpecificAmounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/ListCustomerSpecificAmounts')));
const CustomerList = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/CustomerList')));
const EditCustomerSpecificDiscounts = Loadable(lazy(() => import('../views/admin/customerSpecificAmounts/EditCustomerSpecificDiscounts')));



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
      { path: '/dashboard/customers-pricing-groups/:id', element: <CustomersPricingGroups /> },



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
      { path: '/dashboard/customers/change-password/:email', element: <ChnagePassword /> },
      { path: '/dashboard/customers/PendingCustomers', element: <PendingApprovalCustomers /> },


      { path: '/dashboard/NetTerms/List', element: <ListNetTerms /> },

      { path: '/dashboard/CreateAdmin', element: <CreateAdmin /> },

      { path: '/dashboard/sub-category-two/create', element: <CreateSubCategoryTwo /> },
      { path: '/dashboard/sub-category-two/list', element: <SubCategoryTwoList /> },
      { path: '/dashboard/sub-category-two/edit/:id', element: <EditSubCategoryTwo /> },


      { path: '/dashboard/abandoned-carts/customers', element: <CustomersList /> },
      
      { path: '/dashboard/customer-specific-amounts/create', element: <CreateCustomerSpecificAmounts /> },
      { path: '/dashboard/customer-specific-amounts/list', element: <ListCustomerSpecificAmounts /> },
      { path: '/dashboard/customer-specific-amounts/customers-list/:id', element: <CustomerList /> },
      { path: '/dashboard/customer-specific-amounts/edit/:id', element: <EditCustomerSpecificDiscounts /> },
      
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      { path: '/auth/login', element: <Login2 /> },
      { path: '/auth/register', element: <Register2 /> },
      { path: '/reset-password', element: <Reset /> },



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
