/**
 * api.js — Dual-mode API helper
 *
 * - Real JWT token  → calls backend at http://localhost:5000
 * - Demo token      → uses localStorage as a fake DB
 *
 * Demo tokens are any token starting with "demo_token"
 *
 * localStorage keys:
 *   ls_products     — vendor products
 *   ls_orders       — customer orders
 *   ls_transactions — payment transactions
 */

const BASE = 'http://localhost:5000/api';
const LS_PRODUCTS = 'ls_products';
const LS_ORDERS = 'ls_orders';
const LS_TRANSACTIONS = 'ls_transactions';
const LS_CART = 'ls_cart';
const LS_INVENTORY = 'ls_inventory';
const LS_VENDORS = 'ls_vendors';
const LS_REVIEWS = 'ls_reviews';
const LS_SERVICES = 'ls_services';
const LS_NOTIFICATIONS = 'ls_notifications';

const SEED_VENDORS = [
    { id: 'V-101', name: 'Alpha Photo Solutions', email: 'vendor@gmail.com', password: '123', status: 'Active', rating: '4.8', revenue: 1540200 },
    { id: 'V-102', name: 'Canon Pro Store', email: 'canon@pro.com', status: 'Active', rating: '4.9', revenue: 2105000 },
    { id: 'V-103', name: 'Nikon Enthusiast Hub', email: 'nikon@hub.com', status: 'Pending', rating: '4.7', revenue: 845000 },
    { id: 'V-104', name: 'Sony Lens Master', email: 'sony@lens.com', status: 'Active', rating: '4.6', revenue: 1250000 },
];

const SEED_TECHNICIANS = [
    { name: 'Expert Tech', email: 'technician@lenscraft.com', role: 'technician', status: 'Active', rating: '4.9' },
    { name: 'Arun Kumar', email: 'tech@example.com', role: 'technician', status: 'Active', rating: '4.9' },
    { name: 'Vijay Kumar', email: 'tech2@example.com', role: 'technician', status: 'Active', rating: '4.7' },
];

