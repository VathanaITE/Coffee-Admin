import { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';
import { Coffee } from '../models/Coffee';
import { CoffeeUtils } from '../utils/CoffeeUtils';

export default function Products() {
  const [coffees, setCoffees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Create a reference to the 'menu' node in Firebase
    const menuRef = ref(realTimeDatabase, 'menu');

    // Listen for real-time data changes
    const unsubscribe = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      const coffees = CoffeeUtils.fromFirebaseData(data);
      console.log('Coffee data from Firebase (as Coffee models):', coffees);
      setCoffees(coffees);
    });

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, []);
  const navigateToAddProduct = () => {
    navigate('/addproduct');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coffee?")) {
      const coffeeRef = ref(realTimeDatabase, `menu/${id}`);
      remove(coffeeRef)
        .then(() => {
          console.log('Coffee deleted successfully');
        })
        .catch(err => {
          console.error('Delete failed:', err);
          alert('Failed to delete coffee. Please try again.');
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/editproduct/${id}`);
  };

  // Table styling objects
  const tableHeaderStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' };
  const tableCellStyle = { padding: '12px', borderBottom: '1px solid #ddd' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Product Management</h1>
        <button onClick={navigateToAddProduct} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + Add New Product
        </button>
      </div>

      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr>
              <th style={tableHeaderStyle}>Image</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Prices (Size)</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coffees.map((coffee) => (
              <tr key={coffee.id}>
                <td style={tableCellStyle}>
                  {coffee.image ? (
                    <img
                      src={coffee.image}
                      alt={coffee.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f2f2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                      No Image
                    </div>
                  )}
                </td>
                <td style={tableCellStyle}>{coffee.name}</td>
                <td style={tableCellStyle}>{coffee.category}</td>
                <td style={tableCellStyle}>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-line' }}>
                    {coffee.getFormattedPrices()}
                  </div>
                </td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleEdit(coffee.id)} type="button" style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(coffee.id)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}