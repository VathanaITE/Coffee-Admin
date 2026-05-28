import { useState, useEffect } from 'react';
import { Trash2, Edit, Check, Truck, MapPin, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initialOrderData } from '../services/mockData';
import { Order } from '../models/Order';
import { realTimeDatabase } from '../lib/firebase';
import { getDatabase, ref, child, push,onValue, update, serverTimestamp } from "firebase/database";

export default function Orders() {

    // Example usage in a React component
   const [orders, setOrders] = useState([]);
   const [users, setUsers] = useState([]);

    useEffect(() => {
    // 1. Listen for ORDERS (Real-time)
    const ordersRef = ref(realTimeDatabase, 'orders'); // Ensure path is 'orders'
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Transform Firebase object into an array of Order instances
            const ordersArray = Object.keys(data).map(key => {
                return new Order({ id: key, ...data[key] });
            });
            
            // Sort by latest first (optional but recommended)
            ordersArray.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            setOrders(ordersArray);
        } else {
            setOrders([]);
        }
    });

    // 2. Listen for USERS (Real-time) - Keep your existing user logic
    const usersRef = ref(realTimeDatabase, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const usersArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setUsers(usersArray);
        }
    });

    // Cleanup both listeners when component unmounts
    return () => {
        unsubscribeOrders();
        unsubscribeUsers();
    };
}, []);

    const tableHeaderStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' };
    const tableCellStyle = { padding: '12px', borderBottom: '1px solid #ddd' };

    const handleStatusUpdate = async (orderId, newStatus) => {
        const db = getDatabase();
        const orderRef = ref(db, `orders/${orderId}`); // Adjust path to match your DB structure

        try {
            // 1. Update Firebase first (The source of truth)
            await update(orderRef, {
                status: newStatus,
                lastUpdated: serverTimestamp() // Optional: track when it changed
            });

            // 2. Then update local state so the UI reflects the change immediately
            setOrders(orders.map(order => {
                if (order.id === orderId) {
                    const updatedOrder = new Order(order);
                    updatedOrder.status = newStatus; // Ensure the local object matches
                    updatedOrder.addStatusUpdate(newStatus, `Status updated to ${newStatus}`);
                    return updatedOrder;
                }
                return order;
            }));

            console.log("Firebase updated successfully");
        } catch (error) {
            console.error("Firebase update failed:", error);
            alert("Failed to update status in database.");
        }
    };

    const getStatusBadge = (status) => {
        const order = new Order({ status });
        return {
            backgroundColor: order.getStatusColor(),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
        };
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Order Management</h1>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeaderStyle}>Order ID</th>
                                <th style={tableHeaderStyle}>Items</th>
                                <th style={tableHeaderStyle}>Status</th>
                                <th style={tableHeaderStyle}>Total Price</th>
                                <th style={tableHeaderStyle}>Customer</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td style={tableCellStyle}>
                                        <strong>#{order.id}</strong>
                                        <br />
                                        <small style={{ color: '#666' }}>{order.orderDate}</small>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {order.getItemsSummary()}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={getStatusBadge(order.status)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <strong>{order.getFormattedTotal()}</strong>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {(() => {
                                            const customer = users.find(u => u.id == order.userId);
                                            return (
                                                <>
                                                    <strong>{customer ? customer.name : 'Unknown User'}</strong>
                                                    <br />
                                                    <small>{customer ? customer.email : (order.userId || 'No ID')}</small>
                                                </>
                                            );
                                        })()}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {order.status === 'Preparing' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Ready')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#66bb6a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Mark Ready
                                                </button>
                                            )}
                                            {order.status === 'Ready' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Completed')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#26a69a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Completed
                                                </button>
                                            )}
                                            {order.canCancel() && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Canceled')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#ef5350',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal/Expansion could be added here */}
        </>
    );
}
