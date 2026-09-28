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
  const [label, setLabel] = useState("No prediction");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const [summarizedText, setSummarizedText] = useState('');
  const [recommendedText, setRecommendedText] = useState('');
  const [recommendations, setRecommendations] = useState([]);
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

  const handleRecommendPage = () => {
    navigate('/recommend'); // Redirect to login after logout
  };

  const handleVitonPage = () => {
    navigate('/viton');
  };

  const handleImageUpload = async (e) => {
    setLoading(true)

    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null;
    if (image) {
      URL.revokeObjectURL(image);
    }

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/flower/upload/', {
        method: "POST",
        body: formData
      });

      // Check if the response is successful
      if (response.ok) {
        const responseData = await response.json();
        const class_name = responseData.class_name;
        const confidence = responseData.confidence;
        setLabel("Flower Name: " + class_name + "\nPredict: " + confidence.toFixed(2));
        setLoading(false);  // Hide loading mask once the request is completed
      } else {
      }
    } catch (error) {
        setLoading(false);  // Hide loading mask once the request is completed
    } finally {
      setLoading(false);  // Hide loading mask once the request is completed
    }

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
              PDF Recommend System
            </Typography>
            <Button color="inherit" onClick={handleListPage}>PDF List</Button>
            <Button color="inherit" onClick={handleRecommendPage}>Recommend</Button>
            <Button color="inherit" onClick={handleSearchPage}>Semantic Search</Button>
            <Button color="inherit">Flower Classification</Button>
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
      <Box
        sx={{
          paddingTop: 2,
          backgroundColor: '#f7f7f7',
        }}
      >
        <Grid container spacing={2} sx={{height: '100%' }}>
          {/* Left Panel */}
          <Grid item xs={12} md={4} sx={{ flex: 1, }}>
          </Grid>
          <Grid item xs={12} md={4} sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', height: '100%' }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Flower Classification
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
                Upload Flower Image
                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                  accept=".jpeg, .jpg, .png"
                />
              </Button>

              {/* Backdrop component with CircularProgress for loading spinner */}
              <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1,}} open={loading}>
                  <CircularProgress color="inherit" />
              </Backdrop>

              <Divider sx={{ margin: '8px 0' }} />

              <Card
                sx={{
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ccc"
                }}
              >
                <CardContent sx={{ width: "100%", textAlign: "center" }}>
                  {image ? (
                    <img
                      key={image}
                      src={image}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "350px",
                        objectFit: "contain",
                        borderRadius: "8px"
                      }}
                    />
                  ) : (
                    <Typography color="textSecondary">
                      No image uploaded
                    </Typography>
                  )}
                </CardContent>
              </Card>
              <Divider sx={{ margin: '8px 0' }} />
              <Typography sx={{ marginTop: 2, color: 'blue', textAlign: "center" }}>
                {label}
              </Typography>
            </Paper>
          </Grid>

          {/* Right Panel */}
          <Grid item xs={12} md={4} sx={{ flex: 1, }}>
          </Grid>
        </Grid>
      </Box>
    </Box>  
  );
};

export default Dashboard;
