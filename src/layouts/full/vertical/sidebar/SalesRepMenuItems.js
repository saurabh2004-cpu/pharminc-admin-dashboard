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

const SalesRepMenuitems = [
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
    title: 'Customers',
    icon: IconNotebook,
    href: '',
    children: [
      {
        id: uniqueId(),
        title: 'Customers',
        icon: IconPoint,
        href: '/salesrep/dashboards/customers/list',
      },
    ]
  },
];

export default SalesRepMenuitems;
