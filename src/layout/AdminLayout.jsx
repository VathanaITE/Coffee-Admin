import { Outlet, Link, useNavigate } from "react-router-dom";
import { Coffee, LayoutDashboard, ListOrdered, Package, User2Icon, LogOut, Settings, DollarSign, CableIcon, TagIcon, ArrowBigDownIcon, SquareArrowRightExit, LucideSquareArrowRightEnter } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { FaExpandArrowsAlt } from 'react-icons/fa'; 


export default function AdminLayout() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
       if (window.confirm("Are you sure you to logout?")) {
          await logout()
          .then(() => {
            console.log('Logout successful');
          })
          navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", margin: "0px" }}>
      
      {/* Sidebar */}
      <aside style={{ position: "fixed", left: 0, top: 0, width: "250px", height: "100vh", backgroundColor: "#47330f", color: "white", padding: "10px",
         display: "flex", flexDirection: "column", overflowY: "auto"}}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Coffee size={28} />
              <div>
                <h2 style={{ margin: 0 }}>Admin Panel</h2>
                {currentUser && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#d1d5db' }}>{currentUser.email}</p>
                )}
              </div>
            </div>
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Link to="/" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <LayoutDashboard /> Dashboard
            </Link>
            <Link to="/products" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <Package /> Products
            </Link>

             <Link to="/orders" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <ListOrdered /> Orders
            </Link>

            <Link to="/users" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <User2Icon /> Users
            </Link>

            <Link to="/categories" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <TagIcon /> Categories
            </Link>
            <Link to="/sizes" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px", }}>
              <FaExpandArrowsAlt size={20} /> Sizes
            </Link>

             <Link to="/settings" style={{ color: "white", textDecoration: "none", display: "flex", gap: "10px" }}>
              <Settings /> Settings
            </Link>


          </nav>
        </div>

        
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#dc2626',
               color: 'white', border: 'none', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', 
               width: '100%', justifyContent: 'center',marginBottom: '30px' }}
          >
            <LogOut size={18} /> Logout
          </button>
        
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: "260px", padding: "30px", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
        {/* The Outlet is where your Dashboard or Products page will render */}
        <Outlet /> 
      </main>
      
    </div>
  );
}