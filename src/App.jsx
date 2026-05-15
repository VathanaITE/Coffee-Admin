
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import UsersPage from "./pages/UsersPage";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import CategoryManagement from "./pages/CategoryManagement";
import SizeManagement from "./pages/SizeManagement";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import UserHistory from "./pages/UserHistory";
<link rel="stylesheet" href="https://cdn.lineicons.com/5.1/line/lineicons.css" />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="editproduct/:coffeeId" element={<EditProduct />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="edit-user/:userId" element={<EditUser />} />
          <Route path="user-history/:userId" element={<UserHistory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="sizes" element={<SizeManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
