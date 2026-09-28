import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '0 20px',
  },
  formContainer: {
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    marginBottom: '20px',
    color: '#3f51b5',
    fontWeight: '600',
    fontSize: '24px',
  },
  textField: {
    marginBottom: '20px',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
  },
}));

const Login = () => {
  const classes = useStyles();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password,
      });
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/list'); // Redirect to dashboard
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : 'Login failed');
    }
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="xs" className={classes.formContainer}>
        <Typography variant="h5" gutterBottom>
          PDF Recommend Sytem Login
        </Typography>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          style={{ marginTop: '20px' }}
        >
          Login
        </Button>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          onClick={() => navigate('/register')}
          style={{ marginTop: '10px' }}
        >
          Don't have an account? Register
        </Button>
      </Container>
    </div>
  );
};

export default Login;