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
			<header className="main-header">
				<div className="header-container">
					<Link to="/" className="logo">
						<div className="logo-icon">🍴</div>
						<span className="logo-text">RESTFOOD RESTAURANT</span>
					</Link>
					<nav className="main-nav">
						<Link to="/" className="nav-link">HOME</Link>
						<Link to="/about" className="nav-link">ABOUT US</Link>
						<Link to="/chef" className="nav-link">CHEFS</Link>
						<Link to="/customer" className="nav-link">MENU</Link>
						<Link to="/owner" className="nav-link">OWNER</Link>
						<Link to="/about" className="nav-link">GALLERY</Link>
						<Link to="/about" className="nav-link">CONTACTS</Link>
					</nav>
				</div>
			</header>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				<Route path="/owner" element={<Owner />} />
				<Route path="/customer" element={<Customer />} />
				<Route path="/chef" element={<Chef />} />
			</Routes>
		</>
	);
}




