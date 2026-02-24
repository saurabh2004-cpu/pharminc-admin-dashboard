import React, { useContext, useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Special handling for nested brand object
  if (orderBy === 'brand') {
    aValue = (a.brand?.name || '').toLowerCase();
    bValue = (b.brand?.name || '').toLowerCase();
  }
  // Handle date fields by converting to timestamps
  else if (orderBy === 'updatedAt' || orderBy === 'createdAt') {
    aValue = aValue ? new Date(aValue).getTime() : 0;
    bValue = bValue ? new Date(bValue).getTime() : 0;
  }
  // Handle standard string fields for case-insensitive comparison
  else if (typeof aValue === 'string') {
    aValue = aValue.toLowerCase();
    bValue = (bValue || '').toLowerCase();
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return (a, b) => {
    const comp = descendingComparator(a, b, orderBy);
    return order === 'desc' ? comp : -comp;
  };
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, showCheckBox, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };

  const headCellStyle = {
    backgroundColor: '#f0f8ff',
    fontWeight: 600,
    zIndex: 4,
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && (
          <TableCell padding="checkbox">
            <CustomCheckbox
              color="primary"
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all',
              }}
            />
          </TableCell>
        )}

        <TableCell sx={{ ...headCellStyle, ...stickyCellStyle }}>
          Actions
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCellStyle}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              sx={{
                userSelect: 'text',
                '& .MuiTableSortLabel-icon': {
                  opacity: 0.5,
                },
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleSearch, search, placeholder } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle2" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 100%' }}>
          <TextField
            placeholder={placeholder || "Search"}
            size="small"
            onChange={handleSearch}
            value={search}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size="1.1rem" />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>
      )}

      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton>
            <IconTrash width="18" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const BrandPagesListDetails = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('brand');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const headCells = [
    {
      id: 'brand',
      label: 'Brand Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'brandTitle',
      label: 'Brand Title',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'brandDescription',
      label: 'Brand Description',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'brandImages',
      label: 'Brand Image',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'heroDesktopCarouselImages',
      label: 'Hero Desktop Carousel',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'heromobileCarouselImages',
      label: 'Hero Mobile Carousel',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'categories',
      label: 'Categories',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'brands',
      label: 'Brand Items',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'questions',
      label: 'Q&A',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'carouselImages',
      label: 'Trusted By Images',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'updatedAt',
      label: 'Last Updated Date',
      numeric: false,
      disablePadding: false,
    },
  ];

  const fetchBrandPages = async () => {
    try {
      const response = await axiosInstance.get(`/brand-page/get-all-brand-pages`);
      // console.log("response fetchBrandPages ", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
        setRows(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brand pages:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBrandPages();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      return (
        row?.brand?.name?.toLowerCase().includes(searchValue) ||
        row?.brandTitle?.toLowerCase().includes(searchValue) ||
        row?.brandDescription?.toLowerCase().includes(searchValue) ||
        row?.categoryHeadingText?.toLowerCase().includes(searchValue) ||
        row?.brandHeadingText?.toLowerCase().includes(searchValue) ||
        row?.QnaHeadingText?.toLowerCase().includes(searchValue) ||
        row?.trustedByHeadingText?.toLowerCase().includes(searchValue) ||
        row?.questions?.some(q => q.toLowerCase().includes(searchValue)) ||
        row?.answers?.some(ans => ans.toLowerCase().includes(searchValue)) ||
        row?.categories?.some(cat => cat.categoryTitle?.toLowerCase().includes(searchValue)) ||
        row?.brands?.some(brand => brand.brandUrl?.toLowerCase().includes(searchValue))
      );
    });
    setRows(filteredRows);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset page to 0 when sorting changes
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      itemId: null,
      itemName: '',
      isDeleting: false
    });
  };

  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  const handleDeleteBrandPage = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    try {
      const res = await axiosInstance.delete(`/brand-page/delete-brand-page/${deleteDialog.itemId}`);

      console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error deleting brand page:', error);
      setError(error.message);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleEditBrandPage = (id) => {
    navigate(`/dashboard/brand-page/edit/${id}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: 'white',
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Brand Pages List',
    },
  ];

  return (
    <Box>
      <Breadcrumb title="Brand Pages List" items={BCrumb} />

      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search Brand Pages"
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1500,
                borderCollapse: "collapse",
                "& td, & th": {
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none",
                },
              }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                showCheckBox={false}
                headCells={headCells}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row._id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row._id}
                        selected={isItemSelected}
                      >
                        <TableCell sx={stickyCellStyle}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditBrandPage(row._id)}
                              >
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleDeleteClick(e, row._id, row.brand?.name)}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 200 }}
                        >
                          <Typography fontWeight="600">
                            {row?.brand?.name || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 200 }}
                        >
                          <Typography>
                            {row?.brandTitle || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 300 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {row?.brandDescription || 'No description'}
                          </Typography>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {row?.brandImages ? (
                            <Avatar
                              src={row.brandImages}
                              alt="Brand"
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                            />
                          ) : (
                            <Typography color="text.secondary" fontSize="0.875rem">
                              No image
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 120 }}
                        >
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {row?.heroCarouselImages.desktopImages?.slice(0, 2).map((img, idx) => (
                              <Avatar
                                key={idx}
                                src={img}
                                alt={`Hero ${idx + 1}`}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              />
                            ))}
                            {row?.heroCarouselImages?.length > 2 && (
                              <Chip
                                label={`+${row.heroCarouselImages.length - 2}`}
                                size="small"
                                color="primary"
                              />
                            )}
                            {!row?.heroCarouselImages.desktopImages?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No images
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 120 }}
                        >
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {row?.heroCarouselImages.mobileImages?.slice(0, 2).map((img, idx) => (
                              <Avatar
                                key={idx}
                                src={img}
                                alt={`Hero ${idx + 1}`}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              />
                            ))}
                            {row?.heroCarouselImages?.length > 2 && (
                              <Chip
                                label={`+${row.heroCarouselImages.length - 2}`}
                                size="small"
                                color="primary"
                              />
                            )}
                            {!row?.heroCarouselImages.mobileImages?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No images
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 350 }}
                        >
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {row?.categories?.slice(0, 3).map((category, idx) => (
                              <Box key={idx} display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  src={category.categoryImage}
                                  alt={category.categoryTitle}
                                  variant="rounded"
                                  sx={{ width: 30, height: 30 }}
                                />
                                <Box>
                                  <Typography variant="body2" fontWeight="500">
                                    {category.categoryTitle}
                                  </Typography>
                                  {category.categoryUrl && (
                                    <Typography variant="caption" color="text.secondary">
                                      {category.categoryUrl}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            ))}
                            {row?.categories?.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{row.categories.length - 3} more
                              </Typography>
                            )}
                            {!row?.categories?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No categories
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 300 }}
                        >
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {row?.brands?.slice(0, 3).map((brandItem, idx) => (
                              <Box key={idx} display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  src={brandItem.brandImage}
                                  alt="Brand Logo"
                                  variant="rounded"
                                  sx={{ width: 30, height: 30 }}
                                />
                                <Box>
                                  <Typography variant="body2">
                                    {brandItem.brandUrl || 'No URL'}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                            {row?.brands?.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{row.brands.length - 3} more
                              </Typography>
                            )}
                            {!row?.brands?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No brands
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 350 }}
                        >
                          <Box display="flex" flexDirection="column" gap={1}>
                            {row?.questions?.slice(0, 2).map((question, idx) => (
                              <Box key={idx}>
                                <Typography
                                  variant="body2"
                                  fontWeight="500"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 200
                                  }}
                                >
                                  Q: {question}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 200
                                  }}
                                >
                                  A: {row.answers?.[idx] || 'No answer'}
                                </Typography>
                              </Box>
                            ))}
                            {row?.questions?.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{row.questions.length - 2} more Q&A
                              </Typography>
                            )}
                            {!row?.questions?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No Q&A
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell
                          onClick={() => handleEditBrandPage(row._id)}
                          sx={{ cursor: 'pointer', minWidth: 150 }}
                        >
                          <Box
                            display="flex"
                            gap={1}
                            sx={{
                              overflowX: 'auto',
                              overflowY: 'hidden',
                              '&::-webkit-scrollbar': {
                                height: '6px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px',
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                              },
                            }}
                          >
                            {row?.carouselImages?.slice(0, 3).map((img, idx) => (
                              <Avatar
                                key={idx}
                                src={img}
                                alt={`Carousel ${idx + 1}`}
                                variant="rounded"
                                sx={{ width: 50, height: 50, flexShrink: 0 }}
                              />
                            ))}
                            {row?.carouselImages?.length > 3 && (
                              <Chip
                                label={`+${row.carouselImages.length - 3}`}
                                size="small"
                                color="primary"
                              />
                            )}
                            {!row?.carouselImages?.length && (
                              <Typography color="text.secondary" fontSize="0.875rem">
                                No images
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ cursor: 'pointer', minWidth: 200 }}>
                          <Typography variant="body2">
                            {row.updatedAt ? format(new Date(row.updatedAt), 'MMM d, yyyy') : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.updatedAt ? format(new Date(row.updatedAt), 'hh:mm a') : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={headCells.length + 2} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 30, 50, 100, 200]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteBrandPage}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType="Brand Page"
      />
    </Box>
  );
};

export default BrandPagesListDetails;