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
  IconMessage,
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
    title: 'Services',
    icon: IconCategory,
    href: '/dashboard/services/list',
    children: [
      {
        id: uniqueId(),
        title: 'Create Service',
        icon: IconPoint,
        href: '/dashboard/services/create',
      },
      {
        id: uniqueId(),
        title: 'Services List',
        icon: IconPoint,
        href: '/dashboard/services/list',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Addresses',
    icon: IconBuildingStore,
    href: '/dashboard/addresses/list',
    children: [
      {
        id: uniqueId(),
        title: 'Create Address',
        icon: IconPoint,
        href: '/dashboard/addresses/create',
      },
      {
        id: uniqueId(),
        title: 'Addresses List',
        icon: IconPoint,
        href: '/dashboard/addresses/list',
      }
    ]
  },

  {
    id: uniqueId(),
    title: 'Blogs',
    icon: IconNotebook,
    href: '/dashboard/blogs/list',
    children: [
      {
        id: uniqueId(),
        title: 'Create Blog',
        icon: IconPoint,
        href: '/dashboard/blogs/create',
      },
      {
        id: uniqueId(),
        title: 'Blogs List',
        icon: IconPoint,
        href: '/dashboard/blogs/list',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Consultations',
    icon: IconMessage,
    href: '/dashboard/consultations/list',
    children: [
      {
        id: uniqueId(),
        title: 'Consultations List',
        icon: IconPoint,
        href: '/dashboard/consultations/list',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Labels',
    icon: IconTags,
    href: '/dashboard/labels/list',
    children: [
      {
        id: uniqueId(),
        title: 'Create Label',
        icon: IconPoint,
        href: '/dashboard/labels/create',
      },
      {
        id: uniqueId(),
        title: 'Labels List',
        icon: IconPoint,
        href: '/dashboard/labels/list',
      }
    ]
  },
  {
    id: uniqueId(),
    title: 'Keywords',
    icon: IconFileDescription,
    href: '/dashboard/keywords/list',
    children: [
      {
        id: uniqueId(),
        title: 'Import CSV',
        icon: IconPoint,
        href: '/dashboard/keywords/import',
      },
      {
        id: uniqueId(),
        title: 'Keywords List',
        icon: IconPoint,
        href: '/dashboard/keywords/list',
      }
    ]
  },
];

export default Menuitems;
