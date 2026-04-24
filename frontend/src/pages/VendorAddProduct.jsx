import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { createProduct } from '../api';

const vendorLinks = [
    { label: 'Dashboard', path: '/vendor', icon: '📊' },
    { label: 'Products', path: '/vendor/products', icon: '📸' },
    { label: 'Orders', path: '/vendor/orders', icon: '📜' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments', path: '/vendor/payments', icon: '💳' },
];

const STEPS = [
    { id: 1, label: 'Basic Information', icon: '📋', desc: 'Name, category & description' },
    { id: 2, label: 'Product Images', icon: '🖼️', desc: 'Upload photos & gallery' },
    { id: 3, label: 'Pricing & Inventory', icon: '💰', desc: 'Price, stock & variants' },
    { id: 4, label: 'Specifications', icon: '🔧', desc: 'Technical details & features' },
    { id: 5, label: 'Shipping Details', icon: '🚚', desc: 'Weight, dimensions & delivery' },
    { id: 6, label: 'Tags & SEO', icon: '🔍', desc: 'Metadata & search indexing' },
    { id: 7, label: 'Publish Product', icon: '🚀', desc: 'Review & go live' },
];

const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: '600',
    color: 'var(--text-main)', opacity: 0.9, marginBottom: '7px', letterSpacing: '0.5px'
};
const sectionTitle = { fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--accent)', letterSpacing: '0.5px' };
const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const fieldBlock = { marginBottom: '20px' };

