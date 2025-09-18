import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation } from 'react-router';
// mui imports
import { ListItemIcon, ListItem, Collapse, styled, ListItemText, useTheme } from '@mui/material';
import { CustomizerContext } from 'src/context/CustomizerContext';

// custom imports
import NavItem from '../NavItem';

// plugins
import { IconChevronDown, IconChevronUp } from '@tabler/icons';
import { useTranslation } from 'react-i18next';

// FC Component For Dropdown Menu
const NavCollapse = ({ menu, level, pathWithoutLastPart, pathDirect, onClick, hideMenu }) => {
  const { isBorderRadius } = useContext(CustomizerContext);
  const { isCollapse, setIsCollapse } = useContext(CustomizerContext);
  
  const Icon = menu.icon;
  const theme = useTheme();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuIcon =
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.3rem" />;

  const handleClick = () => {
    setOpen(!open);
  };

  // menu collapse for sub-levels
  React.useEffect(() => {
    setOpen(false);
    menu.children.forEach((item) => {
      if (item.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  const ListItemStyled = styled(ListItem)(() => ({
    marginBottom: '2px',
    cursor: 'pointer',
    padding: '8px 10px',
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    backgroundColor: open && level < 2 ? '#2E2F7F' : 'transparent',
    whiteSpace: 'nowrap',
    position: 'relative',
    '&:hover': {
      // Only apply hover styles to the direct element, not children
      backgroundColor: '#2E2F7F',
      color: 'white',
      // Target only the direct child icon and text, not nested ones
      '& > .MuiListItemIcon-root': {
        color: 'white',
      },
      '& > .MuiListItemText-root': {
        color: 'white',
      },
      // Prevent hover styles from affecting nested collapse items
      '& .MuiCollapse-root': {
        '& .MuiListItem-root': {
          color: 'inherit',
          '& .MuiListItemIcon-root': {
            color: 'inherit',
          },
          '& .MuiListItemText-root': {
            color: 'inherit',
          },
        },
      },
    },
    color:
      open && level < 2
        ? 'white'
        : level > 1 && open
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
    borderRadius: `${isBorderRadius}px`,
  }));

  // If Menu has Children
  const submenus = menu.children?.map((item) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    }
  });

  return (
    <React.Fragment key={menu.id}>
      <ListItemStyled
        button="true"
        component="li"
        onClick={handleClick}
        selected={pathWithoutLastPart === menu.href}
      >
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color: 'inherit',
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit">
          {hideMenu ? '' : <>{t(`${menu.title}`)}</>}
        </ListItemText>
        {!open ? <IconChevronDown size="1rem" /> : <IconChevronUp size="1rem" />}
      </ListItemStyled>
      <Collapse 
        in={open} 
        timeout="auto" 
        unmountOnExit
        sx={{
          // Ensure collapsed content doesn't inherit parent hover styles
          '& .MuiListItem-root': {
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            },
          },
        }}
      >
        {submenus}
      </Collapse>
    </React.Fragment>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  pathWithoutLastPart: PropTypes.any,
  hideMenu: PropTypes.any,
  onClick: PropTypes.func,
};

export default NavCollapse;