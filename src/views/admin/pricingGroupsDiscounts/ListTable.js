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
  Button,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
// import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';

// Sorting logic handled inside ListTable to access customerMap

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
            padding={headCell.disablePadding ? 'none' : 'normal'}
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
  const { numSelected, handleSearch, search, placeholder, rows, headCells } = props;

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(
        '/item-based-discount/export-items-based-discount',
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "item-based_discounts_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

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
        <>
          <Tooltip title="Filter list">
            <IconButton>
              <IconFilter size="1.2rem" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            {/* <IconButton onClick={handleExportCSV}> */}
            <Button size="small" variant="outlined" onClick={handleExportCSV}>Export</Button>
            {/* </IconButton> */}
          </Tooltip>
        </>
      )}
    </Toolbar>
  );
};


const ListTable = ({
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
  const [orderBy, setOrderBy] = useState('customerId');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

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
        const customerIdStr = row?.customerId?.toString().toLowerCase() || "";
        const customerName = customerMap[row?.customerId]?.toLowerCase() || "";

        return (
          customerIdStr.includes(searchValue) ||
          customerName.includes(searchValue)
        );
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
    setPage(0);
  };

  const getComparator = (order, orderBy) => {
    return (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === 'customerName') {
        aValue = (customerMap[a.customerId] || '').toLowerCase();
        bValue = (customerMap[b.customerId] || '').toLowerCase();
      } else if (orderBy === 'updatedAt' || orderBy === 'createdAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    };
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderResult = comparator(a[0], b[0]);
      if (orderResult !== 0) return orderResult;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
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



  const handleCustomerIdClick = (id) => {
    navigate(`/dashboard/customers-items-based-discounts/${id}`);
  }


  const [customerMap, setCustomerMap] = useState({});

  const fetchCustomerDetails = async (customerIds) => {
    try {
      // console.log("Fetching details for customer IDs:", customerIds);

      const responses = await Promise.all(
        customerIds.map((id) =>
          axiosInstance.get(`/admin/get-user-by-customerId/${id}`)
            .then(response => ({ success: true, data: response.data, id }))
            .catch((err) => {
              console.error(`API error for id ${id}:`, err.response?.data || err.message);
              return { success: false, id, error: err };
            })
        )
      );

      const newMap = {};
      responses.forEach((response) => {
        if (response.success && response.data?.statusCode === 200) {
          const customerData = response.data.data;
          const customerName =
            customerData?.customerName ||
            customerData?.contactName ||
            customerData?.storeName ||
            customerData?.name ||
            "N/A";

          newMap[response.id] = customerName;
          // console.log(`✅ Mapped ${response.id} to: ${customerName}`);
        } else {
          newMap[response.id] = "Not Found";
          // console.log(`❌ Failed to fetch details for: ${response.id}`);
        }
      });

      setCustomerMap(prev => ({ ...prev, ...newMap }));
    } catch (error) {
      console.error("Error in fetchCustomerDetails:", error);
    }
  };

  useEffect(() => {
    if (rows.length > 0) {
      const uniqueCustomerIds = [...new Set(rows.map((r) => r.customerId))].filter(Boolean);

      // Only fetch customer details that we don't already have
      const missingCustomerIds = uniqueCustomerIds.filter(id => !customerMap[id]);

      if (missingCustomerIds.length > 0) {
        fetchCustomerDetails(missingCustomerIds);
      }
    }
  }, [rows, customerMap]);

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

  const handleDeleteClick = (event, id, name, _id) => {
    event.stopPropagation(); // Prevent row selection
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false,
      _id: _id
    });
  };

  //delete pricing group
  const handleDeleteItemDiscounts = async () => {
    try {
      const res = await axiosInstance.delete(`/item-based-discount/delete-items-based-discount-by-customer-id/${deleteDialog.itemId}`);

      // console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog._id));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog._id));
        handleDeleteCancel();

      }
    } catch (error) {
      console.error('Error deleting item discounts:', error);
    }
  };

  const columnWidths = {
    serial: { minWidth: '80px' },
    date: { minWidth: '200px' },
    document: { minWidth: '200px' },
    customer: { minWidth: '300px' },
    salesChannel: { minWidth: '150px' },
    tracking: { minWidth: '200px' },
    shipping: { minWidth: '400px', },
    billing: { minWidth: '400px', },
    customerPO: { minWidth: '150px' },
    itemSku: { minWidth: '150px' },
    packQuantity: { minWidth: '160px' },
    unitsQuantity: { minWidth: '160px' },
    amount: { minWidth: '160px' },
    finalAmount: { minWidth: '160px' },
    createdAt: { minWidth: '200px' },
    actions: { minWidth: '70px' },
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isBrandsList ? "Search Item Discount" : "Search Product"}
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1000,
                borderCollapse: "collapse", // ensures borders connect
                "& td, & th": {
                  paddingTop: "4px",    // 👈 reduce vertical padding
                  paddingBottom: "4px",
                  borderRight: "1px solid rgba(224, 224, 224, 1)", // vertical line
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none", // no border on last column
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
                        // onClick={(event) => handleClick(event, row.name || row.title)}
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

                            {/* <TableCell sx={{ cursor: "pointer" }} onClick={() => handleEditPricingGroup(row._id)}>
                              <Box display="flex" alignItems="center">
                                <Box
                                  sx={{
                                    ml: 2,
                                  }}
                                >
                                  <Typography fontWeight="600">
                                    {row.productSku}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell> */}

                            <TableCell sx={{ ...columnWidths.actions, ...stickyCellStyle }}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={() => handleCustomerIdClick(row.customerId)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row.customerId, row?.customerId, row?._id)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ cursor: "pointer", ":hover": { color: "blue" } }} onClick={() => handleCustomerIdClick(row.customerId)}>
                              <Typography fontWeight="600">
                                {row.customerId}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ cursor: "pointer" }}>
                              <Typography fontWeight="600" onClick={() => handleCustomerIdClick(row.customerId)}>
                                {customerMap[row.customerId] || "Loading..."}
                              </Typography>
                            </TableCell>

                            {/* <TableCell>
                              <Typography fontWeight="600">
                                {row?.productSku || 'ANY'}
                              </Typography>
                            </TableCell> */}

                            {/* <TableCell>
                              <Typography fontWeight="600">
                                {row.percentage}%
                              </Typography>
                            </TableCell> */}

                            <TableCell>
                              <Typography>{format(new Date(row.updatedAt), 'E, MMM d yyyy')}</Typography>
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

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteItemDiscounts}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Customers Items Discount"}
      />
    </Box>
  );
};

export default ListTable;