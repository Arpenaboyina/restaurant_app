export default function About() {
	return (
		<div>
			{/* Header Section */}
			<section className="text-center py-5 mb-5" style={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				color: 'white',
				padding: '60px 20px',
				borderRadius: '10px',
				marginBottom: '40px'
			}}>
				<div className="container">
					<h1 className="display-4 fw-bold mb-3">About Us</h1>
					<p className="lead">Delicious food, exceptional service, unforgettable experiences</p>
				</div>
			</section>

			{/* Story Section */}
			<section className="container mb-5">
				<div className="row align-items-center">
					<div className="col-md-6">
						<h2 className="mb-4">Our Story</h2>
						<p className="lead text-white mb-4">
							Welcome to our restaurant, where culinary excellence meets modern technology. 
							We've been serving delicious meals for years, and now we're bringing the future 
							of dining to your table.
						</p>
						<p className="text-white">
							Our mission is to provide an exceptional dining experience through innovative 
							digital solutions. We combine traditional recipes with modern convenience, 
							allowing you to enjoy great food with ease and comfort.
						</p>
					</div>
					<div className="col-md-6 text-center">
						<div className="bg-light p-5 rounded" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<div style={{ fontSize: '120px' }}>🍴</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="container mb-5">
				<h2 className="text-center mb-5">Our Values</h2>
				<div className="row g-4">
					<div className="col-md-4">
						<div className="card h-100 border-0 shadow-sm">
							<div className="card-body p-4">
								<h4 className="card-title mb-3">✨ Quality</h4>
								<p className="card-text text-white">
									We use only the finest ingredients and prepare every dish with care and attention to detail.
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 border-0 shadow-sm">
							<div className="card-body p-4">
								<h4 className="card-title mb-3">🚀 Innovation</h4>
								<p className="card-text text-white">
									We embrace technology to enhance your dining experience while maintaining the warmth of traditional service.
								</p>
							</div>
						</div>
					</div>
					<div className="col-md-4">
						<div className="card h-100 border-0 shadow-sm">
							<div className="card-body p-4">
								<h4 className="card-title mb-3">❤️ Customer First</h4>
								<p className="card-text text-white">
									Your satisfaction is our priority. We listen to feedback and continuously improve our service.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Highlight */}
			<section className="container mb-5">
				<div className="row">
					<div className="col-md-6 mb-4">
						<h3 className="mb-3">🌐 Digital Menu System</h3>
						<p className="text-white">
							Our state-of-the-art digital menu system allows you to browse items, see real-time availability, 
							customize your orders, and track your meal from kitchen to table.
						</p>
					</div>
					<div className="col-md-6 mb-4">
						<h3 className="mb-3">📱 QR Code Ordering</h3>
						<p className="text-white">
							Simply scan the QR code on your table to access our menu instantly. No need to wait for a waiter 
							or handle physical menus.
						</p>
					</div>
					<div className="col-md-6 mb-4">
						<h3 className="mb-3">⚡ Real-Time Updates</h3>
						<p className="text-white">
							Track your order status in real-time. Know exactly when your food is being prepared, 
							when it's ready, and when it's served.
						</p>
					</div>
					<div className="col-md-6 mb-4">
						<h3 className="mb-3">🎨 Customization</h3>
						<p className="text-white">
							Personalize every dish to your taste. Add extra toppings, adjust spice levels, 
							or request special dietary accommodations.
						</p>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="container mb-5">
				<div className="card bg-light border-0 p-5">
					<div className="row">
						<div className="col-md-6">
							<h3 className="mb-4">Get in Touch</h3>
							<p className="text-muted mb-3">
								<strong>📍 Address:</strong><br />
								123 Restaurant Street, Food City, FC 12345
							</p>
							<p className="text-muted mb-3">
								<strong>📞 Phone:</strong><br />
								9502508859
							</p>
							<p className="text-muted">
								<strong>✉️ Email:</strong><br />
								rakesh@restaurant.com
							</p>
						</div>
						<div className="col-md-6">
							<h3 className="mb-4">Opening Hours</h3>
							<p className="text-muted mb-2">
								<strong>Monday - Friday:</strong> 11:00 AM - 10:00 PM
							</p>
							<p className="text-muted mb-2">
								<strong>Saturday:</strong> 10:00 AM - 11:00 PM
							</p>
							<p className="text-muted">
								<strong>Sunday:</strong> 12:00 PM - 9:00 PM
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}




