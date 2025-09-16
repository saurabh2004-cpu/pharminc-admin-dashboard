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
  {
    id: uniqueId(),
    title: 'Earning & Revenue',
    icon: IconShoppingCart,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Brand',
    icon: IconBuildingStore,
    href: '/dashboard/Brand',
    children: [
      {
        id: uniqueId(),
        title: 'Create Brand',
        icon: IconPoint,
        href: '/dashboard/Brand/create',
      },
      {
        id: uniqueId(),
        title: 'Brands List',
        icon: IconPoint,
        href: '/dashboard/brands/list',
      },
    ]
  },

  {
    id: uniqueId(),
    title: 'Category',
    icon: IconCategory,
    chip: '2',
    chipColor: 'secondary',
    // href: '/dashboard/category',
    children: [
      {
        id: uniqueId(),
        title: 'Create Category',
        icon: IconPoint,
        href: '/dashboard/category/create',
      },
      {
        id: uniqueId(),
        title: 'Category List',
        icon: IconPoint,
        href: '/dashboard/category/list',
      },
    ]
  },

  {
    id: uniqueId(),
    title: 'Sub Category',
    icon: IconListTree,
    href: '/dashboard/sub-category',
    children: [
      {
        id: uniqueId(),
        title: 'Create Sub Category',
        icon: IconPoint,
        href: '/dashboard/sub-category/create',
      },
      {
        id: uniqueId(),
        title: 'Sub Category List',
        icon: IconPoint,
        href: '/dashboard/sub-category/list',
      },
    ]

  },

  {
    id: uniqueId(),
    title: 'Sub Category Two',
    icon: IconListTree,
    href: '/dashboard/sub-categoryTwo',
    children: [
      {
        id: uniqueId(),
        title: 'Create Sub Category Two',
        icon: IconPoint,
        href: '/dashboard/sub-category-two/create',
      },
      {
        id: uniqueId(),
        title: 'Sub Category Two List',
        icon: IconPoint,
        href: '/dashboard/sub-category-two/list',
      },
    ]

  },

  {
    id: uniqueId(),
    title: 'Badge',
    icon: IconAward,
    // href: '/admin/manage-widrawa',
    children: [
      {
        id: uniqueId(),
        title: 'Create Badge',
        icon: IconPoint,
        href: '/dashboard/badge/create',
      },
      {
        id: uniqueId(),
        title: 'Badge List',
        icon: IconPoint,
        href: '/dashboard/badge/list',
      },
    ]

  },
  {
    id: uniqueId(),
    title: 'Pricing Groups',
    icon: IconTags,
    href: '/dashboard/pricing-groups',
    children: [
      {
        id: uniqueId(),
        title: 'Create Pricing Group',
        icon: IconPoint,
        href: '/dashboard/pricing-groups/create',
      },
      {
        id: uniqueId(),
        title: 'List Pricing Groups',
        icon: IconPoint,
        href: '/dashboard/pricing-groups/list',
      },
    ]

  },
  {
    id: uniqueId(),
    title: 'Groups Discounts',
    icon: IconTags,
    href: '/dashboard/groups-discounts',
    children: [
      {
        id: uniqueId(),
        title: 'Create Groups Discounts',
        icon: IconPoint,
        href: '/dashboard/groups-discounts/create',
      },
      {
        id: uniqueId(),
        title: 'List Groups Discounts',
        icon: IconPoint,
        href: '/dashboard/groups-discounts/list',
      },
    ]

  },

  {
    id: uniqueId(),
    title: 'Items Discounts',
    icon: IconDiscount2,
    href: '/dashboarditem-based-discounts',
    children: [
      {
        id: uniqueId(),
        title: 'Create Items Discounts',
        icon: IconPoint,
        href: '/dashboard/items-based-discounts/create',
      },
      {
        id: uniqueId(),
        title: 'List Items Discounts',
        icon: IconPoint,
        href: '/dashboard/items-based-discounts/list',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Tax',
    icon: IconReceipt,
    href: '/dashboard/tax',
    children: [
      {
        id: uniqueId(),
        title: 'Create Tax',
        icon: IconPoint,
        href: '/dashboard/tax/create',
      },
      {
        id: uniqueId(),
        title: 'Tax List',
        icon: IconPoint,
        href: '/dashboard/tax/list',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Delivery Vendors',
    icon: IconTruck,
    href: '/dashboard/delivery-vendors',
    children: [
      {
        id: uniqueId(),
        title: 'Create Delivery Vendor',
        icon: IconPoint,
        href: '/dashboard/delivery-vendors/create',
      },
      {
        id: uniqueId(),
        title: 'Delivery Vendor List',
        icon: IconPoint,
        href: '/dashboard/delivery-vendors/list',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Pack Types',
    icon: IconBox,
    href: '/dashboard/pack-types',
    children: [
      {
        id: uniqueId(),
        title: 'Create Pack Type',
        icon: IconPoint,
        href: '/dashboard/pack-types/create',
      },
      {
        id: uniqueId(),
        title: 'Pack Type List',
        icon: IconPoint,
        href: '/dashboard/pack-types/list',
      },
    ],
  },


  {
    id: uniqueId(),
    title: 'Products',
    icon: IconShoppingBag,
    href: '/dashboard/products',
    children: [
      {
        id: uniqueId(),
        title: 'Create Product',
        icon: IconPoint,
        href: '/dashboard/products/create',
      },
      {
        id: uniqueId(),
        title: 'Product List',
        icon: IconPoint,
        href: '/dashboard/products/list',
      },
    ]
  },

  {
    id: uniqueId(),
    title: 'Sales order',
    icon: IconFileDescription,
    href: '/dashboard/sales-order',
    children: [
      {
        id: uniqueId(),
        title: 'Create Sales Order',
        icon: IconPoint,
        href: '/dashboard/sales-order/create',
      },
      {
        id: uniqueId(),
        title: 'Sales Order List',
        icon: IconPoint,
        href: '/dashboard/sales-orders/list',
      },
    ]
  },
  {
    id: uniqueId(),
    title: 'Customers',
    icon: IconNotebook,
    href: '/dashboard/customers',
    children: [
      {
        id: uniqueId(),
        title: 'Create Customer',
        icon: IconPoint,
        href: '/dashboard/customers/create',
      },
      {
        id: uniqueId(),
        title: 'List Customers',
        icon: IconPoint,
        href: '/dashboard/customers/list',
      },
    ]
  },
  {
    id: uniqueId(),
    title: 'NetTerms',
    icon: IconCalendar,
    href: '/dashboard/NetTerms',
    children: [
      {
        id: uniqueId(),
        title: 'Net Terms',
        icon: IconPoint,
        href: '/dashboard/NetTerms/List',
      },
    ]
  },

  {
    navlabel: true,
    subheader: 'Setting And Configuration',
  },
  {
    id: uniqueId(),
    title: 'Settings',
    icon: IconSettings,
    href: '/admin/setting',
    children: [
      {
        id: uniqueId(),
        title: 'Add Admin',
        icon: IconUserPlus,
        href: '/dashboard/CreateAdmin',
      },
    ]
  },



];

export default Menuitems;
