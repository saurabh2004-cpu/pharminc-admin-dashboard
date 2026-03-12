import { uniqueId } from 'lodash';

import {
  IconAward,
  IconPoint,
  IconFileDescription,
  IconUserPlus,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconSettings,
  IconNotebook,
  IconListTree,
  IconBuildingStore,
  IconCategory,
  IconTags,
  IconDiscount2,
  IconReceipt,
  IconTruck,
  IconShoppingBag,
  IconCalendar,
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/',
    chip: 'New',
    chipColor: 'secondary',
    chipBackground: '#E9098D'
  },
  // {
  //   id: uniqueId(),
  //   title: 'Earning & Revenue',
  //   icon: IconShoppingCart,
  //   href: '/',
  // },

  {
    id: uniqueId(),
    title: 'Institute Management',
    icon: IconBuildingStore,
    href: '/dashboard/institutes/list',
    children: [
      {
        id: uniqueId(),
        title: 'Create Institute',
        icon: IconPoint,
        href: '/dashboard/institute/create',
      },
      {
        id: uniqueId(),
        title: 'Institutes List',
        icon: IconPoint,
        href: '/dashboard/institutes/list',
      },
      {
        id: uniqueId(),
        title: 'Verification Queue',
        icon: IconPoint,
        href: '/dashboard/institutes/verification',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Credits Management',
    icon: IconReceipt,
    href: '/dashboard/institute-credits',
    children: [
      // {
      //   id: uniqueId(),
      //   title: 'Credits Wallet',
      //   icon: IconPoint,
      //   href: '/dashboard/credits-wallet',
      // },
      {
        id: uniqueId(),
        title: 'Institute Credits',
        icon: IconPoint,
        href: '/dashboard/institute-credits',
      },
      {
        id: uniqueId(),
        title: 'Credits History',
        icon: IconPoint,
        href: '/dashboard/credits-history',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'User Management',
    icon: IconUserPlus,
    href: '/dashboard/users/list',
    children: [
      {
        id: uniqueId(),
        title: 'Users List',
        icon: IconPoint,
        href: '/dashboard/users/list',
      },
      {
        id: uniqueId(),
        title: 'Verification Queue',
        icon: IconPoint,
        href: '/dashboard/users/verification',
      }
    ]
  },

  {
    id: uniqueId(),
    title: 'Job Management',
    icon: IconReceipt,
    href: '/dashboard/jobs',
    children: [
      {
        id: uniqueId(),
        title: 'Jobs List',
        icon: IconPoint,
        href: '/dashboard/jobs',
      },
    ]
  },
  {
    id: uniqueId(),
    title: 'Admin Management',
    icon: IconSettings,
    href: '/dashboard/admins',
    children: [
      {
        id: uniqueId(),
        title: 'Create Admin',
        icon: IconPoint,
        href: '/dashboard/admins/create',
      },
      {
        id: uniqueId(),
        title: 'Admins List',
        icon: IconPoint,
        href: '/dashboard/admins',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Activity Logs',
    icon: IconListTree,
    href: '/admin/activity-logs',
  }

];

export default Menuitems;
