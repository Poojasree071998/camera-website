import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { fetchAdminProducts, fetchAllOrders } from '../api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [pData, oData] = await Promise.all([
                    fetchAdminProducts(),
                    fetchAllOrders()
                ]);
                setProducts(pData);
                setOrders(oData);
            } catch (e) {
                console.error('AdminDashboard: Error loading data', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const activeVendors = new Set(products.map(p => p.vendorEmail)).size;
    const pendingApprovals = products.filter(p => !p.isApproved).length;
    const lowStockAlerts = products.filter(p => (p.stock || 0) < 5);

    // Get top 5 selling products (by volume from orders)
    const productSales = {};
    orders.forEach(o => {
        (o.items || []).forEach(item => {
            const id = item.productId || item.productName;
            productSales[id] = (productSales[id] || 0) + (item.quantity || 0);
        });
    });
    
    const topSellers = products
        .map(p => ({
            name: p.name,
            price: `₹${Number(p.price).toLocaleString()}`,
            sales: productSales[p._id] || productSales[p.name] || 0
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    const links = [
        { label: 'Overview', path: '/admin', icon: '📊' },
        { label: 'Vendors', path: '/admin/vendors', icon: '🏪' },
        { label: 'Products', path: '/admin/products', icon: '📸' },
        { label: 'Orders', path: '/admin/orders', icon: '📜' },
        { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
        { label: 'Payments', path: '/admin/payments', icon: '💳' },
        { label: 'Chats',         path: '/admin/chats',         icon: '💬' },
        { label: 'Employees',     path: '/admin/users',         icon: '👤' },
        { label: 'Reports', path: '/admin/reports', icon: '📈' },
        { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    const revenueByMonth = orders.reduce((acc, o) => {
        const month = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (o.totalAmount || 0);
        return acc;
    }, {});

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueData = months.map(month => ({
        month,
        revenue: revenueByMonth[month] || 0
    }));

    const categoryCounts = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // Dynamic Top Vendors
    const vendorMetrics = {};
    products.forEach(p => {
        if (!vendorMetrics[p.vendorEmail]) {
            vendorMetrics[p.vendorEmail] = { name: p.vendorName || p.vendorEmail, products: 0, revenue: 0 };
        }
        vendorMetrics[p.vendorEmail].products += 1;
    });

    orders.forEach(o => {
        (o.items || []).forEach(item => {
            if (vendorMetrics[item.vendorEmail]) {
                vendorMetrics[item.vendorEmail].revenue += (item.price * item.quantity);
            }
        });
    });

    const topVendors = Object.values(vendorMetrics)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const COLORS = ['#d4af37', '#3b82f6', '#10b981', '#ef4444'];

    return (
        <DashboardLayout title="System Intelligence" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in">
                {/* Live Stats Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '25px' }}>
                <StatCard label="Total Revenue" value={totalRevenue.toLocaleString()} prefix="₹" growth={12} color="#d4af37" />
                <StatCard label="Total Orders" value={orders.length.toString()} growth={5} />
                <StatCard label="Active Vendors" value={activeVendors.toString()} growth={8} />
                <StatCard label="Pending Approvals" value={pendingApprovals.toString()} color={pendingApprovals > 0 ? "#ff4d4d" : "var(--accent)"} />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-morphism" style={{ padding: '30px', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '15px', letterSpacing: '2px' }}>REVENUE GROWTH</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-morphism" style={{ padding: '30px', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '15px', letterSpacing: '2px' }}>SALES BY CATEGORY</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%" cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px' }}>TOP 5 SELLING CAMERAS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {topSellers.map((cam, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{cam.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{cam.price}</div>
                                </div>
                                <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{cam.sales} units</div>
                            </div>
                        ))}
                        {topSellers.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No sales recorded yet.</p>}
                    </div>
                </div>

                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px' }}>TOP 5 VENDORS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {topVendors.map((vendor, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{vendor.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{vendor.products} Products</div>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>₹{vendor.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                        {topVendors.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No vendors with sales yet.</p>}
                    </div>
                </div>

            </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
