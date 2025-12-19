import React, { useContext, useEffect, useState } from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { CustomizerContext } from 'src/context/CustomizerContext';

import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { useSelector } from 'react-redux';

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';
  const [adminRole, setAdminRole] = useState('')
  const admin = useSelector((state) => state.auth.userData);

  // console.log("admin in sidebar ", admin)

  const filteredMenuItems = Menuitems.map(item => {
    if (item.children) {
      // Filter children items
      const filteredChildren = item.children.filter(child => {
        // Hide "Add Admin" if role is SUB ADMIN
        if ((child.title === 'Add Admin' || child.title === 'Admin List' || child.title === 'Edit Admin' ) && admin?.role == 'SUB ADMIN') {
          return false;
        }
        return true;
      });

      return {
        ...item,
        children: filteredChildren
      };
    }
    return item;
  }).filter(item => {
    // Remove parent items that have no children after filtering
    if (item.children && item.children.length === 0) {
      return false;
    }
    return true;
  });



  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredMenuItems.map((item, index) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => setIsMobileSidebar(!isMobileSidebar)}

              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => setIsMobileSidebar(!isMobileSidebar)}

              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
