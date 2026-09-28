import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Recommend from './components/Recommend';
import List from './components/List';
import Search from './components/Search';
import Flower from './components/Flower';
import Viton from './components/Viton';

import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/list" element={<List />} />
        <Route path="/search" element={<Search />} />
        <Route path="/flower" element={<Flower />} />
        <Route path="/viton" element={<Viton />} />
      </Routes>
    </Router>
  );
};

export default App;