# 🍽️ Restaurant Management System

A modern, full-stack restaurant management system with QR code-based digital menu ordering, real-time order tracking, and comprehensive owner/chef dashboards.

## ✨ Features

### 🎯 Customer Features
- **QR Code Menu Access** - Scan QR code on table to access digital menu instantly
- **Real-time Menu Browsing** - Browse menu items with filters (Veg/Non-Veg, search)
- **Shopping Cart** - Add items, customize orders, and manage quantities
- **Order Tracking** - Real-time order status updates (New → Preparing → Ready → Served)
- **Customer Feedback** - Rate food and service after order completion
- **Call Waiter** - One-click waiter notification

### 👨‍💼 Owner Dashboard
- **Menu Management** - Add, edit, delete, and manage menu items
- **Table Management** - Create tables with QR codes for customer access
- **Order Management** - View and manage all orders with status updates
- **Analytics Dashboard** - Daily orders, satisfaction ratings, prep times, top/least selling items
- **Customer Feedback** - View and analyze customer feedback and suggestions

### 👨‍🍳 Chef Dashboard
- **Kitchen View** - Organized order management by status (New, Preparing, Ready, Served)
- **Order Updates** - Update order status as food is prepared
- **Real-time Sync** - Automatic order updates every 5 seconds

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI framework
- **React Router 6** - Client-side routing
- **Bootstrap 5** - Responsive UI components
- **QRCode.react** - QR code generation
- **Modern CSS** - Dark theme with gradient animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerization
- **Kubernetes** - Container orchestration
- **Jenkins** - CI/CD pipeline
- **Docker Hub** - Image registry

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or remote)
- **Docker** (for containerized deployment)
- **kubectl** (for Kubernetes deployment)
- **Jenkins** (for CI/CD)

## 🚀 Quick Start

### Local Development

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd restaurant
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=4000
MONGO_URI=mongodb://localhost:27017/restaurant
OWNER_PASSWORD=your_owner_password
OWNER_JWT_SECRET=your_jwt_secret
TABLE_JWT_SECRET=your_table_jwt_secret
CLIENT_ORIGIN=http://localhost:3000
EOF

# Start MongoDB (if local)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

npm start
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Docker Development

#### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **MongoDB**: localhost:27017

## 🐳 Docker

### Build Images
```bash
# Build backend
docker build -t restaurant-backend:latest backend/

# Build frontend
docker build -t restaurant-frontend:latest frontend/
```

### Run Containers
```bash
# Run MongoDB
docker run -d --name mongo -p 27017:27017 mongo:latest

# Run backend
docker run -d --name backend \
  -p 4000:4000 \
  -e MONGO_URI=mongodb://mongo:27017/restaurant \
  -e OWNER_PASSWORD=your_password \
  --link mongo \
  restaurant-backend:latest

# Run frontend
docker run -d --name frontend \
  -p 3000:80 \
  restaurant-frontend:latest
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster running
- kubectl configured
- Docker images pushed to registry

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongo-statefulset.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n restaurant
kubectl get services -n restaurant
kubectl get ingress -n restaurant
```

### Access Services

**NodePort Access:**
- **Frontend**: http://localhost:30080
- **Backend**: http://localhost:30040

**Ingress Access (if configured):**
- **Frontend**: http://restaurant.local
- **Backend API**: http://restaurant.local/api

### Update Images
```bash
# Update backend image
kubectl set image deployment/backend \
  backend=your-dockerhub-username/restaurant-backend:latest \
  -n restaurant

# Update frontend image
kubectl set image deployment/frontend \
  frontend=your-dockerhub-username/restaurant-frontend:latest \
  -n restaurant

# Check rollout status
kubectl rollout status deployment/backend -n restaurant
kubectl rollout status deployment/frontend -n restaurant
```

## 🔄 CI/CD Pipeline (Jenkins)

### Pipeline Stages

1. **Checkout** - Clone repository from SCM
2. **Backend Test** - Install dependencies and run tests
3. **Frontend Test** - Install dependencies and run tests
4. **Build Docker Images** - Build backend and frontend images
5. **Login to Docker Hub** - Authenticate with Docker Hub
6. **Push Images** - Push images to Docker Hub registry
7. **Deploy to Kubernetes** - Apply manifests and update deployments

### Jenkins Setup

1. **Create Pipeline Job**
   - New Item → Pipeline
   - Configure SCM (Git)
   - Script Path: `Jenkinsfile`

2. **Configure Credentials**
   - **Docker Hub**: `dockerhub` (username/password)
   - **Kubernetes**: `kubeconfig` (kubeconfig file)

3. **Run Pipeline**
   - Build Now or trigger via webhook

