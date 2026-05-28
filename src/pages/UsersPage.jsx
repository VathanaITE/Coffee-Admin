import { useState, useEffect } from 'react';
import { Trash2, Edit, BookAIcon, BookAlertIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Firebase
  useEffect(() => {
    const usersRef = ref(realTimeDatabase, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array format
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        console.log('Users from Firebase:', usersArray);
        setUsers(usersArray);
      } else {
        console.log('No users found in Firebase');
        setUsers([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const userRef = ref(realTimeDatabase, `users/${id}`);
      remove(userRef)
        .then(() => {
          console.log('User deleted successfully');
        })
        .catch(err => {
          console.error('Delete failed:', err);
          alert('Failed to delete user. Please try again.');
        });
    }
  };

  // const handleEdit = (id) => {
  //   navigate(`/edit-user/${id}`);
  // };
  const showHistrory = (id) => {
    navigate(`/user-history/${id}`);

  }

  const tableHeaderStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' };
  const tableCellStyle = { padding: '12px', borderBottom: '1px solid #ddd' };
    

    return (
        <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>User Management</h1>
          {/* <button onClick={() => navigate('/add-user')} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            + Add New User
          </button> */}
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No users found. <br />
              Click "+ Add New User" to create your first user.
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                  <th style={tableHeaderStyle}>UserName</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={tableCellStyle}>{user.name}</td>
                    <td style={tableCellStyle}>{user.email}</td>
                    <td style={tableCellStyle}>
                      <button onClick={() => showHistrory(user.id)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
                        <BookAlertIcon size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
        </>
    )
}
