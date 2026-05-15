// Order model class to structure order data
import { ref, get } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';

export class Order {
  constructor(data = {}) {
    this.id = data.orderId || data.id || '';
    this.userId = data.userId || data.uId || ''; 
    this.orderDate = data.timestamp || data.orderDate || new Date().toISOString();
    this.items = data.items ? (typeof data.items === 'string' ? JSON.parse(data.items) : data.items) : [];
    this.status = data.status || 'Pending';
    this.totalPrice = data.totalPrice || 0;
    this.customerName = data.userName || data.customerName || '';
    this.paymentMethod = data.paymentMethod || 'Cash';
    this.orderType = data.orderType || '';
    this.statusHistory = data.statusHistory || [];
  }

  // Get formatted total price
  getFormattedTotal() {
    return `$${parseFloat(this.totalPrice).toFixed(2)}`;
  }

  // Get order status with color coding
  getStatusColor() {
    const colors = {
      'Pending': '#ffa726',
      'Preparing': '#42a5f5',
      'Ready': '#66bb6a',
      'Cancelled': '#ef5350'
    };
    return colors[this.status] || '#9e9e9e';
  }

  // Check if order can be cancelled
  canCancel() {
    return ['Pending', 'Preparing'].includes(this.status);
  }

  // Check if order is completed
  isCompleted() {
    return this.status === 'Delivered';
  }

  // Add status update to history
  addStatusUpdate(status, note = '') {
    this.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note
    });
    this.status = status;
  }

  // Get items summary
  getItemsSummary() {
    console.log("Debug Items:", this.items);
    return this.items.map(item =>
      `${item.quantity}x ${item.coffeeName}${item.size ? ` (${item.size.charAt(0).toUpperCase()})` : ''}`
    ).join(', ');
  }

    // Static method to fetch all orders from Firebase
  static async fetchAll() {
    try {
      const ordersRef = ref(realTimeDatabase, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Assuming data is an object like { orderId1: {...}, orderId2: {...} }
        return Object.keys(data).map(key => new Order({ id: key, ...data[key] }));
      } else {
        console.log('No orders found in Firebase.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching orders from Firebase:', error);
      throw error;
    }
  }
}