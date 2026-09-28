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
import SearchIcon from '@mui/icons-material/Search';

const API = "http://127.0.0.1:8000/api";

const Search = () => {
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login'); // Redirect to login after logout
  };

  const handleListPage = () => {
    navigate('/list'); // Redirect to login after logout
  };

  const handleRecommendPage = () => {
    navigate('/recommend'); // Redirect to login after logout
  };

  const handleFlowerPage = () => {
    navigate('/flower');
  };

  const handleVitonPage = () => {
    navigate('/viton');
  };

  const handleSemanticSearch = async () => {
    setLoading(true)

    const data = {
      query: search
    };

    try {
      const response = await fetch('http://localhost:8000/api/search/result/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Convert the data to JSON
      });

      const result = await response.json(); 
      setPdfs(result);
      setLoading(false)
    } catch (error) {
      console.error(error);
      setLoading(false);  // Hide loading mask once the request is completed
    }
  };

  // Get the rows to display on the current page
  const displayedRows = pdfs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#3f51b5', boxShadow: 'none' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{marginRight: 5}}>
              PDF Recommend System
            </Typography>
            <Button color="inherit" onClick={handleListPage}>PDFリスト</Button>
            <Button color="inherit" onClick={handleRecommendPage}>おすすめ</Button>
            <Button color="inherit">意味検索</Button>
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
        <Box>
        <center>
          <TextField
            placeholder="Semantic Search PDF using AI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                width: 500,
                height: 38, // Adjust the height
                padding: '0 0px', // Adjust the padding to make it smaller
                margin: '0 10px 0 0'
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSemanticSearch}
            component="label"
          >
            Search
          </Button>
        </center>
        </Box>

        {/* 🔷 Table */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 200 }}>Name</TableCell>
                <TableCell>Summarized Content</TableCell>
                <TableCell sx={{ width: 80 }}>Size (KB)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedRows.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell>{pdf.name}</TableCell>
                  <TableCell>{pdf.content}</TableCell>
                  <TableCell>{(pdf.size / 1024).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={pdfs.length}
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

export default Search;
