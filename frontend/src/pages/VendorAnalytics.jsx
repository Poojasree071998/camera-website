import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const vendorLinks = [
    { label: 'Dashboard', path: '/vendor', icon: '📊' },
    { label: 'Products', path: '/vendor/products', icon: '📸' },
    { label: 'Orders', path: '/vendor/orders', icon: '📜' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments', path: '/vendor/payments', icon: '💳' },
];

const revenueData = [
    { month: 'Oct', revenue: 18000 }, { month: 'Nov', revenue: 22000 },
    { month: 'Dec', revenue: 35000 }, { month: 'Jan', revenue: 28000 },
    { month: 'Feb', revenue: 31000 }, { month: 'Mar', revenue: 41500 },
];

const topProducts = [
    { name: 'Sony A7 IV', sales: 42 }, { name: 'Canon R5', sales: 28 },
    { name: 'Sony GM Lens', sales: 19 }, { name: 'Nikon D850', sales: 14 }, { name: 'DJI RS3', sales: 9 },
];

const VendorAnalytics = () => (
    <DashboardLayout title="Analytics" sidebarLinks={vendorLinks} userRole="Vendor">
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {[
                { label: 'Total Revenue', value: '$175,500', sub: '↑ 18% this month', color: 'var(--accent)' },
                { label: 'Units Sold', value: '312', sub: '↑ 12% this month', color: '#4caf50' },
                { label: 'Conversion Rate', value: '4.2%', sub: 'From 7.4k views', color: '#00bcd4' },
                { label: 'Avg Order Value', value: '$2,841', sub: '↑ 5% vs last month', color: 'var(--text-main)' },
            ].map((k, i) => (
                <div key={i} className="glass-morphism" style={{ padding: '15px 20px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-main)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '600' }}>{k.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: k.color, marginBottom: '4px' }}>{k.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4caf50', fontWeight: '600' }}>{k.sub}</div>
                </div>
            ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>
            <div className="glass-morphism" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', letterSpacing: '1px' }}>REVENUE TREND</h3>
                <div style={{ height: '260px' }}>
                    <ResponsiveContainer>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="vendorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                            <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#vendorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-morphism" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', letterSpacing: '1px' }}>TOP PRODUCTS</h3>
                <div style={{ height: '260px' }}>
                    <ResponsiveContainer>
                        <BarChart data={topProducts} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
                            <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} width={80} />
                            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                            <Bar dataKey="sales" fill="#d4af37" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </DashboardLayout>
);

export default VendorAnalytics;