const SEED_PRODUCTS = [
    {
        _id: 'prod-001',
        name: 'Sony A7 IV Professional',
        brand: 'Sony',
        price: 210000,
        category: 'Mirrorless',
        isApproved: true,
        vendorEmail: 'vendor@gmail.com',
        vendorName: 'Alpha Photo Solutions',
        stock: 12,
        rating: 4.8,
        description: '33MP Full-Frame Exmor R CMOS Sensor. 759-Point Fast Hybrid AF System.',
        images: [
            '/images/sony_a7_iv.png',
            'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1000&q=80'
        ],
        features: ['33MP Full-Frame Exmor R CMOS Sensor', '759-Point Fast Hybrid AF System', '4K 60p 10-bit 4:2:2 Video'],
        warranty: '2 Years Manufacturer Warranty',
        createdAt: new Date('2026-02-15').toISOString()
    },
    {
        _id: 'prod-002',
        name: 'Canon EOS R6 Mark II',
        brand: 'Canon',
        price: 215000,
        category: 'Mirrorless',
        isApproved: true,
        vendorEmail: 'canon@pro.com',
        vendorName: 'Canon Pro Store',
        stock: 8,
        rating: 4.9,
        description: '24.2MP Full-Frame CMOS Sensor. 4K60p 10-Bit Internal Video.',
        images: [
            '/images/canon_eos_r5.png',
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80'
        ],
        features: ['24.2MP Full-Frame CMOS Sensor', '4K60p 10-Bit Internal Video', 'Dual Pixel CMOS AF II'],
        warranty: '2 Years Manufacturer Warranty',
        createdAt: new Date('2026-02-20').toISOString()
    },
    {
        _id: 'prod-003',
        name: 'Nikon Z8 Flagship',
        brand: 'Nikon',
        price: 345000,
        category: 'Mirrorless',
        isApproved: true,
        vendorEmail: 'nikon@hub.com',
        vendorName: 'Nikon Enthusiast Hub',
        stock: 5,
        rating: 4.7,
        description: '45.7MP Stacked CMOS Sensor. EXPEED 7 Image Processor.',
        images: [
            '/images/nikon_z9.png',
            'https://images.unsplash.com/photo-1512790182412-b19e6d12bf05?w=1000&q=80'
        ],
        features: ['45.7MP Stacked CMOS Sensor', 'EXPEED 7 Image Processor', '8K 60p Video Recording'],
        warranty: '1 Year Brand Warranty',
        createdAt: new Date('2026-03-01').toISOString()
    },
    {
        _id: 'prod-004',
        name: 'Sony 24-70mm f/2.8 GM II',
        brand: 'Sony',
        price: 195000,
        category: 'Lenses',
        isApproved: true,
        vendorEmail: 'vendor@gmail.com',
        vendorName: 'Alpha Photo Solutions',
        stock: 15,
        rating: 5.0,
        description: 'Ultimate G Master standard zoom lens. Lightweight and compact.',
        images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27fac?w=1000&q=80'],
        createdAt: new Date('2026-03-05').toISOString()
    },
    {
        _id: 'prod-005',
        name: 'Fujifilm X-T5 Cinematic',
        brand: 'Fujifilm',
        price: 165000,
        category: 'Mirrorless',
        isApproved: true,
        vendorEmail: 'vendor@lenscraft.com',
        vendorName: 'Global Imaging',
        stock: 7,
        rating: 4.8,
        description: '40.2MP APS-C X-Trans CMOS 5 HR Sensor. 4K 60p and 6.2K 30p Video.',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80'],
        createdAt: new Date('2026-03-08').toISOString()
    },
    {
        _id: 'prod-006',
        name: 'DJI Mavic 3 Pro',
        brand: 'DJI',
        price: 185000,
        category: 'Drones',
        isApproved: true,
        vendorEmail: 'vendor@lenscraft.com',
        vendorName: 'Global Imaging',
        stock: 4,
        rating: 4.9,
        description: '4/3 CMOS Hasselblad Camera. Dual Tele Cameras. 43-min Max Flight Time.',
        images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1000&q=80'],
        createdAt: new Date('2026-03-10').toISOString()
    }
];


const SEED_ORDERS = [
    {
        _id: 'ORD-1001',
        customerName: 'John Doe',
        customerEmail: 'customer@gmail.com',
        totalAmount: 189999,
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: new Date('2026-02-28').toISOString(),
        items: [{ productId: 'prod-001', productName: 'Sony A7 IV', quantity: 1, price: 189999, vendorEmail: 'vendor@gmail.com' }]
    },
    {
        _id: 'ORD-1002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        totalAmount: 215000,
        status: 'shipped',
        paymentStatus: 'paid',
        createdAt: new Date('2026-03-05').toISOString(),
        items: [{ productId: 'prod-002', productName: 'Canon EOS R6 Mark II', quantity: 1, price: 215000, vendorEmail: 'canon@pro.com' }]
    },
    {
        _id: 'ORD-1003',
        customerName: 'Robert Wilson',
        customerEmail: 'robert@vision.com',
        totalAmount: 345000,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date('2026-03-10').toISOString(),
        items: [{ productId: 'prod-003', productName: 'Nikon Z8', quantity: 1, price: 345000, vendorEmail: 'nikon@hub.com' }]
    }
];

const SEED_REVIEWS = [
    { userName: 'Amit K.', rating: 5, comment: 'Exceptional service and timely delivery of my Sony A7 IV!', createdAt: new Date('2026-03-02').toISOString() },
    { userName: 'Priya R.', rating: 4, comment: 'Great prices on lenses. Highly recommended.', createdAt: new Date('2026-03-05').toISOString() },
    { userName: 'Vijay M.', rating: 5, comment: 'Found the rare Nikon Z9 here when it was out of stock everywhere.', createdAt: new Date('2026-03-08').toISOString() }
];

const SEED_INVENTORY = SEED_PRODUCTS.map(p => ({
    id: p._id,
    name: p.name,
    sku: `SKU-${p._id.toUpperCase()}`,
    stock: p.stock,
    price: p.price,
    status: p.stock > 0 ? 'In Stock' : 'Out of Stock'
}));

