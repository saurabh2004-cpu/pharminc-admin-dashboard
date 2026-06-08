import React, { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from './ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

const EcommerceDash = Loadable(lazy(() => import('../views/dashboard/Ecommerce')));
const Modern = Loadable(lazy(() => import('../views/dashboard/Modern')));

// authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login2')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));



// Services Imports
const ServiceCreate = Loadable(lazy(() => import('../views/admin/services/ServiceCreate')));
const ServicesList = Loadable(lazy(() => import('../views/admin/services/ServicesList')));
const ServiceEdit = Loadable(lazy(() => import('../views/admin/services/ServiceEdit')));

// Addresses Imports
const AddressCreate = Loadable(lazy(() => import('../views/admin/addresses/AddressCreate')));
const AddressList = Loadable(lazy(() => import('../views/admin/addresses/AddressList')));
const AddressEdit = Loadable(lazy(() => import('../views/admin/addresses/AddressEdit')));

// Locations Imports

// Blogs Imports
const BlogCreate = Loadable(lazy(() => import('../views/admin/blogs/BlogCreate')));
const BlogList = Loadable(lazy(() => import('../views/admin/blogs/BlogList')));
const BlogEdit = Loadable(lazy(() => import('../views/admin/blogs/BlogEdit')));

// Consultations Imports
const ConsultationList = Loadable(lazy(() => import('../views/admin/consultations/ConsultationList')));
const ConsultationView = Loadable(lazy(() => import('../views/admin/consultations/ConsultationView')));

// Labels Imports
const LabelCreate = Loadable(lazy(() => import('../views/admin/labels/LabelCreate')));
const LabelsList = Loadable(lazy(() => import('../views/admin/labels/LabelsList')));
const LabelEdit = Loadable(lazy(() => import('../views/admin/labels/LabelEdit')));

// Keywords Imports
const KeywordsImport = Loadable(lazy(() => import('../views/admin/keywords/KeywordsImport')));
const KeywordsList = Loadable(lazy(() => import('../views/admin/keywords/KeywordsList')));

const Router = [

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboards/modern" /> },
      // { path: '/dashboards/ecommerce', exact: true, element: <EcommerceDash /> },
      { path: '/dashboards/modern', exact: true, element: <Modern /> },


      { path: '*', element: <Navigate to="/auth/404" /> },



      { path: '/dashboard/services/create', element: <ServiceCreate /> },
      { path: '/dashboard/services/list', element: <ServicesList /> },
      { path: '/dashboard/services/edit/:id', element: <ServiceEdit /> },

      { path: '/dashboard/addresses/create', element: <AddressCreate /> },
      { path: '/dashboard/addresses/list', element: <AddressList /> },
      { path: '/dashboard/addresses/edit/:id', element: <AddressEdit /> },


      { path: '/dashboard/blogs/create', element: <BlogCreate /> },
      { path: '/dashboard/blogs/list', element: <BlogList /> },
      { path: '/dashboard/blogs/edit/:id', element: <BlogEdit /> },

      { path: '/dashboard/consultations/list', element: <ConsultationList /> },
      { path: '/dashboard/consultations/view/:id', element: <ConsultationView /> },

      { path: '/dashboard/labels/create', element: <LabelCreate /> },
      { path: '/dashboard/labels/list', element: <LabelsList /> },
      { path: '/dashboard/labels/edit/:id', element: <LabelEdit /> },

      { path: '/dashboard/keywords/import', element: <KeywordsImport /> },
      { path: '/dashboard/keywords/list', element: <KeywordsList /> },

    ],
  },

  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      { path: '/auth/login', element: <Login2 /> },


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
