import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { realTimeDatabase } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { Order } from '../models/Order';

export default function UserHistory() {
    const { userId } = useParams();
    const [userHistory, setUserHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

// Inside your component
    useEffect(() => {
    if (!userId) return;
    // Fetch user details (optional, for displaying user name)
    const userRef = ref(realTimeDatabase, `users/${userId}`);

    const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setUser(userData);
    });

    // Create a query: Look at 'orders', order by 'userId', and match the current userId
    const historyQuery = query(
        ref(realTimeDatabase, 'orders'),
        orderByChild('userId'), 
        equalTo(userId)
    );

    const unsubscribe = onValue(historyQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
        const ordersArray = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
        }));
        setUserHistory(ordersArray.reverse()); // Newest first
        } else {
        setUserHistory([]);
        }
        setLoading(false);
    });
    return () => {
        unsubscribe();
        unsubscribeUser();
    };
    }, [userId]);

    const getItemsHistory = (items) => {
        if (!items || items.length === 0) return "No items";
        const summary = items.map(item => `${item.quantity}x ${item.coffeeName}`).join(', ');
        return summary.length > 50 ? summary.substring(0, 47) + '...' : summary;
    }

     return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: '24px', fontWeight: 'bold' }}>{user?.name || 'User'} Orders History</h2>
        
        {loading ? (
        <p>Loading your history...</p>
        ) : userHistory.length === 0 ? (    
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No orders found.</p>
        </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userHistory.map((order) => (
            <div key={order.id} style={{
                border: '1px solid #eee',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                    <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>ORDER ID</span>
                    <span style={{ fontWeight: '600' }}>#{order.id.substring(0, 8)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    backgroundColor: '#e3f2fd', 
                    color: '#1976d2',
                    fontWeight: 'bold' 
                    }}>
                    {order.status}
                    </span>
                </div>
                </div>

                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>
                        {getItemsHistory(order.items) || "View items..."}
                    </p>
                    <small style={{ color: '#aaa' }}>Ordered on: {new Date(order.orderDate).toLocaleDateString()}</small>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    ${order.totalPrice?.toFixed(2)}
                </div>
                </div>
            </div>
            ))}
        </div>
        )}
    </div>
    );
}