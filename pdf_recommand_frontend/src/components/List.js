import React, { useEffect, useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TablePagination,
  TableHead, TableRow, Paper, Backdrop, CircularProgress
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UploadFileIcon from "@mui/icons-material/UploadFile";

const API = "http://127.0.0.1:8000/api";

const List = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);  // current page
  const [rowsPerPage, setRowsPerPage] = useState(5);  // number of rows per page

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);  // Reset to first page when rows per page changes
  };


  const fetchPDFs = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/pdfs/");
    const data = await res.json();
    setPdfs(data);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
    } else {
      // Decode JWT token (you can use a library like jwt-decode if necessary)
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUsername(decoded.identity);
     fetchPDFs();
    }
  }, [navigate]);

  const handleUpload = async (e) => {
    setLoading(true);
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData
      });

      // Check if the response is successful
      if (response.ok) {
        const responseData = await response.json();
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);  // Hide loading mask once the request is completed
    }

    fetchPDFs();
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/delete/${id}/`, {
      method: "DELETE",
    });

    fetchPDFs(); // refresh
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login'); // Redirect to login after logout
  };

  const handleRecommendPage = () => {
    navigate('/recommend'); // Redirect to login after logout
  };

  const handleSearchPage = () => {
    navigate('/search'); // Redirect to login after logout
  };

  const handleFlowerPage = () => {
    navigate('/flower');
  };

  const handleVitonPage = () => {
    navigate('/viton');
  };

  const filtered = pdfs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get the rows to display on the current page
  const displayedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#3f51b5', boxShadow: 'none' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{marginRight: 5}}>
              PDF Recommend System
            </Typography>
            <Button color="inherit">PDF List</Button>
            <Button color="inherit" onClick={handleRecommendPage}>Recommend</Button>
            <Button color="inherit" onClick={handleSearchPage}>Semantic Search</Button>
            <Button color="inherit" onClick={handleFlowerPage}>Flower Classification</Button>
            <Button color="inherit" onClick={handleVitonPage}>Virtual Try-On</Button>
          </Box>
          <Box sx={{ display: 'fixed' }}>
            <Button color="inherit" startIcon={<AccountCircleIcon />}>
              Profile
            </Button>
            <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
     <Box sx={{ p: 3 }}>

        {/* 🔷 Actions */}
        <Box display="flex" justifyContent="space-between">

          <TextField
            placeholder="Search PDF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />

          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            component="label"
          >
            Upload PDF
            <input hidden type="file" onChange={handleUpload} />
          </Button>
        </Box>

        {/* 🔷 Table */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 200 }}>Name</TableCell>
                <TableCell>Summarized Content</TableCell>
                <TableCell sx={{ width: 80 }}>Size (KB)</TableCell>
                <TableCell sx={{ width: 80 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedRows.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell>{pdf.name}</TableCell>
                  <TableCell>{pdf.content}</TableCell>
                  <TableCell>{(pdf.size / 1024).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      onClick={() => handleDelete(pdf.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

      </Box>
      {/* Backdrop component with CircularProgress for loading spinner */}
      <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1,}} open={loading}>
          <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default List;
