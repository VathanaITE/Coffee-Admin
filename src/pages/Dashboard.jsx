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
    { title: 'Users', value: stats.users, icon: <Users size={32} />, bgColor: '#ffffff', borderColor: '#3b82f6' },
    { title: 'Orders', value: stats.orders, icon: <ShoppingCart size={32} />, bgColor: '#ffffff', borderColor: '#10b981' },
    { title: 'Products', value: stats.products, icon: <Package size={32} />, bgColor: '#ffffff', borderColor: '#f59e0b' },
    { title: 'Sales', value: `$${stats.sales.toFixed(2)}`, icon: <DollarSign size={32} />, bgColor: '#ffffff', borderColor: '#8b5cf6' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f9ff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div >
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ fontSize: '1.05rem', color: '#475569' }}>Welcome back! Here's your business overview.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px', marginBottom: '28px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '32px', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)', textAlign: 'center', color: '#64748b' }}>
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
