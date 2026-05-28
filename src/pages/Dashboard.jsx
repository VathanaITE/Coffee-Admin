import { useEffect, useState } from 'react';
import StatCart from '../components/StatCart';
import { ref, onValue } from 'firebase/database';
import { realTimeDatabase } from '../lib/firebase';
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(realTimeDatabase, 'users');
    const ordersRef = ref(realTimeDatabase, 'orders');
    const productsRef = ref(realTimeDatabase, 'menu');

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      setStats((prev) => ({ ...prev, users: users ? Object.keys(users).length : 0 }));
    });

    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const orders = snapshot.val();
      let orderCount = 0;
      let totalSales = 0;

      if (orders) {
        orderCount = Object.keys(orders).length;
        Object.values(orders).forEach((order) => {
          totalSales += parseFloat(order.totalPrice ?? 0) || 0;
        });
      }

      setStats((prev) => ({ ...prev, orders: orderCount, sales: totalSales }));
    });

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const products = snapshot.val();
      const productCount = products ? Object.keys(products).length : 0;
      setStats((prev) => ({ ...prev, products: productCount }));
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const cards = [
    { title: 'Users', subtitle: 'Active users', value: stats.users, icon: <Users size={36} />, bgColor: 'linear-gradient(135deg,#ffffff, #f8fbff)', borderColor: '#3b82f6' },
    { title: 'Orders', subtitle: 'Open orders', value: stats.orders, icon: <ShoppingCart size={36} />, bgColor: 'linear-gradient(135deg,#ffffff, #f3faf6)', borderColor: '#10b981' },
    { title: 'Products', subtitle: 'Available', value: stats.products, icon: <Package size={36} />, bgColor: 'linear-gradient(135deg,#ffffff, #fff8f1)', borderColor: '#f59e0b' },
    { title: 'Sales', subtitle: 'Total revenue', value: `$${stats.sales.toFixed(2)}`, icon: <DollarSign size={36} />, bgColor: 'linear-gradient(135deg,#ffffff, #f6f4ff)', borderColor: '#8b5cf6' }
  ];

 return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffffe2' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div >
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ fontSize: '1.05rem', color: '#475569' }}>Welcome back! Here's your business overview.</p>
        </div>

        <div className="dashboard-grid">
          {loading ? (
            <div className="dashboard-loading-card">
              Loading dashboard metrics…
            </div>
          ) : (
            cards.map((card) => <StatCart key={card.title} {...card} />)
          )}
        </div>
      </div>
    </div>
  );
}
