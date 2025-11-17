import { Link, Route, Routes } from 'react-router-dom';
import Owner from './pages/Owner.jsx';
import Customer from './pages/Customer.jsx';
import Chef from './pages/Chef.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import './styles.css';

export default function App() {
	return (
		<>
			<header className="bg-white shadow-sm mb-4">
				<div className="container">
					<nav className="navbar navbar-expand-lg navbar-light">
						<Link to="/" className="navbar-brand fw-bold fs-4">🍽️ Restaurant</Link>
						<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse" id="navbarNav">
							<ul className="navbar-nav ms-auto">
								<li className="nav-item">
									<Link to="/" className="nav-link">Home</Link>
								</li>
								<li className="nav-item">
									<Link to="/about" className="nav-link">About</Link>
								</li>
								<li className="nav-item">
									<Link to="/customer" className="nav-link">Order</Link>
								</li>
								<li className="nav-item">
									<Link to="/owner" className="nav-link">Owner</Link>
								</li>
								<li className="nav-item">
									<Link to="/chef" className="nav-link">Chef</Link>
								</li>
							</ul>
						</div>
					</nav>
				</div>
			</header>
			<div className="container">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/owner" element={<Owner />} />
					<Route path="/customer" element={<Customer />} />
					<Route path="/chef" element={<Chef />} />
				</Routes>
			</div>
		</>
	);
}