// ── STEP CONTENT ──────────────────────────────────────────────
const Step1 = ({ data, set }) => (
    <div>
        <h3 style={sectionTitle}>📋 Basic Information</h3>
        <div style={fieldBlock}>
            <label style={labelStyle}>Product Name *</label>
            <input className="modal-input" placeholder="e.g. Sony Alpha A7 IV Full-Frame Camera" value={data.name} onChange={e => set({ ...data, name: e.target.value })} />
        </div>
        <div style={gridTwo}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Category *</label>
                <select className="modal-input" value={data.category} onChange={e => set({ ...data, category: e.target.value })}>
                    <option value="">Select category</option>
                    {['DSLR Cameras', 'Mirrorless Cameras', 'Video Cameras', 'Lenses', 'Accessories', 'Tripods & Supports', 'Lighting', 'Storage', 'Bags & Cases', 'Power & Batteries'].map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Brand *</label>
                <select className="modal-input" value={data.brand} onChange={e => set({ ...data, brand: e.target.value })}>
                    <option value="">Select brand</option>
                    {['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Leica', 'Blackmagic', 'DJI', 'Sigma', 'Tamron', 'Other'].map(b => <option key={b}>{b}</option>)}
                </select>
            </div>
        </div>
        <div style={gridTwo}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Model Number</label>
                <input className="modal-input" placeholder="e.g. ILCE-7M4" value={data.model} onChange={e => set({ ...data, model: e.target.value })} />
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Condition *</label>
                <select className="modal-input" value={data.condition} onChange={e => set({ ...data, condition: e.target.value })}>
                    <option value="">Select condition</option>
                    {['Brand New', 'Like New', 'Good', 'Fair', 'Refurbished'].map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
        </div>
        <div style={fieldBlock}>
            <label style={labelStyle}>Short Description *</label>
            <textarea className="modal-input" style={{ height: '80px', resize: 'vertical' }} placeholder="Brief one-liner for product cards (max 150 chars)" value={data.shortDesc} onChange={e => set({ ...data, shortDesc: e.target.value })} />
        </div>
        <div style={fieldBlock}>
            <label style={labelStyle}>Full Description *</label>
            <textarea className="modal-input" style={{ height: '140px', resize: 'vertical' }} placeholder="Detailed product description — features, what's in the box, compatibility..." value={data.desc} onChange={e => set({ ...data, desc: e.target.value })} />
        </div>
    </div>
);

const Step2 = ({ data, set }) => {
    const [images, setImages] = useState(data.images || []);
    const handleFile = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(f => URL.createObjectURL(f));
        const newImgs = [...images, ...urls].slice(0, 8);
        setImages(newImgs);
        set({ ...data, images: newImgs });
        e.target.value = '';
    };
    const remove = (i) => {
        const updated = images.filter((_, idx) => idx !== i);
        setImages(updated);
        set({ ...data, images: updated });
    };

    return (
        <div>
            <h3 style={sectionTitle}>🖼️ Product Images</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '16px' }}>
                Upload up to 8 images. First image will be the cover. Recommended: 1200×900px, max 5MB each.
            </p>

            {/* ── Upload box changes appearance once images exist ── */}
            <div style={{
                border: '2px dashed var(--accent)', borderRadius: '14px',
                padding: '20px', background: 'rgba(212,175,55,0.04)', minHeight: '180px',
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start'
            }}>
                {/* Existing image tiles */}
                {images.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
                        <img
                            src={src} alt={`Product ${i + 1}`}
                            style={{
                                width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px',
                                border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                                display: 'block'
                            }}
                        />
                        {/* Cover badge */}
                        {i === 0 && (
                            <span style={{
                                position: 'absolute', top: '8px', left: '8px',
                                background: 'var(--accent)', color: '#000',
                                fontSize: '0.6rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px',
                                letterSpacing: '0.5px'
                            }}>COVER</span>
                        )}
                        {/* Remove button */}
                        <button
                            onClick={() => remove(i)}
                            style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'rgba(30,30,30,0.85)', border: 'none', color: '#ffffff',
                                width: '24px', height: '24px', borderRadius: '50%',
                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                lineHeight: 1
                            }}
                        >✕</button>
                        {/* Photo number badge */}
                        <span style={{
                            position: 'absolute', bottom: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.6)', color: '#ffffff',
                            fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px'
                        }}>{i + 1}</span>
                    </div>
                ))}

                {/* ── Add More / Empty-state tile ── */}
                {images.length < 8 && (
                    <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{
                            width: '150px', height: '150px', borderRadius: '10px',
                            border: '2px dashed var(--glass-border)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'var(--glass)', transition: 'border-color 0.2s, background 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass)'; }}
                        >
                            {images.length === 0 ? (
                                <>
                                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📷</div>
                                    <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>Click to upload</div>
                                    <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>PNG, JPG, WEBP</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>＋</div>
                                    <div style={{ fontWeight: '700', fontSize: '0.8rem' }}>Add More</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '3px' }}>{8 - images.length} slots left</div>
                                </>
                            )}
                        </div>
                        <input type="file" multiple accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                    </label>
                )}
            </div>

            {images.length > 0 && (
                <p style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: '10px' }}>
                    💡 Drag & drop to reorder coming soon · {images.length}/8 uploaded · Click ✕ to remove
                </p>
            )}
        </div>
    );
};


const Step3 = ({ data, set }) => (
    <div>
        <h3 style={sectionTitle}>💰 Pricing & Inventory</h3>

        {/* Row 1: Selling Price | Compare-at Price */}
        <div style={gridTwo}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Selling Price (₹) *</label>
                <input className="modal-input" type="number" placeholder="e.g. 249900" value={data.price} onChange={e => set({ ...data, price: e.target.value })} />
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Compare-at Price (₹)</label>
                <input className="modal-input" type="number" placeholder="Original MRP" value={data.mrp} onChange={e => set({ ...data, mrp: e.target.value })} />
            </div>
        </div>

        {/* Row 2: Tax Rate | Stock Quantity */}
        <div style={gridTwo}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Tax Rate (%)</label>
                <select className="modal-input" value={data.tax} onChange={e => set({ ...data, tax: e.target.value })}>
                    <option value="">Select GST rate</option>
                    {['0%', '5%', '12%', '18%', '28%'].map(t => <option key={t}>{t}</option>)}
                </select>
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Stock Quantity *</label>
                <input className="modal-input" type="number" placeholder="Units available" value={data.stock} onChange={e => set({ ...data, stock: e.target.value })} />
            </div>
        </div>

        {/* Row 3: Low Stock Alert (half width) */}
        <div style={{ ...gridTwo, gridTemplateColumns: '1fr 1fr' }}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Low Stock Alert At</label>
                <input className="modal-input" type="number" placeholder="e.g. 5 units" value={data.lowStock} onChange={e => set({ ...data, lowStock: e.target.value })} />
            </div>
        </div>
    </div>
);


