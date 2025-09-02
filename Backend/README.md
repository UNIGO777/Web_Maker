# Portfolio Maker Backend

A robust Node.js backend API for creating and managing professional portfolios.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Portfolio Management**: Create, update, and manage portfolio content
- **Project Management**: Add, edit, and organize portfolio projects
- **File Uploads**: Support for image and file uploads
- **Security**: Rate limiting, CORS, helmet security headers
- **Validation**: Input validation using express-validator
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers (to be added)
│   ├── middleware/      # Authentication and validation middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (to be added)
│   └── utils/           # Utility functions
├── uploads/             # File upload directory
├── logs/                # Application logs
├── index.js             # Main server file
├── package.json         # Dependencies and scripts
└── env.example          # Environment variables template
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/portfolio_maker

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/avatar` - Update user avatar
- `PUT /api/users/password` - Change password
- `DELETE /api/users/profile` - Delete account

### Portfolio
- `GET /api/portfolio` - Get current user's portfolio
- `POST /api/portfolio` - Create new portfolio
- `PUT /api/portfolio` - Update portfolio
- `GET /api/portfolio/:username` - Get public portfolio by username
- `POST /api/portfolio/projects` - Add project
- `PUT /api/portfolio/projects/:id` - Update project
- `DELETE /api/portfolio/projects/:id` - Delete project

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## 🗄️ Database Models

### User Model
- Basic info (firstName, lastName, email)
- Authentication (password, role, verification status)
- Profile (avatar, contact info)

### Portfolio Model
- Personal information (headline, summary, contact)
- Social links (GitHub, LinkedIn, etc.)
- Skills with proficiency levels
- Work experience
- Education
- Projects with details

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **Input Validation**: Comprehensive validation with express-validator
- **Security Headers**: Helmet for security headers
- **CORS Protection**: Configurable cross-origin settings

## 📝 Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Import and use in `index.js`
3. Add validation middleware
4. Implement error handling

### Adding New Models
1. Create model file in `src/models/`
2. Define schema with validation
3. Add indexes for performance
4. Export model

### Middleware
- **auth**: Protect routes requiring authentication
- **adminAuth**: Restrict to admin users only
- **optionalAuth**: Allow optional authentication
- **validate**: Validate request body using express-validator

## 🚀 Deployment

1. **Set production environment variables**
2. **Build and start the application**
   ```bash
   npm start
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "portfolio-backend"
   ```

## 📊 Health Check

The server includes a health check endpoint:
- `GET /health` - Returns server status and timestamp

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper validation and error handling
3. Include JSDoc comments for functions
4. Test your changes thoroughly

## 📄 License

This project is licensed under the ISC License.

