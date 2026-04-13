import React, { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';

import Loadable from '../layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

const EcommerceDash = Loadable(lazy(() => import('../views/dashboard/Ecommerce')));
const Modern = Loadable(lazy(() => import('../views/dashboard/Modern')));

// authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login2')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

//my imports

// Institute Imports
const InstituteCreate = Loadable(lazy(() => import('../views/admin/institute/InstituteCreate')));
const InstituteList = Loadable(lazy(() => import('../views/admin/institute/InstituteList')));
const InstituteEdit = Loadable(lazy(() => import('../views/admin/institute/InstituteEdit')));
const InstituteJobsList = Loadable(lazy(() => import('../views/admin/institute/InstituteJobsList')));
const JobApplicantsList = Loadable(lazy(() => import('../views/admin/institute/JobApplicantsList')));
const InstituteVerificationList = Loadable(lazy(() => import('../views/admin/institute/InstituteVerificationList')));
const InstituteVerificationDetails = Loadable(lazy(() => import('../views/admin/institute/InstituteVerificationDetails')));
const InstituteDetails = Loadable(lazy(() => import('../views/admin/institute/InstituteDetails')));
// Credits Management Imports
const CreditsWalletList = Loadable(lazy(() => import('../views/admin/creditsWallet/CreditsWalletList')));
const CreditsWalletCreate = Loadable(lazy(() => import('../views/admin/creditsWallet/CreditsWalletCreate')));
const CreditsWalletEdit = Loadable(lazy(() => import('../views/admin/creditsWallet/CreditsWalletEdit')));

const InstituteCreditsList = Loadable(lazy(() => import('../views/admin/instituteCredits/InstituteCreditsList')));
const InstituteCreditsCreate = Loadable(lazy(() => import('../views/admin/instituteCredits/InstituteCreditsCreate')));
const InstituteCreditsEdit = Loadable(lazy(() => import('../views/admin/instituteCredits/InstituteCreditsEdit')));

// User Management Imports
const UsersList = Loadable(lazy(() => import('../views/admin/users/UsersList')));
const UserVerificationList = Loadable(lazy(() => import('../views/admin/users/UserVerificationList')));
const UserEdit = Loadable(lazy(() => import('../views/admin/users/UserEdit')));
const UserDetails = Loadable(lazy(() => import('../views/admin/users/UserDetails')));
const UserVerificationDetails = Loadable(lazy(() => import('../views/admin/users/UserVerificationDetails')));
const UserApplicationsList = Loadable(lazy(() => import('../views/admin/users/UserApplicationsList')));

// Job Management Imports
const JobsList = Loadable(lazy(() => import('../views/admin/jobs/JobsList')));
const JobEdit = Loadable(lazy(() => import('../views/admin/jobs/JobEdit')));
// Admin Management Imports
const AdminsList = Loadable(lazy(() => import('../views/admin/admins/AdminsList')));
const CreateAdmin = Loadable(lazy(() => import('../views/admin/admins/CreateAdmin')));
const EditAdmin = Loadable(lazy(() => import('../views/admin/admins/EditAdmin')));

// Credits History Imports
const CreditsHistoryList = Loadable(lazy(() => import('../views/admin/credits-history/CreditsHistoryList')));
const InstituteCreditsHistoryList = Loadable(lazy(() => import('../views/admin/credits-history/InstituteCreditsHistoryList')));
const CreditsHistoryDetail = Loadable(lazy(() => import('../views/admin/credits-history/CreditsHistoryDetail')));

// Activity Logs Imports
const ActivityLogsList = Loadable(lazy(() => import('../views/admin/activityLogs/ActivityLogsList')));
const ActivityLogDetails = Loadable(lazy(() => import('../views/admin/activityLogs/ActivityLogDetails')));
// Package Management Imports
const PackageList = Loadable(lazy(() => import('../views/admin/packages/PackageList')));
const PackageCreate = Loadable(lazy(() => import('../views/admin/packages/PackageCreate')));
const PackageEdit = Loadable(lazy(() => import('../views/admin/packages/PackageEdit')));

// Conversation Management Imports
const ConversationsList = Loadable(lazy(() => import('../views/admin/conversations/ConversationsList')));
const ConversationChat = Loadable(lazy(() => import('../views/admin/conversations/ConversationChat')));

const Router = [

  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboards/modern" /> },
      // { path: '/dashboards/ecommerce', exact: true, element: <EcommerceDash /> },
      { path: '/dashboards/modern', exact: true, element: <Modern /> },


      { path: '*', element: <Navigate to="/auth/404" /> },


      { path: '/dashboard/institute/create', element: <InstituteCreate /> },
      { path: '/dashboard/institutes/list', element: <InstituteList /> },
      { path: '/dashboard/institute/edit/:id', element: <InstituteEdit /> },
      { path: '/dashboard/institutes/:id/jobs', element: <InstituteJobsList /> },
      { path: '/dashboard/institutes/verification', element: <InstituteVerificationList /> },
      { path: '/dashboard/institutes/:id', element: <InstituteDetails /> },
      { path: '/admin/institute-verifications/:id', element: <InstituteVerificationDetails /> },
      { path: '/dashboard/jobs/:id/applicants', element: <JobApplicantsList /> },

      { path: '/dashboard/credits-wallet', element: <CreditsWalletList /> },
      { path: '/dashboard/credits-wallet/create', element: <CreditsWalletCreate /> },
      { path: '/dashboard/credits-wallet/edit/:id', element: <CreditsWalletEdit /> },

      { path: '/dashboard/institute-credits', element: <InstituteCreditsList /> },
      { path: '/dashboard/institute-credits/create', element: <InstituteCreditsCreate /> },
      { path: '/dashboard/institute-credits/edit/:id', element: <InstituteCreditsEdit /> },

      { path: '/dashboard/users/list', element: <UsersList /> },
      { path: '/dashboard/users/verification', element: <UserVerificationList /> },
      { path: '/admin/user-verifications/:id', element: <UserVerificationDetails /> },
      { path: '/dashboard/users/edit/:id', element: <UserEdit /> },
      { path: '/dashboard/users/:id', element: <UserDetails /> },
      { path: '/dashboard/users/:id/applications', element: <UserApplicationsList /> },
      { path: '/dashboard/jobs', element: <JobsList /> },
      { path: '/dashboard/jobs/edit/:id', element: <JobEdit /> },
      { path: '/dashboard/admins', element: <AdminsList /> },
      { path: '/dashboard/admins/create', element: <CreateAdmin /> },
      { path: '/dashboard/admins/edit/:id', element: <EditAdmin /> },
      { path: '/dashboard/credits-history', element: <CreditsHistoryList /> },
      { path: '/dashboard/institutes/:id/credits-history', element: <InstituteCreditsHistoryList /> },
      { path: '/dashboard/credits-history/:id', element: <CreditsHistoryDetail /> },
      { path: '/admin/activity-logs', element: <ActivityLogsList /> },
      { path: '/admin/activity-logs/:id', element: <ActivityLogDetails /> },
      { path: '/dashboard/packages/list', element: <PackageList /> },
      { path: '/dashboard/packages/create', element: <PackageCreate /> },
      { path: '/dashboard/packages/edit/:id', element: <PackageEdit /> },
      { path: '/dashboard/conversations', element: <ConversationsList /> },
      { path: '/dashboard/conversations/:id', element: <ConversationChat /> },
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
