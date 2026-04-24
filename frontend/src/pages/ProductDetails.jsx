import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchPublicProducts } from '../api';
import './ProductDetails.css';

const allProducts = [
    {
        id: 'p1',
        name: 'Canon EOS 90D',
        price: 1199,
        rating: 4.5,
        image: '/products/canon_90d.png',
        brand: 'Canon',
        desc: 'Built for high-speed precision and professional results, the EOS 90D delivers stunning high-resolution image quality for both entry-level and expert photographers.',
        specs: {
            sensor: '32.5MP APS-C CMOS',
            video: '4K UHD 30p / Full HD 120p',
            iso: '100-25600 (exp. 51200)',
            speed: '10 fps Continuous Shooting'
        }
    },
    {
        id: 'p4',
        name: 'Sony A7 IV',
        price: 2499,
        rating: 4.7,
        image: '/products/sony_a7iv.png',
        brand: 'Sony',
        desc: 'The Sony A7 IV sets a new benchmark for modern photography. Combining exceptional resolution with stunning low-light performance, it is the ultimate tool for hybrids.',
        specs: {
            sensor: '33MP Full-Frame Exmor R',
            video: '4K 60p 10-bit 4:2:2',
            iso: '100-51200 (exp. 204800)',
            speed: '10 fps with AF/AE Tracking'
        }
    },
    {
        id: 'p7',
        name: 'Blackmagic Pocket 6K',
        price: 2495,
        rating: 4.8,
        image: '/products/blackmagic_6k.png',
        brand: 'Blackmagic',
        desc: 'Featuring a larger 6144 x 3456 Super 35 sensor and EF lens mount, the Blackmagic Pocket Cinema Camera 6K lets you use larger EF photographic lenses to create cinematic images.',
        specs: {
            sensor: 'Super 35 CMOS',
            video: '6K 6144 x 3456 up to 50 fps',
            dynamic_range: '13 Stops',
            iso: 'Dual Native ISO up to 25,600'
        }
    },
    {
        id: 'p10',
        name: 'Sony 24-70mm f/2.8 GM',
        price: 2299,
        rating: 4.9,
        image: '/products/sony_lens.png',
        brand: 'Sony',
        desc: 'The ultimate choice for those who want the highest possible optical performance for portrait, landscape, and event photography.',
        specs: {
            focal_length: '24-70mm',
            aperture: 'f/2.8',
            mount: 'Sony E-mount',
            elements: '2 XA (extreme aspherical) elements'
        }
    },
    {
        id: 'p17',
        name: 'Peak Design Everyday',
        price: 279,
        rating: 4.9,
        image: '/products/peak_design.png',
        brand: 'Peak Design',
        desc: 'An iconic, award-winning pack for everyday and photo carry, the Everyday Backpack is built around access, organization, expansion, and protection.',
        specs: {
            capacity: '20L',
            laptop: 'Fits 15" Macbook Pro',
            weatherproof: '400D Weatherproof Shell',
            dividers: '3 FlexFold Dividers'
        }
    },
    {
        id: 'p19',
        name: 'DJI RS 3 Pro Gimbal',
        price: 869,
        rating: 4.8,
        image: '/products/dji_rs3.png',
        brand: 'DJI',
        desc: 'DJI RS 3 Pro provides professional-grade stabilization and an expansive suite of features for solo creators and independent crews alike.',
        specs: {
            payload: '4.5kg / 10lbs',
            display: '1.8" OLED Touchscreen',
            transmission: 'O3 Pro Video Transmission',
            modes: 'Focus, Pan, Tilt'
        }
    },
];

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = React.useState(null);

    const [loading, setLoading] = React.useState(true);
    const [activeImg, setActiveImg] = React.useState(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const prods = await fetchPublicProducts();
                const found = prods.find(p => String(p._id || p.id) === String(id));
                setProduct(found);
                
                if (found) {
                    setActiveImg((found.images && found.images[0]) || found.image);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="product-details-page"><Navbar /><div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div></div>;
    if (!product) return <div className="product-details-page"><Navbar /><div style={{ padding: '100px', textAlign: 'center' }}>Product Not Found</div></div>;

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();

    return (
        <div className="product-details-page">
            <div className="cinematic-bg"></div>
            <Navbar />

            <div className="animate-fade-in" style={{ padding: '40px 80px' }}>
                <Link to="/store" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '30px', fontSize: '0.9rem' }}>← BACK TO STORE</Link>

                <div className="product-details-container">
                    <div className="product-gallery-wrapper">
                        {/* Thumbnail Column */}
                        <div className="thumbnail-list custom-scrollbar">
                            {product.images && product.images.length > 0 ? (
                                product.images.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`thumb-item ${activeImg === img ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveImg(img)}
                                        onClick={() => setActiveImg(img)}
                                    >
                                        <img src={img} alt={`${product.name} view ${idx + 1}`} />
                                    </div>
                                ))
                            ) : (
                                <div className="thumb-item active">
                                    <img src={product.image} alt={product.name} />
                                </div>
                            )}
                        </div>

                        {/* Main Preview */}
                        <div className="product-gallery glass-morphism">
                            <img 
                                src={activeImg || product.image} 
                                alt={product.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} 
                            />
                        </div>
                    </div>

                    <div className="product-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="brand-tag">{product.brand}</span>
                                <h1 style={{ marginTop: '5px' }}>{product.name}</h1>
                            </div>
                            <div className="price-large">{fmt(product.price)}</div>
                        </div>

                        <div className="product-description" style={{ margin: '20px 0', lineHeight: '1.6', opacity: 0.8 }}>
                            {product.description || 'Experience ultimate optical precision with the ' + product.name + '. Designed for professionals who demand excellence in every shot.'}
                        </div>

                        <div className="spec-grid" style={{ marginBottom: '30px' }}>
                            <div className="spec-item">
                                <label>CATEGORY</label>
                                <span>{product.category}</span>
                            </div>
                            <div className="spec-item">
                                <label>STOCK</label>
                                <span>{product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}</span>
                            </div>
                            <div className="spec-item">
                                <label>VENDOR</label>
                                <span>{product.vendorName}</span>
                            </div>
                        </div>

                        <div className="action-bar">
                            <button className="premium-button purchase-btn" style={{ flex: 1 }} onClick={() => alert('Proceeding to checkout...')}>
                                ADD TO CART
                            </button>
                            <button className="wish-btn" style={{ border: '1px solid var(--glass-border)', background: 'none', color: 'var(--text-main)', padding: '0 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}>♡</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;
