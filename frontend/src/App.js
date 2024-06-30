import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import NetworkAndUpgrade from './components/NetworkAndUpgrade';
import GiftSystem from './components/GiftSystem';
import SubscriptionMaintenance from './components/SubscriptionMaintenance';
import Support from './components/Support';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/network" element={<NetworkAndUpgrade />} />
          <Route path="/gift-system" element={<GiftSystem />} />
          <Route path="/subscription" element={<SubscriptionMaintenance />} />
          <Route path="/support" element={<Support />} />
        </Routes>
        <ToastContainer />
      </Layout>
    </Router>
  );
}

export default App;