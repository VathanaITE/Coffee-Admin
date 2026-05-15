import { useState, useEffect } from 'react';
import { ref, push, update, remove, onValue } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';

export default function SizeManagement() {
  const [sizes, setSizes] = useState([]);
  const [newSizeName, setNewSizeName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sizesRef = ref(realTimeDatabase, 'sizes');
    const unsubscribe = onValue(sizesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sizesArray = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || data[key]
        }));
        setSizes(sizesArray);
      } else {
        setSizes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;

    try {
      const sizesRef = ref(realTimeDatabase, 'sizes');
      await push(sizesRef, { name: newSizeName.trim() });
      setNewSizeName('');
    } catch (error) {
      console.error('Error adding size:', error);
      alert('Failed to add size');
    }
  };

  const handleEditSize = (size) => {
    setEditingId(size.id);
    setEditingName(size.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return;

    try {
      const sizeRef = ref(realTimeDatabase, `sizes/${editingId}`);
      await update(sizeRef, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating size:', error);
      alert('Failed to update size');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteSize = async (id) => {
    if (!window.confirm('Are you sure you want to delete this size?')) return;

    try {
      const sizeRef = ref(realTimeDatabase, `sizes/${id}`);
      await remove(sizeRef);
    } catch (error) {
      console.error('Error deleting size:', error);
      alert('Failed to delete size');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Size Management</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Add New Size</h2>
        <form onSubmit={handleAddSize} style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
            placeholder="Size name"
            required
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </form>
      </div>

      <div>
        <h2>Existing Sizes</h2>
        {loading ? (
          <p>Loading sizes...</p>
        ) : sizes.length === 0 ? (
          <p>No sizes found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {editingId === size.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    ) : (
                      size.name
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {editingId === size.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditSize(size)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSize(size.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}