See [QUICK_START.md](QUICK_START.md) and [JENKINS_SETUP.md](JENKINS_SETUP.md) for detailed setup instructions.

## 📁 Project Structure

```
restaurant/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server setup
│   │   ├── routes/
│   │   │   ├── owner.js      # Owner API routes
│   │   │   └── customer.js   # Customer API routes
│   │   └── models/
│   │       ├── MenuItem.js   # Menu item model
│   │       ├── Table.js      # Table model
│   │       ├── Order.js      # Order model
│   │       └── Feedback.js   # Feedback model
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── api.js            # API client
│   │   ├── pages/
│   │   │   ├── Home.jsx      # Landing page
│   │   │   ├── Customer.jsx  # Customer interface
│   │   │   ├── Owner.jsx     # Owner dashboard
│   │   │   ├── Chef.jsx      # Chef dashboard
│   │   │   ├── About.jsx     # About page
│   │   │   └── Chef.jsx      # Chef interface
│   │   └── styles.css        # Global styles
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── k8s/
│   ├── namespace.yaml        # Kubernetes namespace
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongo-statefulset.yaml
│   ├── ingress.yaml          # Ingress configuration
│   └── hpa.yaml             # Horizontal Pod Autoscaler
│
├── docker-compose.yml        # Docker Compose configuration
├── Jenkinsfile              # Jenkins CI/CD pipeline
└── README.md               # This file
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=4000

# Database
MONGO_URI=mongodb://localhost:27017/restaurant

# Authentication
OWNER_PASSWORD=your_owner_password
OWNER_JWT_SECRET=your_jwt_secret_key
TABLE_JWT_SECRET=your_table_jwt_secret_key

# Client
CLIENT_ORIGIN=http://localhost:3000
```

### Frontend

The frontend automatically detects the API endpoint based on the environment. For custom configuration:

```env
REACT_APP_API_BASE=http://your-backend-url/api
```

## 📡 API Endpoints

### Owner Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/owner/login` | Owner login | No |
| GET | `/api/owner/menu` | Get all menu items | Yes |
| POST | `/api/owner/menu` | Create menu item | Yes |
| PUT | `/api/owner/menu/:id` | Update menu item | Yes |
| DELETE | `/api/owner/menu/:id` | Delete menu item | Yes |
| GET | `/api/owner/tables` | Get all tables | Yes |
| POST | `/api/owner/tables` | Create table | Yes |
| PUT | `/api/owner/tables/:id` | Update table | Yes |
| DELETE | `/api/owner/tables/:id` | Delete table | Yes |
| GET | `/api/owner/orders` | Get all orders | Yes |
| POST | `/api/owner/orders/:id/status` | Update order status | Yes |
| GET | `/api/owner/feedback` | Get all feedback | Yes |
| GET | `/api/owner/analytics/summary` | Get analytics | Yes |

### Customer Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/customer/table/verify` | Verify table credentials | No |
| GET | `/api/customer/menu` | Get available menu | No |
| POST | `/api/customer/orders` | Create order | Yes |
| GET | `/api/customer/orders` | Get customer orders | Yes |
| POST | `/api/customer/feedback` | Submit feedback | Yes |
| POST | `/api/customer/call-waiter` | Call waiter | Yes |

## 🎨 UI Features

- **Dark Theme** - Modern dark UI with gradient accents
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Automatic order status refresh
- **QR Code Integration** - Generate and scan QR codes for table access
- **Gradient Animations** - Beautiful rainbow gradient effects
- **Glassmorphism** - Modern glass-like UI elements

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style
- ESLint configured for React
- Follow existing code patterns
- Use meaningful variable names

## 🐛 Troubleshooting

### CORS Issues
- Ensure backend CORS is configured correctly
- Check `CLIENT_ORIGIN` environment variable
- Verify ingress CORS annotations (if using Kubernetes)

### MongoDB Connection
- Verify MongoDB is running
- Check `MONGO_URI` environment variable
- Ensure network connectivity

### Docker Issues
- Check Docker daemon is running
- Verify image names match in Kubernetes manifests
- Check image pull policy settings

### Kubernetes Issues
- Verify kubectl is configured correctly
- Check pod logs: `kubectl logs <pod-name> -n restaurant`
- Verify services are running: `kubectl get svc -n restaurant`

## 📝 License

This project is private and proprietary.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Check existing documentation
- Review troubleshooting section
- Contact the development team

## 🚀 Future Enhancements

- [ ] Payment integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Inventory management
- [ ] Staff management
- [ ] Reservation system
- [ ] Loyalty program

---

**Built with ❤️ using React, Node.js, and Kubernetes**

