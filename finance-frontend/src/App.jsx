import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<Layout><Dashboard /></Layout>}
        />
        <Route
          path="/transactions"
          element={<Layout><Transactions /></Layout>}
        />
        <Route
          path="/transactions/:id"
          element={<Layout><TransactionDetail /></Layout>}
        />
        <Route
          path="/budget"
          element={<Layout><Budget /></Layout>}
        />
        <Route
          path="/analytics"
          element={<Layout><Analytics /></Layout>}
        />
        <Route
          path="/profile"
          element={<Layout><Profile /></Layout>}
        />
        <Route
          path="/categories"
          element={<Layout><Categories /></Layout>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
