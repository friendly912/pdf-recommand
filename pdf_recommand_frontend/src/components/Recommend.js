import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, 
  Card,
  CardContent,
  Divider,
  IconButton,
  CircularProgress, Backdrop, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TablePagination,
  TableHead, TableRow,
  Grid, Button, Paper, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { CloudUpload } from '@mui/icons-material';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [pdf, setPdf] = useState(null);
  const [summarizedText, setSummarizedText] = useState('');
  const [recommendedText, setRecommendedText] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [previewText, setPreviewText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
    } else {
      // Decode JWT token (you can use a library like jwt-decode if necessary)
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUsername(decoded.identity);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login'); // Redirect to login after logout
  };

  const handleListPage = () => {
    navigate('/list'); // Redirect to login after logout
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

  const handlePdfUpload = async (e) => {
    setLoading(true)
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await fetch('http://localhost:8000/api/recommend/upload/', {
        method: "POST",
        body: formData
      });

      // Check if the response is successful
      if (response.ok) {
        const responseData = await response.json();
        setSummarizedText(responseData.summary);
      } else {
      }
    } catch (error) {
        setLoading(false);  // Hide loading mask once the request is completed
    } finally {
      setLoading(false);  // Hide loading mask once the request is completed
    }

  };

  const handleSummarizedTextChange = (event) => {
    // setSummarizedText(event.target.value);
  };

  const fetchRecommendations = async (e) => {
    setLoading(true)

    const data = {
      query: summarizedText
    };

    try {
      const response = await fetch('http://localhost:8000/api/recommend/similarity/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Convert the data to JSON
      });

      const result = await response.json(); 
      setRecommendations(result);
      setLoading(false)
      // setResponse(response.data);
    } catch (error) {
      console.error(error);
      setLoading(false);  // Hide loading mask once the request is completed
    }
  };

  // Handle row click event to display the summary
  const handleRowClick = (pdf) => {
    setRecommendedText(pdf.content);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#3f51b5', boxShadow: 'none' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{marginRight: 5}}>
              PDFおすすめシステム
            </Typography>
            <Button color="inherit" onClick={handleListPage}>PDFリスト</Button>
            <Button color="inherit">おすすめ</Button>
            <Button color="inherit" onClick={handleSearchPage}>意味検索</Button>
          </Box>
          <Box sx={{ display: 'fixed' }}>
            <Button color="inherit" startIcon={<AccountCircleIcon />}>
              プロフィール
            </Button>
            <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          padding: 2,
          backgroundColor: '#f7f7f7',
        }}
      >
        <Grid container spacing={2} sx={{height: '100%' }}>
          {/* Left Panel */}
          <Grid item xs={12} md={4} sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', height: '100%' }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                PDFをアップロード
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                アップロード
                <input
                  type="file"
                  hidden
                  onChange={handlePdfUpload}
                  accept=".pdf"
                />
              </Button>

              {/* Backdrop component with CircularProgress for loading spinner */}
              <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1,}} open={loading}>
                  <CircularProgress color="inherit" />
              </Backdrop>

              <Divider sx={{ margin: '16px 0' }} />

              <TextField
                label="要約テキスト"
                variant="outlined"
                multiline
                rows={17}
                value={summarizedText}
                onChange={handleSummarizedTextChange}
                sx={{
                  width: '100%',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  marginTop: 2,
                }}
              />
            </Paper>
          </Grid>

          {/* Middle Panel */}
          <Grid item xs={12} md={4} sx={{ flex: 1, }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', height: '100%' }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                おすすめ
              </Typography>
              <Button
                variant="contained"
                onClick={fetchRecommendations}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                おすすめ
              </Button>

              {/* 🔷 Table */}
              <TableContainer component={Paper} sx={{ marginTop: 2, mt: 3 }}>
                <Table>

                  <TableBody>
                    {recommendations.map((rec) => (
                      <TableRow key={rec.id} onClick={() => handleRowClick(rec)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{rec.name}</TableCell>
                        <TableCell align="center" sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={rec.similarity_rate} // Progress bar based on similarity rate
                            sx={{ width: '100%' }}
                          />
                          <Typography>
                            {rec.similarity_rate}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Panel */}
          <Grid item xs={12} md={4} sx={{ flex: 1, }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', height: '100%' }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                おすすめ文書
              </Typography>
              <TextField
                label="要約テキスト"
                variant="outlined"
                multiline
                rows={21}
                value={recommendedText}
                sx={{
                  width: '100%',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>  
  );
};

export default Dashboard;