// ── Helpers ──────────────────────────────────────────────────────

const getToken = () => {
    try {
        return localStorage.getItem('token') || '';
    } catch (e) {
        return '';
    }
};
const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error('API: Error parsing user', e);
        return {};
    }
};
const isDemo = () => getToken().startsWith('demo_token');

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

const shortId = (id) => typeof id === 'string' ? id.slice(-6).toUpperCase() : 'N/A';

// LocalStorage helpers
const lsGet = (key) => {
    try {
        const val = localStorage.getItem(key);
        if (val) {
            const parsed = JSON.parse(val);
            // Purge check for low-quality dummy data (e.g. "FHYTRES", "sssss")
            if (key === LS_PRODUCTS && Array.isArray(parsed)) {
                const hasDummy = parsed.some(p => 
                    (p.name && p.name.toUpperCase().includes('FHYTRES')) || 
                    (p.name && p.name.toLowerCase().includes('sssss')) ||
                    (p.name && p.name.toUpperCase().includes('SIGMA SONY OK')) ||
                    (p.name && p.name.toLowerCase().includes('verification camera'))
                );
                if (hasDummy || parsed.length < 3) {
                    console.log('API: Resetting LS_PRODUCTS to ensure quality seed data');
                    localStorage.removeItem(key);
                    return SEED_PRODUCTS;
                }
            }
            return parsed;
        }
        if (key === LS_SERVICES) return [];
        if (key === LS_NOTIFICATIONS) return [];
        if (key === LS_PRODUCTS) return SEED_PRODUCTS;
        if (key === LS_INVENTORY) return SEED_INVENTORY;
        if (key === LS_VENDORS) return SEED_VENDORS;
        if (key === LS_ORDERS) return SEED_ORDERS;
        return [];
    } catch (e) {
        console.error(`API: Error parsing ${key}`, e);
        return [];
    }
};
const lsSet = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`API: Error saving ${key}`, e);
    }
};

const lsGetAll = () => lsGet(LS_PRODUCTS);
const lsSave = (products) => lsSet(LS_PRODUCTS, products);

// ── PRODUCTS ─────────────────────────────────────────────────────

async function createProduct(payload) {
    if (isDemo()) {
        const user = getUser();
        const newProduct = {
            _id: 'LS-' + Date.now(),
            ...payload,
            vendorEmail: payload.vendorEmail || user.email || 'demo-vendor',
            vendorName: payload.vendorName || user.name || 'Demo Vendor',
            isApproved: payload.isApproved !== undefined ? payload.isApproved : true, // Auto-approve in demo
            createdAt: new Date().toISOString(),
        };
        lsSave([...lsGetAll(), newProduct]);

        // Also add to inventory
        const inventory = lsGet(LS_INVENTORY);
        const invItem = {
            id: newProduct._id,
            name: newProduct.name,
            sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
            stock: newProduct.stock || 0,
            threshold: 5,
            warehouse: 'Main Warehouse'
        };
        lsSet(LS_INVENTORY, [...inventory, invItem]);

        return { ok: true, product: newProduct };
    }
    const res = await fetch(`${BASE}/products`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true, product: await res.json() };
}

