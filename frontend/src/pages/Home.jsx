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
			<section className="hero-section text-center text-white py-5" style={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				padding: '80px 20px',
				marginBottom: '40px',
				borderRadius: '10px'
			}}>
				<div className="container">
					<h1 className="display-3 fw-bold mb-4">Welcome to Our Restaurant</h1>
					<p className="lead mb-4">Experience the finest dining with our digital menu and ordering system</p>
					<div className="d-flex gap-3 justify-content-center flex-wrap">
						<Link to="/customer" className="btn btn-light btn-lg px-4">
							Order Now
						</Link>
						<Link to="/about" className="btn btn-outline-light btn-lg px-4">
							Learn More
						</Link>
					</div>
				</div>
			</section>

			{/* QR Scanner Demo Section */}
			<section className="container mb-5">
				<div className="card shadow-lg border-0" style={{
					background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
					borderRadius: '20px',
					overflow: 'hidden'
				}}>
					<div className="card-body p-5">
						<div className="row align-items-center">
							<div className="col-md-6 text-center mb-4 mb-md-0">
								<h2 className="fw-bold mb-4">📱 Scan QR Code</h2>
								<p className="lead text-muted mb-4">
									Point your camera at the QR code on your table to instantly access our digital menu
								</p>
								<div className="bg-white p-4 rounded-lg shadow-lg d-inline-block">
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
									<p className="text-muted small">
										💡 <strong>Demo:</strong> Enter a table ID and click "Go to Menu" or scan the QR code above
									</p>
								</div>
							</div>
							<div className="col-md-6">
								<div className="p-4">
									<h3 className="fw-bold mb-4">How to Use QR Code</h3>
									<div className="d-flex align-items-start mb-3">
										<div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
											1
										</div>
										<div>
											<h5 className="fw-bold">Find QR Code</h5>
											<p className="text-muted mb-0">Look for the QR code displayed on your table</p>
										</div>
									</div>
									<div className="d-flex align-items-start mb-3">
										<div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
											2
										</div>
										<div>
											<h5 className="fw-bold">Scan with Phone</h5>
											<p className="text-muted mb-0">Open your camera app and point it at the QR code</p>
										</div>
									</div>
									<div className="d-flex align-items-start mb-3">
										<div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
											3
										</div>
										<div>
											<h5 className="fw-bold">Access Menu</h5>
											<p className="text-muted mb-0">You'll be automatically redirected to our digital menu</p>
										</div>
									</div>
									<div className="d-flex align-items-start">
										<div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
											4
										</div>
										<div>
											<h5 className="fw-bold">Start Ordering</h5>
											<p className="text-muted mb-0">Browse, customize, and place your order instantly</p>
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
				<h2 className="text-center mb-5">Why Choose Us?</h2>
				<div className="row g-4">
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0">
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>🍽️</div>
								<h4 className="card-title">Digital Menu</h4>
								<p className="card-text text-muted">
									Browse our extensive menu with high-quality images, detailed descriptions, and real-time availability.
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0">
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>⚡</div>
								<h4 className="card-title">Quick Ordering</h4>
								<p className="card-text text-muted">
									Order directly from your table using QR codes. No waiting, no hassle - just scan and order!
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 shadow-sm border-0">
							<div className="card-body text-center p-4">
								<div className="mb-3" style={{ fontSize: '48px' }}>🎯</div>
								<h4 className="card-title">Customization</h4>
								<p className="card-text text-muted">
									Customize your meals exactly how you like them. Add extra toppings, adjust spice levels, and more.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="container mb-5">
				<h2 className="text-center mb-5">How It Works</h2>
				<div className="row g-4">
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
								1
							</div>
						</div>
						<h5>Scan QR Code</h5>
						<p className="text-muted">Scan the QR code on your table to access the menu</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
								2
							</div>
						</div>
						<h5>Browse & Select</h5>
						<p className="text-muted">Browse our menu, filter by preferences, and add items to your cart</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
								3
							</div>
						</div>
						<h5>Place Order</h5>
						<p className="text-muted">Review your order, add customizations, and place it with one click</p>
					</div>
					<div className="col-md-3 text-center">
						<div className="mb-3">
							<div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
								4
							</div>
						</div>
						<h5>Enjoy!</h5>
						<p className="text-muted">Track your order status in real-time and enjoy your meal</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mb-5">
				<div className="card bg-light border-0 p-5 text-center">
					<h3 className="mb-3">Ready to Order?</h3>
					<p className="text-muted mb-4">Start your dining experience now</p>
					<Link to="/customer" className="btn btn-primary btn-lg px-5">
						Get Started
					</Link>
				</div>
			</section>
		</div>
	);
}