const Step4 = ({ data, set }) => {
    const [specs, setSpecs] = useState(data.specs || [{ key: '', value: '' }]);
    const update = (i, field, val) => {
        const updated = specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
        setSpecs(updated);
        set({ ...data, specs: updated });
    };
    const addRow = () => { const updated = [...specs, { key: '', value: '' }]; setSpecs(updated); set({ ...data, specs: updated }); };
    const removeRow = (i) => { const updated = specs.filter((_, idx) => idx !== i); setSpecs(updated); set({ ...data, specs: updated }); };
    return (
        <div>
            <h3 style={sectionTitle}>🔧 Specifications</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px' }}>Add technical specs like sensor, resolution, ISO range etc. These display in a spec table on the product page.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {specs.map((spec, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                        <input className="modal-input" placeholder="e.g. Sensor Resolution" value={spec.key} onChange={e => update(i, 'key', e.target.value)} />
                        <input className="modal-input" placeholder="e.g. 33 Megapixels" value={spec.value} onChange={e => update(i, 'value', e.target.value)} />
                        <button onClick={() => removeRow(i)} style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
                    </div>
                ))}
            </div>
            <button onClick={addRow} style={{ marginTop: '14px', background: 'none', border: '1px dashed var(--accent)', color: 'var(--accent)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                + Add Specification Row
            </button>
        </div>
    );
};