async function fetchVendorProducts() {
    if (isDemo()) {
        const user = getUser();
        return lsGetAll().filter(p => p.vendorEmail === user.email);
    }
    const res = await fetch(`${BASE}/products/vendor`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function fetchAdminProducts() {
    if (isDemo()) return lsGetAll();
    const res = await fetch(`${BASE}/products/admin`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Fetch only APPROVED products (for the public store / ProductList) */
async function fetchPublicProducts() {
    if (isDemo()) return lsGetAll().filter(p => p.isApproved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const res = await fetch(`${BASE}/products`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function updateProduct(id, payload) {
    if (isDemo()) {
        const products = lsGetAll().map(p => p._id === id ? { ...p, ...payload } : p);
        lsSave(products);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/products/${id}`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function approveProduct(id) {
    if (isDemo()) {
        lsSave(lsGetAll().map(p => p._id === id ? { ...p, isApproved: true } : p));
        return { ok: true };
    }
    const res = await fetch(`${BASE}/products/approve/${id}`, { method: 'PATCH', headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function deleteProduct(id) {
    if (isDemo()) {
        lsSave(lsGetAll().filter(p => p._id !== id));
        return { ok: true };
    }
    const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ── VENDORS ───────────────────────────────────────────────────────

async function fetchVendors() {
    if (isDemo()) return lsGet(LS_VENDORS);
    const res = await fetch(`${BASE}/vendors`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function createVendor(payload) {
    if (isDemo()) {
        const vendors = lsGet(LS_VENDORS);
        const newVendor = { 
            ...payload, 
            id: `V${String(vendors.length + 1).padStart(3, '0')}`,
            revenue: payload.revenue || '$0',
            rating: payload.rating || '-'
        };
        lsSet(LS_VENDORS, [...vendors, newVendor]);

        // Sync with demo_users for login credentials
        const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        demoUsers[payload.email] = {
            id: newVendor.id,
            name: newVendor.name,
            email: newVendor.email,
            password: payload.password || 'Vendor@123', // Default if not provided
            role: 'vendor',
            joinedDate: new Date().toISOString().split('T')[0],
            status: payload.status || 'Active'
        };
        localStorage.setItem('demo_users', JSON.stringify(demoUsers));

        return { ok: true, vendor: newVendor };
    }
    const res = await fetch(`${BASE}/vendors`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function updateVendor(id, payload) {
    if (isDemo()) {
        const vendors = lsGet(LS_VENDORS).map(v => v.id === id ? { ...v, ...payload } : v);
        lsSet(LS_VENDORS, vendors);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/vendors/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function deleteVendor(id) {
    if (isDemo()) {
        const vendors = lsGet(LS_VENDORS).filter(v => v.id !== id);
        lsSet(LS_VENDORS, vendors);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/vendors/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ── ORDERS ───────────────────────────────────────────────────────

const PLATFORM_FEE = 0.10;

/**
 * Place an order. Demo mode: stores in ls_orders + creates ls_transactions entries.
 * payload: { items: [{productId, productName, vendorEmail, vendorName, price, quantity}], shippingAddress, totalAmount }
 */
async function placeOrder(payload) {
    if (isDemo()) {
        const user = getUser();
        const orderId = 'ORD-' + Date.now();
        const now = new Date().toISOString();

        // Save order
        const order = {
            _id: orderId,
            customerEmail: user.email,
            customerName: user.name || 'Customer',
            ...payload,
            status: payload.status || 'pending',
            paymentStatus: 'paid',
            createdAt: now,
        };
        lsSet(LS_ORDERS, [...lsGet(LS_ORDERS), order]);

        // --- Sync Inventory and Products ---
        const products = lsGet(LS_PRODUCTS);
        const inventory = lsGet(LS_INVENTORY);

        (payload.items || []).forEach(item => {
            // Update Products list
            const pIdx = products.findIndex(p => p._id === item.productId || p.name === item.productName);
            if (pIdx !== -1) {
                products[pIdx].stock = Math.max(0, (products[pIdx].stock || 0) - (item.quantity || 0));
            }

            // Update Inventory list
            const iIdx = inventory.findIndex(i => i.id === item.productId || i.name === item.productName);
            if (iIdx !== -1) {
                inventory[iIdx].stock = Math.max(0, (inventory[iIdx].stock || 0) - (item.quantity || 0));
            }
        });

        lsSet(LS_PRODUCTS, products);
        lsSet(LS_INVENTORY, inventory);

        // Create a transaction for each item
        const txns = (payload.items || []).map(item => {
            const gross = item.price * item.quantity;
            const fee = Math.round(gross * PLATFORM_FEE);
            return {
                _id: 'TXN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                orderId,
                vendorEmail: item.vendorEmail || '',
                vendorName: item.vendorName || 'Demo Vendor',
                productName: item.productName || 'Product',
                grossAmount: gross,
                platformFee: fee,
                netAmount: gross - fee,
                paymentStatus: 'pending',
                createdAt: now,
            };
        });
        lsSet(LS_TRANSACTIONS, [...lsGet(LS_TRANSACTIONS), ...txns]);

        return { ok: true, order };
    }

    const res = await fetch(`${BASE}/orders`, {
        method: 'POST', headers: headers(), body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true, order: await res.json() };
}

async function fetchMyOrders() {
    if (isDemo()) {
        const user = getUser();
        const orders = lsGet(LS_ORDERS);
        const myOrders = orders.filter(o => o.customerEmail === user.email);

        if (myOrders.length > 0) return myOrders;

        return [];
    }
    const res = await fetch(`${BASE}/orders/my-orders`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Vendor: all orders containing this vendor's products */
async function fetchVendorOrders() {
    if (isDemo()) {
        const user = getUser();
        const orders = lsGet(LS_ORDERS);
        // Filter orders where at least one item belongs to this vendor
        const filtered = orders.filter(o => 
            (o.items || []).some(item => item.vendorEmail === user.email)
        );
        
        return filtered.map(o => {
            const { shippingAddress, customerEmail, phone, customerName, ...rest } = o;
            return { 
                ...rest, 
                customerName: 'Customer',
                customer: o.customer ? { name: 'Customer' } : null 
            };
        });
    }
    const res = await fetch(`${BASE}/orders/vendor`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Update order status (vendor / admin) */
async function updateOrderStatus(orderId, status) {
    if (isDemo()) {
        const orders = lsGet(LS_ORDERS).map(o =>
            o._id === orderId ? { ...o, status } : o
        );
        lsSet(LS_ORDERS, orders);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Admin: ALL orders across all customers */
async function fetchAllOrders() {
    if (isDemo()) return lsGet(LS_ORDERS);
    const res = await fetch(`${BASE}/orders/admin`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ── TRANSACTIONS ─────────────────────────────────────────────────

/** Vendor: own transactions (demo: return all since vendorEmail is empty on manual orders) */
async function fetchVendorTransactions() {
    if (isDemo()) {
        return lsGet(LS_TRANSACTIONS);
    }
    const res = await fetch(`${BASE}/transactions/vendor`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Admin: all transactions */
async function fetchAdminTransactions() {
    if (isDemo()) {
        return lsGet(LS_TRANSACTIONS);
    }
    const res = await fetch(`${BASE}/transactions/admin`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

/** Admin: settle a transaction */
async function settleTransaction(id) {
    if (isDemo()) {
        const all = lsGet(LS_TRANSACTIONS).map(t =>
            t._id === id ? { ...t, paymentStatus: 'settled' } : t
        );
        lsSet(LS_TRANSACTIONS, all);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/transactions/${id}/settle`, {
        method: 'PATCH', headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true };
}

async function refundTransaction(id) {
    if (isDemo()) {
        const all = lsGet(LS_TRANSACTIONS).map(t =>
            t._id === id ? { ...t, paymentStatus: 'refunded' } : t
        );
        lsSet(LS_TRANSACTIONS, all);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/transactions/${id}/refund`, {
        method: 'PATCH', headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true };
}

async function deleteTransaction(id) {
    if (isDemo()) {
        const all = lsGet(LS_TRANSACTIONS).filter(t => t._id !== id);
        lsSet(LS_TRANSACTIONS, all);
        return { ok: true };
    }
    const res = await fetch(`${BASE}/transactions/${id}`, {
        method: 'DELETE', headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true };
}

// ── CART ─────────────────────────────────────────────────────────

function getCart() {
    return lsGet(LS_CART);
}

function addToCart(product) {
    const cart = getCart();
    const productId = product._id || product.id;
    const existing = cart.find(item => (item._id || item.id) === productId);

    if (existing) {
        lsSet(LS_CART, cart.map(item =>
            (item._id || item.id) === productId
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
        ));
    } else {
        lsSet(LS_CART, [...cart, { ...product, quantity: 1 }]);
    }
    return { ok: true };
}

function clearCart() {
    lsSet(LS_CART, []);
}

async function assignTechnician(orderId, partnerEmail, partnerName) {
    if (isDemo()) {
        const orders = lsGet(LS_ORDERS);
        const orderIndex = orders.findIndex(o => o._id === orderId);
        
        if (orderIndex === -1) {
            console.warn(`API: Order ${orderId} not found in LS_ORDERS`);
            // Try to find it in internal seed if not in LS yet
            const seedMatch = SEED_ORDERS.find(o => o._id === orderId);
            if (seedMatch) {
                const newOrder = { ...seedMatch, deliveryPartnerEmail: partnerEmail, deliveryPartnerName: partnerName, status: 'assigned' };
                lsSet(LS_ORDERS, [...orders, newOrder]);
            } else {
                return { ok: false, message: 'Order not found' };
            }
        } else {
            orders[orderIndex] = { ...orders[orderIndex], deliveryPartnerEmail: partnerEmail, deliveryPartnerName: partnerName, status: 'assigned' };
            lsSet(LS_ORDERS, orders);
        }
        
        // Notify the employee
        addNotification('Technician', `New Order Assigned: ORD-${shortId(orderId)}`, partnerEmail, {
            type: 'technician_assignment',
            orderId: orderId,
            status: 'assigned'
        });

        return { ok: true };
    }
    const res = await fetch(`${BASE}/orders/${orderId}/assign`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ partnerEmail, partnerName }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

const LS_TECH_STATS = 'db_technician_stats'; // Status: Available, Busy, On Leave

async function fetchTechnicians() {
    if (!isDemo()) {
        const res = await fetch(`${BASE}/users/delivery-partners`, { headers: headers() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
    
    // In demo mode, ensure we have initial states
    const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
    let techs = Object.values(demoUsers).filter(u => u.role === 'technician' || u.role === 'delivery');
    if (techs.length === 0) techs = SEED_TECHNICIANS; // Fallback to seed if no demo users

    let stats = lsGet(LS_TECH_STATS) || {};
    
    return techs.map(t => ({
        ...t,
        availability: stats[t.email] || 'Available',
        skills: ['CCTV Installation', 'Maintenance', 'Repair'],
        experience: '3+ Years'
    }));
}

async function updateTechnicianAvailability(email, status) {
    if (isDemo()) {
        let stats = lsGet(LS_TECH_STATS) || {};
        stats[email] = status;
        lsSet(LS_TECH_STATS, stats);
        window.dispatchEvent(new Event('notificationsUpdated'));
        return { ok: true };
    }
    const res = await fetch(`${BASE}/users/technician/${email}/availability`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function fetchTechnicianTasks() {
    if (isDemo()) {
        const user = getUser();
        return lsGet(LS_ORDERS).filter(o => o.deliveryPartnerEmail === user.email);
    }
    const res = await fetch(`${BASE}/orders/delivery-tasks`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function requestService(payload) {
    if (isDemo()) {
        const services = lsGet(LS_SERVICES) || [];
        const user = getUser();
        const newService = {
            _id: 'SRV-' + Date.now(),
            customerEmail: user.email,
            customerName: user.name || 'Customer',
            ...payload,
            status: 'pending', // pending, assigned, confirmed, in-progress, completed
            createdAt: new Date().toISOString()
        };
        lsSet(LS_SERVICES, [...services, newService]);

        // Trigger Notifications for Admin
        addNotification('Admin', `New service request from ${newService.customerName}: ${newService.serviceName}`, null, {
            type: 'service_request',
            serviceId: newService._id,
            serviceName: newService.serviceName,
            customerName: newService.customerName
        });
        
        // Start Auto-Assignment Timer (User requested 2 minutes: 120,000ms)
        // For demo visibility, we will stick to 2 minutes as requested.
        setTimeout(() => {
            autoAssignService(newService._id);
        }, 120000);

        return { ok: true, service: newService };
    }
    // Backend implementation would go here
    return { ok: true };
}

// ── NOTIFICATIONS (SIMULATED) ────────────────────────────────────

function addNotification(toRole, message, toUser = null, metadata = {}) {
    const list = lsGet(LS_NOTIFICATIONS) || [];
    const newNotif = {
        _id: 'NTF-' + Date.now() + Math.random().toString(36).slice(2, 5),
        toRole,
        toUser,
        message,
        metadata, // Include metadata for interactive actions
        isRead: false,
        createdAt: new Date().toISOString()
    };
    lsSet(LS_NOTIFICATIONS, [newNotif, ...list]);
    window.dispatchEvent(new Event('notificationsUpdated'));
}

/** Process notification actions (e.g., Accept/Reject) */
async function handleNotificationAction(notifId, action) {
    if (isDemo()) {
        const list = lsGet(LS_NOTIFICATIONS) || [];
        const notif = list.find(n => n._id === notifId);
        if (!notif) return { ok: false };

        const { metadata } = notif;
        if (metadata.type === 'service_request') {
            if (action === 'accept') {
                await autoAssignService(metadata.serviceId);
            } else if (action === 'reject') {
                await updateServiceStatus(metadata.serviceId, 'rejected');
            }
        } else if (metadata.type === 'technician_assignment') {
            if (action === 'accept_job') {
                await updateServiceStatus(metadata.serviceId, 'confirmed');
            }
        }

        // Mark notification as read or remove it
        lsSet(LS_NOTIFICATIONS, list.filter(n => n._id !== notifId));
        window.dispatchEvent(new Event('notificationsUpdated'));
        return { ok: true };
    }
    return { ok: true };
}

async function deleteNotification(id) {
    if (isDemo()) {
        const all = lsGet(LS_NOTIFICATIONS) || [];
        lsSet(LS_NOTIFICATIONS, all.filter(n => n._id !== id));
        window.dispatchEvent(new Event('notificationsUpdated'));
        return { ok: true };
    }
    return { ok: true };
}

async function clearNotifications() {
    if (isDemo()) {
        lsSet(LS_NOTIFICATIONS, []);
        window.dispatchEvent(new Event('notificationsUpdated'));
        return { ok: true };
    }
    return { ok: true };
}

async function fetchNotifications(role, userEmail = null) {
    const all = lsGet(LS_NOTIFICATIONS) || [];
    return all.filter(n => {
        const roleMatch = !role || n.toRole === role;
        const userMatch = !n.toUser || n.toUser === userEmail;
        return roleMatch && userMatch;
    });
}

// ── AUTO-ASSIGNMENT LOGIC ────────────────────────────────────────

async function autoAssignService(serviceId) {
    const services = lsGet(LS_SERVICES) || [];
    const service = services.find(s => s._id === serviceId);
    
    // Only auto-assign if still pending (not manually assigned by admin)
    if (!service || service.status !== 'pending') return;

    const technicians = await fetchTechnicians();
    const workloads = await fetchTechnicianWorkload();
    
    // IMPORTANT: Only assign to Available technicians
    const availableTechs = technicians.filter(t => t.availability === 'Available');
    if (availableTechs.length === 0) {
        console.warn('API: No available technicians for auto-assignment');
        return;
    }

    const availableEmails = availableTechs.map(t => t.email);
    const filteredWorkloads = availableEmails.map(email => ({
        email,
        count: workloads[email] || 0
    }));
    
    if (filteredWorkloads.length === 0) return;

    // Find the technician with the minimum job count
    const bestTech = filteredWorkloads.sort((a,b) => a.count - b.count)[0];
    
    await updateServiceStatus(serviceId, 'assigned', { 
        techEmail: bestTech.email, 
        techName: bestTech.name || 'Auto-Assigned Tech' 
    });

    addNotification('Technician', `Job Assigned: ${service.serviceName} for ${service.customerName}`, bestTech.email, {
        type: 'technician_assignment',
        serviceId: serviceId,
        serviceName: service.serviceName
    });
    console.log(`API: Auto-assigned ${serviceId} to ${bestTech.name} (Workload: ${bestTech.count})`);
}

async function fetchTechnicianWorkload() {
    const allServices = lsGet(LS_SERVICES) || [];
    const activeServices = allServices.filter(s => s.status === 'assigned' || s.status === 'in-progress');
    
    const workload = {};
    activeServices.forEach(s => {
        if (s.techEmail) {
            workload[s.techEmail] = (workload[s.techEmail] || 0) + 1;
        }
    });
    return workload;
}

async function fetchMyServiceRequests() {
    if (isDemo()) {
        const user = getUser();
        const all = lsGet(LS_SERVICES) || [];
        return all.filter(s => s.customerEmail === user.email);
    }
    return [];
}

async function fetchAllServiceRequests() {
    if (isDemo()) {
        return lsGet(LS_SERVICES) || [];
    }
    return [];
}

async function updateServiceStatus(id, status, extra = {}) {
    if (isDemo()) {
        const all = lsGet(LS_SERVICES) || [];
        const index = all.findIndex(s => s._id === id);
        if (index !== -1) {
            all[index] = { ...all[index], status, ...extra };
            lsSet(LS_SERVICES, all);
        } else {
            console.warn(`API: Service ${id} not found in LS_SERVICES`);
            return { ok: false, message: 'Service request not found' };
        }
        return { ok: true };
    }
    const res = await fetch(`${BASE}/services/${id}/status`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status, ...extra }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

async function cancelOrder(orderId) {
    if (isDemo()) {
        const orders = lsGet(LS_ORDERS).map(o => 
            o._id === orderId ? { ...o, status: 'cancelled' } : o
        );
        lsSet(LS_ORDERS, orders);
        return { ok: true };
    }
    return { ok: true };
}

async function requestRefund(orderId) {
    if (isDemo()) {
        const orders = lsGet(LS_ORDERS).map(o => 
            o._id === orderId ? { ...o, status: 'refund_requested' } : o
        );
        lsSet(LS_ORDERS, orders);
        return { ok: true };
    }
    return { ok: true };
}

// ── COMPARE ──────────────────────────────────────────────────────
const LS_COMPARE = 'ls_compare';

function getCompareList() {
    return lsGet(LS_COMPARE);
}

function addToCompare(product) {
    const list = getCompareList();
    const productId = product._id || product.id;
    if (list.length >= 4) return { ok: false, message: 'Max 4 cameras can be compared' };
    if (list.find(p => (p._id || p.id) === productId)) return { ok: false, message: 'Already in comparison' };
    
    // Add default specs if missing for demo comparison
    const productWithSpecs = {
        ...product,
        megapixels: product.megapixels || '24.2 MP',
        sensorType: product.sensorType || 'CMOS',
        isoRange: product.isoRange || '100-51200',
        videoRecording: product.videoRecording || '4K 60p',
        batteryLife: product.batteryLife || '450 shots',
        weight: product.weight || '650g'
    };
    
    lsSet(LS_COMPARE, [...list, productWithSpecs]);
    return { ok: true };
}

function removeFromCompare(productId) {
    const list = getCompareList().filter(p => (p._id || p.id) !== productId);
    lsSet(LS_COMPARE, list);
    return { ok: true };
}

function clearCompare() {
    lsSet(LS_COMPARE, []);
    return { ok: true };
}

export {
    isDemo,
    getToken,
    getUser,
    lsGet,
    lsSet,
    createProduct,
    fetchVendorProducts,
    fetchAdminProducts,
    fetchPublicProducts,
    approveProduct,
    deleteProduct,
    placeOrder,
    fetchMyOrders,
    fetchVendorOrders,
    updateOrderStatus,
    fetchAllOrders,
    assignTechnician,
    fetchTechnicianTasks,
    fetchTechnicians,
    fetchVendorTransactions,
    fetchAdminTransactions,
    settleTransaction,
    refundTransaction,
    deleteTransaction,
    getCart,
    addToCart,
    clearCart,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    updateProduct,
    requestService,
    fetchMyServiceRequests,
    fetchAllServiceRequests,
    updateServiceStatus,
    cancelOrder,
    requestRefund,
    getCompareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    addNotification,
    fetchNotifications,
    deleteNotification,
    clearNotifications,
    fetchTechnicianWorkload,
    handleNotificationAction,
    updateTechnicianAvailability
};
