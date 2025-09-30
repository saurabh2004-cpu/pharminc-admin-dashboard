// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
  FormControlLabel,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../forms/theme-elements/CustomCheckbox';
import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "src/context/EcommerceContext";
import axiosInstance from '../../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../utils/ConfirmDeletePopUp';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
}

function getComparator(
  order,
  orderBy,
) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
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
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  const headCellStyle = {
    backgroundColor: '#f0f8ff', // ✅ apply to all header cells
    fontWeight: 600,
    zIndex: 4, // slightly lower than sticky so sticky overlaps
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && <TableCell padding="checkbox">
          <CustomCheckbox
            color="primary"
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>}
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : '2'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              ...headCellStyle,
              ...(index === 0 ? stickyCellStyle : {}), // 👈 first col sticky
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
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
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <IconTrash width="18" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <IconFilter size="1.2rem" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

// Confirmation Dialog Component


const ProductTableList = ({
  showCheckBox,
  headCells,
  tableData,
  isBrandsList = false,
  setTableData
}) => {

  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isBrandsList) {
      setRows(sourceData);
    } else {
      setRows(filteredAndSortedProducts);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    if (isBrandsList) {
      const filteredRows = sourceData.filter((row) => {
        return row.name.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    } else {
      const filteredRows = filteredAndSortedProducts.filter((row) => {
        return row.title.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name || n.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  // Open delete confirmation dialog
  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation(); // Prevent row selection
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  // Close delete confirmation dialog
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      itemId: null,
      itemName: '',
      isDeleting: false
    });
  };

  // Confirm delete action
  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const res = await axiosInstance.delete(`/brand/delete-brand/${deleteDialog.itemId}`);

      console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        // Remove item from both table data and rows
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        
        // Close dialog
        handleDeleteCancel();
        
        // You might want to show a success message here
        console.log("Brand deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      
      // You might want to show an error message here
      alert("Failed to delete brand. Please try again.");
    }
  };

  // Edit brand
  const handleEditBrand = (event, id) => {
    event.stopPropagation(); // Prevent row selection
    navigate(`/dashboard/brand/edit/${id}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  return (
    <Box sx={{
      width: '100%',
    }}>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isBrandsList ? "Search Brand" : "Search Product"}
        />
        <Paper variant="outlined" sx={{
          mt: 1,
          border: `1px solid ${borderColor}`,
          borderRadius: 0, // Remove border radius for full edge-to-edge
        }}>
          <TableContainer sx={{
            overflowX: "auto",
          }}>
            {/* Rest of your table code remains the same */}
            <Table
              sx={{
                minWidth: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                "& td, & th": {
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none",
                },
              }}
              aria-labelledby="tableTitle"
              size="small"
            >

              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                showCheckBox={showCheckBox}
                headCells={headCells}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name || row.title);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.name || row.title)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row._id || row.title}
                        selected={isItemSelected}
                      >
                        {showCheckBox && <TableCell padding="checkbox">
                          <CustomCheckbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>}

                        {isBrandsList ? (
                          // Brands List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    color="primary" 
                                    onClick={(event) => handleEditBrand(event, row._id)}
                                  >
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={(event) => handleDeleteClick(event, row._id, row.name)}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Box
                                  sx={{
                                    ml: 2,
                                  }}
                                >
                                  <Typography fontWeight="600">
                                    {row.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.slug}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.createAlt || row.createdAt), 'E, MMM d yyyy')}</Typography>
                            </TableCell>

                          </>
                        ) : (
                          // Products List View (original code)
                          ''
                        )}
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={headCells.length + (showCheckBox ? 1 : 0)} />
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={isBrandsList ? "Brand" : "Product"}
      />
    </Box>
  );
};

export default ProductTableList;