const Step5 = ({ data, set }) => (
    <div>
        <h3 style={sectionTitle}>🚚 Shipping Details</h3>
        <div style={gridTwo}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Package Weight (kg) *</label>
                <input className="modal-input" type="number" step="0.1" placeholder="e.g. 1.5" value={data.weight} onChange={e => set({ ...data, weight: e.target.value })} />
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Dispatch Time</label>
                <select className="modal-input" value={data.dispatch} onChange={e => set({ ...data, dispatch: e.target.value })}>
                    <option value="">Select dispatch time</option>
                    {['Same Day', '1 Business Day', '2-3 Business Days', '3-5 Business Days', '5-7 Business Days'].map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
        </div>
        <div style={{ ...gridTwo, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div style={fieldBlock}>
                <label style={labelStyle}>Length (cm)</label>
                <input className="modal-input" type="number" placeholder="L" value={data.dimL} onChange={e => set({ ...data, dimL: e.target.value })} />
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Width (cm)</label>
                <input className="modal-input" type="number" placeholder="W" value={data.dimW} onChange={e => set({ ...data, dimW: e.target.value })} />
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Height (cm)</label>
                <input className="modal-input" type="number" placeholder="H" value={data.dimH} onChange={e => set({ ...data, dimH: e.target.value })} />
            </div>
        </div>
        <div style={fieldBlock}>
            <label style={labelStyle}>Shipping From (City / Pincode)</label>
            <input className="modal-input" placeholder="e.g. Mumbai - 400001" value={data.shipFrom} onChange={e => set({ ...data, shipFrom: e.target.value })} />
        </div>
        <div style={fieldBlock}>
            <label style={labelStyle}>Free Shipping</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                {['Yes – Free Shipping', 'No – Calculated at Checkout'].map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" name="freeShip" value={opt} checked={data.freeShip === opt} onChange={() => set({ ...data, freeShip: opt })} style={{ accentColor: 'var(--accent)' }} />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
        <div style={fieldBlock}>
            <label style={labelStyle}>Return Policy</label>
            <select className="modal-input" value={data.returns} onChange={e => set({ ...data, returns: e.target.value })}>
                <option value="">Select return policy</option>
                {['No Returns', '7-Day Returns', '15-Day Returns', '30-Day Returns'].map(r => <option key={r}>{r}</option>)}
            </select>
        </div>
    </div>
);

const Step6 = ({ data, set }) => {
    const [tag, setTag] = useState('');
    const [tags, setTags] = useState(data.tags || []);
    const addTag = () => {
        if (!tag.trim()) return;
        const updated = [...new Set([...tags, tag.trim().toLowerCase()])];
        setTags(updated); set({ ...data, tags: updated }); setTag('');
    };
    const removeTag = (t) => { const updated = tags.filter(x => x !== t); setTags(updated); set({ ...data, tags: updated }); };
    return (
        <div>
            <h3 style={sectionTitle}>🔍 Tags & SEO</h3>
            <div style={fieldBlock}>
                <label style={labelStyle}>SEO Title (Meta Title)</label>
                <input className="modal-input" placeholder="e.g. Sony A7 IV Full-Frame Camera — Buy Online" value={data.seoTitle} onChange={e => set({ ...data, seoTitle: e.target.value })} />
                <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '5px' }}>{(data.seoTitle || '').length} / 60 chars</div>
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Meta Description</label>
                <textarea className="modal-input" style={{ height: '80px', resize: 'none' }} placeholder="Brief description for search engines (max 160 chars)" value={data.seoDesc} onChange={e => set({ ...data, seoDesc: e.target.value })} />
                <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '5px' }}>{(data.seoDesc || '').length} / 160 chars</div>
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>URL Handle</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>/products/</span>
                    <input className="modal-input" style={{ flex: 1 }} placeholder="sony-a7-iv-full-frame" value={data.slug} onChange={e => set({ ...data, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                </div>
            </div>
            <div style={fieldBlock}>
                <label style={labelStyle}>Product Tags</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input className="modal-input" style={{ flex: 1 }} placeholder="Add a tag and press Enter" value={tag} onChange={e => setTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
                    <button onClick={addTag} style={{ padding: '10px 18px', background: 'var(--accent)', border: 'none', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.map(t => (
                        <span key={t} style={{ padding: '5px 12px', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            #{t}
                            <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', padding: 0 }}>✕</button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Step7 = ({ data, set }) => (
    <div>
        <h3 style={sectionTitle}>⚡ Flash Deal Settings</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '24px' }}>Optionally list this product in a limited-time Flash Deal to drive urgency and boost visibility.</p>
        <div style={fieldBlock}>
            <label style={{ ...labelStyle, marginBottom: '12px' }}>Enable Flash Deal?</label>
            <div style={{ display: 'flex', gap: '12px' }}>
                {['Yes – Create a Flash Deal', 'No – Regular Listing'].map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" name="flashDeal" value={opt} checked={data.flashEnabled === opt} onChange={() => set({ ...data, flashEnabled: opt })} style={{ accentColor: 'var(--accent)' }} />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
        {data.flashEnabled === 'Yes – Create a Flash Deal' && (
            <>
                <div style={gridTwo}>
                    <div style={fieldBlock}>
                        <label style={labelStyle}>Deal Price (₹) *</label>
                        <input className="modal-input" type="number" placeholder="Discounted price" value={data.dealPrice} onChange={e => set({ ...data, dealPrice: e.target.value })} />
                    </div>
                    <div style={fieldBlock}>
                        <label style={labelStyle}>Limited Stock for Deal</label>
                        <input className="modal-input" type="number" placeholder="e.g. 10 units" value={data.dealStock} onChange={e => set({ ...data, dealStock: e.target.value })} />
                    </div>
                </div>
                <div style={gridTwo}>
                    <div style={fieldBlock}>
                        <label style={labelStyle}>Deal Start Date & Time</label>
                        <input className="modal-input" type="datetime-local" value={data.dealStart} onChange={e => set({ ...data, dealStart: e.target.value })} />
                    </div>
                    <div style={fieldBlock}>
                        <label style={labelStyle}>Deal End Date & Time</label>
                        <input className="modal-input" type="datetime-local" value={data.dealEnd} onChange={e => set({ ...data, dealEnd: e.target.value })} />
                    </div>
                </div>
                {data.dealPrice && data.dealPrice < (data.price || Infinity) && (
                    <div style={{ padding: '14px 18px', background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', borderRadius: '8px', color: '#4caf50', fontWeight: '700', fontSize: '0.9rem' }}>
                        ✅ Discount: {Math.round((1 - data.dealPrice / data.price) * 100)}% OFF — Deal price ₹{Number(data.dealPrice).toLocaleString()} vs regular ₹{Number(data.price).toLocaleString()}
                    </div>
                )}
            </>
        )}
    </div>
);

const Step8 = ({ data }) => {
    const filled = [data.name, data.category, data.brand, data.condition, data.desc, data.price, data.stock];
    const complete = filled.filter(Boolean).length;
    const pct = Math.round((complete / filled.length) * 100);
    return (
        <div>
            <h3 style={sectionTitle}>🚀 Publish Product</h3>
            <div style={{ padding: '20px', background: pct === 100 ? 'rgba(76,175,80,0.1)' : 'rgba(255,170,0,0.1)', border: `1px solid ${pct === 100 ? '#4caf50' : '#ffaa00'}`, borderRadius: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700' }}>{pct === 100 ? '✅ All required fields complete!' : `⚠️ ${pct}% complete — fill required fields`}</span>
                    <span style={{ fontWeight: '700' }}>{pct}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#4caf50' : '#ffaa00', borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
                {[
                    { label: 'Product Name', value: data.name || '—' },
                    { label: 'Category', value: data.category || '—' },
                    { label: 'Brand', value: data.brand || '—' },
                    { label: 'Condition', value: data.condition || '—' },
                    { label: 'Price', value: data.price ? `₹${Number(data.price).toLocaleString()}` : '—' },
                    { label: 'Stock', value: data.stock ? `${data.stock} units` : '—' },
                    { label: 'Images', value: data.images?.length ? `${data.images.length} uploaded` : 'None' },
                    { label: 'Flash Deal', value: data.flashEnabled === 'Yes – Create a Flash Deal' ? `₹${Number(data.dealPrice || 0).toLocaleString()}` : 'Not set' },
                ].map((r, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: 'var(--glass)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.72rem', opacity: 0.55, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{r.value}</div>
                    </div>
                ))}
            </div>

            <div style={fieldBlock}>
                <label style={{ ...labelStyle, marginBottom: '12px' }}>Listing Status</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {['Active – Publish Now', 'Draft – Save for Later', 'Scheduled – Set a Date'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input type="radio" name="status" onChange={() => {}} style={{ accentColor: 'var(--accent)' }} />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

const stepComponents = [Step1, Step2, Step3, Step4, Step5, Step6, Step8];

// ── MAIN PAGE ──────────────────────────────────────────────────
const VendorAddProduct = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        name: '', category: '', brand: '', model: '', condition: '', shortDesc: '', desc: '',
        images: [], price: '', mrp: '', cost: '', tax: '', stock: '', lowStock: '', sku: '', barcode: '',
        specs: [{ key: '', value: '' }],
        weight: '', dispatch: '', dimL: '', dimW: '', dimH: '', shipFrom: '', freeShip: '', returns: '',
        seoTitle: '', seoDesc: '', slug: '', tags: [],
        flashEnabled: '', dealPrice: '', dealStock: '', dealStart: '', dealEnd: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const ActiveStep = stepComponents[step - 1];

    const handleSubmit = async () => {
        // Validate required fields
        if (!data.name || !data.category || !data.brand || !data.price || !data.stock) {
            setSubmitError('Please fill in all required fields: Name, Category, Brand, Price, and Stock.');
            setStep(1);
            return;
        }
        if (!data.desc && !data.shortDesc) {
            setSubmitError('Please add a product description.');
            setStep(1);
            return;
        }

        setSubmitting(true);
        setSubmitError('');

        // Build specifications object from key-value rows
        const specificationsMap = {};
        (data.specs || []).forEach(s => {
            if (s.key && s.value) specificationsMap[s.key] = s.value;
        });

        const payload = {
            name: data.name,
            description: data.desc || data.shortDesc,
            price: Number(data.price),
            category: data.category,
            brand: data.brand,
            stock: Number(data.stock),
            images: data.images.filter(img => img.startsWith('http') || img.startsWith('blob') || img.startsWith('data')),
            specifications: specificationsMap,
            // Extra fields stored as-is for display purposes
            model: data.model,
            condition: data.condition,
            shortDesc: data.shortDesc,
            mrp: data.mrp ? Number(data.mrp) : undefined,
            tax: data.tax,
            tags: data.tags,
            seoTitle: data.seoTitle,
            seoDesc: data.seoDesc,
            slug: data.slug,
            shipping: {
                weight: data.weight,
                dispatch: data.dispatch,
                freeShipping: data.freeShip,
                returns: data.returns,
                dimensions: { l: data.dimL, w: data.dimW, h: data.dimH },
                shipFrom: data.shipFrom,
            },
        };

        try {
            await createProduct(payload);
            setSubmitted(true);
            setTimeout(() => navigate('/vendor/products'), 2000);
        } catch (err) {
            setSubmitError('Failed to publish product. Please try again. ' + (err.message || ''));
            setSubmitting(false);
        }
    };

    if (submitted) return (
        <DashboardLayout title="Add Product" sidebarLinks={vendorLinks} userRole="Vendor">
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Product Published!</h2>
                <p style={{ opacity: 0.65 }}>Redirecting you back to your products...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="Add Product" sidebarLinks={vendorLinks} userRole="Vendor">
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* ── LEFT: Step Progress Panel ── */}
                <div className="glass-morphism" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '20px' }}>FORM PROGRESS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {STEPS.map(s => {
                            const isComplete = s.id < step;
                            const isCurrent = s.id === step;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(s.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px', borderRadius: '8px', border: 'none',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                        background: isCurrent ? 'var(--accent)' : isComplete ? 'rgba(76,175,80,0.12)' : 'transparent',
                                        color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{
                                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isCurrent ? 'rgba(0,0,0,0.15)' : isComplete ? '#4caf50' : 'var(--glass)',
                                        border: `1px solid ${isCurrent ? 'transparent' : isComplete ? '#4caf50' : 'var(--glass-border)'}`,
                                        fontSize: '0.75rem', fontWeight: '700',
                                        color: isComplete ? '#ffffff' : isCurrent ? 'var(--primary)' : 'var(--text-main)',
                                    }}>
                                        {isComplete ? '✓' : s.id}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{s.label}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: isCurrent ? 0.7 : 0.45 }}>{s.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Overall progress bar */}
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.55, marginBottom: '6px' }}>
                            <span>Overall Progress</span>
                            <span>{Math.round(((step - 1) / 6) * 100)}%</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${((step - 1) / 6) * 100}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.4s' }} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Active Step Form ── */}
                <div>
                    <div className="glass-morphism" style={{ padding: '36px', minHeight: '500px' }}>
                        {/* Step header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '2rem' }}>{STEPS[step - 1].icon}</div>
                            <div>
                                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.45, marginBottom: '4px' }}>STEP {step} OF 6</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{STEPS[step - 1].label}</div>
                            </div>
                        </div>

                        <ActiveStep data={data} set={setData} />
                    </div>

                    {/* Error Banner */}
                    {submitError && (
                        <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(255,77,77,0.12)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', fontSize: '0.85rem', fontWeight: '600' }}>
                            ⚠️ {submitError}
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '20px 24px', background: 'var(--glass)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            style={{ padding: '11px 24px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.35 : 1, fontWeight: '600' }}
                        >
                            ← Previous
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {STEPS.map(s => (
                                <div key={s.id} onClick={() => setStep(s.id)} style={{
                                    width: s.id === step ? '24px' : '8px', height: '8px',
                                    borderRadius: '4px', cursor: 'pointer',
                                    background: s.id < step ? '#4caf50' : s.id === step ? 'var(--accent)' : 'var(--glass-border)',
                                    transition: 'all 0.3s'
                                }} />
                            ))}
                        </div>

                        {step < 6 ? (
                            <button
                                onClick={() => setStep(s => Math.min(6, s + 1))}
                                className="premium-button"
                                style={{ padding: '11px 28px' }}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="premium-button"
                                style={{ padding: '11px 28px', background: 'var(--success)', color: '#ffffff', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                            >
                                {submitting ? '⏳ Publishing...' : '🚀 Publish Product'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorAddProduct;
