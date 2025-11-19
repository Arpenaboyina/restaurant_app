import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function Home() {
	const navigate = useNavigate();
	const [demoTableId, setDemoTableId] = useState('T1');
	const demoQrUrl = `${window.location.origin}/customer?table=${demoTableId}`;

	return (
		<div>
			{/* Hero Section */}
			<section className="hero-section">
				<div className="hero-content">
					<div className="hero-left">
						<h1 className="hero-title">BEST QUALITY<br />FOOD</h1>
						<p className="hero-description">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						</p>
						<div className="hero-buttons">
							<Link to="/customer" className="btn-live-demo">Live Demo</Link>
							<Link to="/customer" className="btn-book-table">BOOK A TABLE</Link>
						</div>
					</div>
					<div className="hero-right">
						<div className="food-images">
							<div className="food-item food-item-1">
								<div className="food-placeholder steak"></div>
							</div>
							<div className="food-item food-item-2">
								<div className="food-placeholder pasta"></div>
							</div>
							<div className="food-item food-item-3">
								<div className="food-placeholder pizza"></div>
							</div>
							<div className="food-garnishes">
								<div className="garnish tomato"></div>
								<div className="garnish basil"></div>
								<div className="garnish arugula"></div>
								<div className="garnish chili"></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* QR Scanner Demo Section */}
			<section className="container mb-5" style={{ marginTop: '60px' }}>
				<div className="card shadow-lg border-0" style={{
					background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)',
					borderRadius: '20px',
					overflow: 'hidden',
					border: '1px solid rgba(255, 255, 255, 0.1)'
				}}>
					<div className="card-body p-5">
						<div className="row align-items-center">
							<div className="col-md-6 text-center mb-4 mb-md-0">
								<h2 className="fw-bold mb-4 rainbow-gradient" style={{ fontSize: '32px', fontWeight: '800' }}>📱 Scan QR Code</h2>
								<p className="lead mb-4" style={{ color: 'var(--text-grey)' }}>
									Point your camera at the QR code on your table to instantly access our digital menu
								</p>
								<div className="bg-white p-4 rounded-lg shadow-lg d-inline-block" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
									<QRCodeSVG 
										value={demoQrUrl} 
										size={250}
										level="H"
										includeMargin={true}
									/>
								</div>
								<div className="mt-4">
									<div className="input-group mb-3" style={{ maxWidth: '300px', margin: '0 auto' }}>
										<input 
											type="text" 
											className="form-control" 
											placeholder="Table ID (e.g., T1)" 
											value={demoTableId}
											onChange={(e) => setDemoTableId(e.target.value)}
										/>
										<button 
											className="btn btn-primary" 
											onClick={() => navigate(`/customer?table=${demoTableId}`)}
										>
											Go to Menu
										</button>
									</div>
									<p className="small" style={{ color: 'var(--text-grey)' }}>
										💡 <strong>Demo:</strong> Enter a table ID and click "Go to Menu" or scan the QR code above
									</p>
								</div>
							</div>
							<div className="col-md-6">
								<div className="p-4">
									<h3 className="fw-bold mb-4 rainbow-gradient" style={{ fontSize: '24px', fontWeight: '800' }}>How to Use QR Code</h3>
									<div className="d-flex align-items-start mb-3">
										<div className="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ 
											width: '40px', 
											height: '40px', 
											minWidth: '40px',
											background: 'linear-gradient(135deg, #ff006e, #ff6b35)',
											boxShadow: '0 2px 10px rgba(255, 0, 110, 0.5)'
										}}>
											1
										</div>
										<div>
											<h5 className="fw-bold" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Find QR Code</h5>
											<p className="mb-0" style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Look for the QR code displayed on your table</p>
										</div>
									</div>
									<div className="d-flex align-items-start mb-3">
										<div className="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ 
											width: '40px', 
											height: '40px', 
											minWidth: '40px',
											background: 'linear-gradient(135deg, #ff6b35, #ffd23f)',
											boxShadow: '0 2px 10px rgba(255, 107, 53, 0.5)'
										}}>
											2
										</div>
										<div>
											<h5 className="fw-bold" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Scan with Phone</h5>
											<p className="mb-0" style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Open your camera app and point it at the QR code</p>
										</div>
									</div>
									<div className="d-flex align-items-start mb-3">
										<div className="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ 
											width: '40px', 
											height: '40px', 
											minWidth: '40px',
											background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
											boxShadow: '0 2px 10px rgba(6, 255, 165, 0.5)'
										}}>
											3
										</div>
										<div>
											<h5 className="fw-bold" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Access Menu</h5>
											<p className="mb-0" style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>You'll be automatically redirected to our digital menu</p>
										</div>
									</div>
									<div className="d-flex align-items-start">
										<div className="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ 
											width: '40px', 
											height: '40px', 
											minWidth: '40px',
											background: 'linear-gradient(135deg, #5e72e4, #a855f7)',
											boxShadow: '0 2px 10px rgba(94, 114, 228, 0.5)'
										}}>
											4
										</div>
										<div>
											<h5 className="fw-bold" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Start Ordering</h5>
											<p className="mb-0" style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Browse, customize, and place your order instantly</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mb-5">
				<h2 className="text-center mb-5 rainbow-gradient" style={{ fontSize: '36px', fontWeight: '800' }}>Why Choose Us?</h2>
				<div className="row g-4">
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0" style={{ background: 'rgba(42, 42, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>🍽️</div>
								<h4 className="card-title" style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Digital Menu</h4>
								<p className="card-text" style={{ color: 'var(--text-grey)' }}>
									Browse our extensive menu with high-quality images, detailed descriptions, and real-time availability.
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0" style={{ background: 'rgba(42, 42, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>⚡</div>
								<h4 className="card-title" style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Quick Ordering</h4>
								<p className="card-text" style={{ color: 'var(--text-grey)' }}>
									Order directly from your table using QR codes. No waiting, no hassle - just scan and order!
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0" style={{ background: 'rgba(42, 42, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>🎯</div>
								<h4 className="card-title" style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Customization</h4>
								<p className="card-text" style={{ color: 'var(--text-grey)' }}>
									Customize your meals exactly how you like them. Add extra toppings, adjust spice levels, and more.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="container mb-5">
				<h2 className="text-center mb-5 rainbow-gradient" style={{ fontSize: '36px', fontWeight: '800' }}>How It Works</h2>
				<div className="row g-4">
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style={{ 
								width: '80px', 
								height: '80px', 
								fontSize: '32px',
								background: 'linear-gradient(135deg, #ff006e, #ff6b35)',
								boxShadow: '0 4px 15px rgba(255, 0, 110, 0.5)'
							}}>
								1
							</div>
						</div>
						<h5 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Scan QR Code</h5>
						<p style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Scan the QR code on your table to access the menu</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style={{ 
								width: '80px', 
								height: '80px', 
								fontSize: '32px',
								background: 'linear-gradient(135deg, #ff6b35, #ffd23f)',
								boxShadow: '0 4px 15px rgba(255, 107, 53, 0.5)'
							}}>
								2
							</div>
						</div>
						<h5 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Browse & Select</h5>
						<p style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Browse our menu, filter by preferences, and add items to your cart</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style={{ 
								width: '80px', 
								height: '80px', 
								fontSize: '32px',
								background: 'linear-gradient(135deg, #06ffa5, #4ecdc4)',
								boxShadow: '0 4px 15px rgba(6, 255, 165, 0.5)'
							}}>
								3
							</div>
						</div>
						<h5 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Place Order</h5>
						<p style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Review your order, add customizations, and place it with one click</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style={{ 
								width: '80px', 
								height: '80px', 
								fontSize: '32px',
								background: 'linear-gradient(135deg, #5e72e4, #a855f7)',
								boxShadow: '0 4px 15px rgba(94, 114, 228, 0.5)'
							}}>
								4
							</div>
						</div>
						<h5 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Enjoy!</h5>
						<p style={{ color: '#e0e0e0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Track your order status in real-time and enjoy your meal</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mb-5">
				<div className="card border-0 p-5 text-center" style={{ background: 'rgba(42, 42, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
					<h3 className="mb-3 rainbow-gradient" style={{ fontSize: '28px', fontWeight: '800' }}>Ready to Order?</h3>
					<p className="mb-4" style={{ color: '#e0e0e0', fontSize: '18px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Start your dining experience now</p>
					<Link to="/customer" className="btn btn-primary btn-lg px-5">
						Get Started
					</Link>
				</div>
			</section>
		</div>
	);
}

