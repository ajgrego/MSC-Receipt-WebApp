# My Sister's Closet - Receipt Management System

<div align="center">
  <img src="client/public/images.png" alt="My Sister's Closet Logo" width="200"/>
  <h3>Receipt Management System</h3>
</div>

## Overview

The My Sister's Closet Donation Management System is a full-stack web application built to streamline the donation process for both cash and in-kind contributions. The system provides automated receipt generation, secure administrative oversight, and excellent logging.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [User Management](#user-management)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Features

### Donation Processing
- **Cash Donations**: Quick form entry with automatic receipt generation and email delivery
- **In-Kind Donations**: Multiple item tracking with individual valuations and automatic total calculation
- **Real-time Validation**: Comprehensive form validation for data integrity
- **Receipt Generation**: Professional, branded receipts with print and email capabilities

### Administrative Features
- **Secure Authentication**: JWT-based authentication with protected admin routes
- **Donation Dashboard**: Comprehensive view of all donations with advanced filtering
- **Date Range Filtering**: Filter donations by date range for reporting
- **Excel Export**: Export donation data to formatted Excel spreadsheets
- **Real-time Updates**: Socket.IO integration for live donation updates
- **Monthly Logging**: Automatic Excel logging organized by month

### Data Management
- **SQLite Database**: Lightweight, file-based database for easy deployment
- **Automatic Backups**: Simple file-based backup strategy
- **Address Management**: Structured address fields (street, city, state, ZIP)
- **Phone Formatting**: Automatic phone number formatting (XXX) XXX-XXXX

## Technical Stack

### Frontend
- React 18.2.0 with React Router v6
- Material-UI (MUI) 5.15.10 for UI components
- Axios for HTTP requests
- Socket.IO Client for real-time updates
- html2pdf.js for client-side PDF generation
- date-fns for date manipulation

### Backend
- Node.js with Express.js 4.18.2
- SQLite3 5.1.7 for database
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Nodemailer for email functionality
- Puppeteer for server-side PDF generation
- Socket.IO for real-time communication
- express-validator for input validation

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ajgrego/MSC-Receipt-WebApp.git
cd MSC-Receipt-WebApp
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
npm run install:all
```

Or install individually:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following environment variables to `server/.env`:

```env
# Server Configuration
PORT=5002

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_secure_random_secret_key_here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-specific-password
SMTP_FROM=your-email@gmail.com
```

**Important**: Replace all placeholder values with your actual configuration. For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833).

## Configuration

### Database Setup

The database is automatically initialized on first run. The SQLite database file will be created at:

```
/MSC-Receipt-WebApp/server/database.sqlite
```

Three admin accounts are created by default (see [User Management](#user-management) to change these):
- Username: `sandy` / Password: `MSCreceipts`
- Username: `kate` / Password: `MSCreceipts`
- Username: `anthony` / Password: `MSCreceipts`

### Email Configuration

Email functionality is optional. If SMTP credentials are not configured, the application will function normally, but email receipt delivery will not be available.

For Gmail SMTP:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the App Password in the `SMTP_PASS` field

## Deployment

### Development Mode

Run both client and server in development mode with hot reloading:

```bash
npm run dev
```

This starts:
- Client: http://localhost:3000
- Server: http://localhost:5002

### Production Deployment

#### Option 1: Standard Deployment

1. Build the React client:
```bash
cd client
npm run build
```

2. The server is configured to serve the built client in production mode. Start the server:
```bash
cd ../server
npm start
```

#### Option 2: Docker Deployment

Docker configuration files are included in the repository:

```bash
docker-compose up -d
```

#### Option 3: Process Manager (PM2)

For production deployments, use PM2 to keep the application running:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
cd server
pm2 start src/index.js --name msc-donations

# Save the PM2 configuration
pm2 save

# Configure PM2 to start on system boot
pm2 startup
```

### Reverse Proxy Configuration

For production, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## User Management

### Changing Default Admin Credentials

**Important**: Change default passwords before deploying to production.

Edit `/server/src/config/database.js`:

```javascript
// Locate this section (around line 49-53)
const admins = [
  { username: 'sandy', password: 'MSCreceipts' },
  { username: 'kate', password: 'MSCreceipts' },
  { username: 'anthony', password: 'MSCreceipts' }
];
```

### Adding New Admin Users

1. Open `/server/src/config/database.js`
2. Add a new entry to the `admins` array:

```javascript
const admins = [
  { username: 'sandy', password: 'NewSecurePassword123' },
  { username: 'kate', password: 'NewSecurePassword456' },
  { username: 'anthony', password: 'NewSecurePassword789' },
  { username: 'newuser', password: 'SecurePassword!' }  // New admin
];
```

3. Restart the server. The new user will be automatically created on next startup.

### Deleting Admin Users

To remove an admin user:

1. Open `/server/src/config/database.js`
2. Remove the user entry from the `admins` array
3. Manually delete from database:

```bash
# Connect to the SQLite database
sqlite3 server/database.sqlite

# Delete the user
DELETE FROM admin WHERE username = 'username_to_delete';

# Exit
.exit
```

4. Restart the server

### Resetting the Database

To completely reset the database (deletes all donations and recreates admin users):

```bash
cd server
rm database.sqlite
npm start
```

**Warning**: This will permanently delete all donation records.

## Usage Guide

### Making a Donation

1. Navigate to the home page
2. Select donation type (Cash or In-Kind)
3. Fill in donor information:
   - Name (required)
   - Street Address (optional)
   - City (optional)
   - State (optional)
   - ZIP Code (optional)
   - Phone Number (optional)
   - Email (optional)
4. For Cash Donations: Enter the amount
5. For In-Kind Donations: Add items with descriptions and values
6. Submit the form
7. Receipt is automatically generated and displayed
8. Choose to print or email the receipt

### Administrative Access

1. Navigate to `/admin` or click "Admin" in the navigation
2. Log in with admin credentials
3. View all donations in the dashboard
4. Use filters to search by:
   - Date range
   - Donation type (Cash/In-Kind)
   - Donor name or email
5. Export data to Excel
6. Delete donations if needed

### Excel Exports

Two types of Excel exports are available:

1. **Monthly Logs**: Automatically created in `/server/excel-logs/` directory
   - Format: `donations-YYYY-MM.xlsx`
   - Created automatically when donations are submitted

2. **On-Demand Exports**: Generated from the Admin Panel
   - Click "Export to Excel" button
   - Downloads all filtered donations

## API Documentation

### Public Endpoints

#### Create Donation
```
POST /api/donations
Content-Type: application/json

Body:
{
  "type": "cash" | "in-kind",
  "date": "YYYY-MM-DD",
  "donor_name": "string",
  "street_address": "string" (optional),
  "city": "string" (optional),
  "state": "string" (optional),
  "zip_code": "string" (optional),
  "donor_phone": "string" (optional),
  "donor_email": "string" (optional),
  "amount": number (for cash),
  "items": array (for in-kind),
  "total_value": number (for in-kind)
}
```

#### Email Receipt
```
POST /api/donations/:id/email
Content-Type: application/json

Body:
{
  "email": "recipient@example.com"
}
```

### Protected Endpoints (Require JWT Token)

#### Get All Donations
```
GET /api/donations
Headers: { "Authorization": "Bearer <token>" }
```

#### Get Donation by ID
```
GET /api/donations/:id
```

#### Delete Donation
```
DELETE /api/donations/:id
Headers: { "Authorization": "Bearer <token>" }
```

#### Export to Excel
```
GET /api/donations/export/excel
Headers: { "Authorization": "Bearer <token>" }
```

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt_token_string",
  "username": "string"
}
```

#### Verify Token
```
GET /api/auth/verify
Headers: { "Authorization": "Bearer <token>" }
```

## Maintenance

### Regular Tasks

1. **Database Backups** (Recommended: Daily)
```bash
# Backup the database
cp server/database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

2. **Excel Log Rotation** (Monthly)
```bash
# Archive old Excel logs
tar -czf excel-logs-$(date +%Y%m).tar.gz server/excel-logs/
```

3. **System Updates**
```bash
# Update dependencies
npm update
cd client && npm update
cd ../server && npm update
```

### Monitoring

Monitor the application logs:

```bash
# If using PM2
pm2 logs msc-donations

# If running directly
cd server
npm start
```

### Performance Optimization

For high-volume deployments:

1. Consider migrating to PostgreSQL or MySQL
2. Implement connection pooling
3. Add Redis for session management
4. Enable Nginx caching
5. Use a CDN for static assets

## Troubleshooting

### Common Issues

**Issue**: Email receipts not sending
- **Solution**: Verify SMTP configuration in `.env` file. Check firewall rules for port 587.

**Issue**: Admin login fails
- **Solution**: Verify credentials in `database.js`. Check JWT_SECRET in `.env`.

**Issue**: Database errors after updates
- **Solution**: The system includes automatic migration for the address field changes. Delete `database.sqlite` to recreate (WARNING: loses data).

**Issue**: Socket.IO connection errors
- **Solution**: Ensure client is configured to connect to the correct server URL. Check CORS settings.

**Issue**: PDF generation fails
- **Solution**: Ensure Puppeteer dependencies are installed. On Linux: `sudo apt-get install -y libgbm1`

### Logs and Debugging

Application logs are output to the console. For production deployments with PM2:

```bash
# View logs
pm2 logs msc-donations

# View error logs only
pm2 logs msc-donations --err

# Clear logs
pm2 flush
```

### Database Inspection

To inspect the database directly:

```bash
sqlite3 server/database.sqlite

# View all tables
.tables

# View donations
SELECT * FROM donations LIMIT 10;

# View admin users
SELECT id, username, created_at FROM admin;

# Exit
.exit
```

## Project Structure

```
MSC-Receipt-WebApp/
├── client/                  # React frontend
│   ├── public/             # Static assets
│   │   └── images.png      # MSC logo
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   └── Navbar.js
│   │   ├── pages/          # Page components
│   │   │   ├── Home.js
│   │   │   ├── CashDonation.js
│   │   │   ├── InKindDonation.js
│   │   │   ├── AdminPanel.js
│   │   │   └── Login.js
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   │   └── database.js # Database setup and admin users
│   │   ├── routes/         # API routes
│   │   │   ├── donations.js
│   │   │   └── auth.js
│   │   ├── utils/          # Utility functions
│   │   │   └── excelLogger.js
│   │   └── index.js        # Server entry point
│   ├── excel-logs/         # Monthly Excel logs (auto-created)
│   ├── .env                # Environment variables (create this)
│   └── package.json
├── database.sqlite         # SQLite database (auto-created)
├── docker-compose.yml      # Docker configuration
├── package.json            # Root package (monorepo)
└── README.md              # This file
```

## Available Scripts

### Root Directory
- `npm start` - Start both client and server in production mode
- `npm run dev` - Start both in development mode with hot reload
- `npm run install:all` - Install all dependencies
- `npm run client` - Start client only
- `npm run server` - Start server only

### Client Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Server Directory
- `npm start` - Start server with nodemon
- `node src/index.js` - Start server directly

## Security Considerations

1. **Change Default Passwords**: Modify default admin credentials before production deployment
2. **Environment Variables**: Never commit `.env` files to version control
3. **JWT Secret**: Use a strong, random secret key (minimum 32 characters)
4. **HTTPS**: Always use HTTPS in production (configure via Nginx/Apache)
5. **Rate Limiting**: Consider implementing rate limiting for authentication endpoints
6. **Input Validation**: All inputs are validated on both client and server
7. **SQL Injection**: Parameterized queries prevent SQL injection attacks

## License

© 2024 My Sister's Closet. All rights reserved.

## Support

For technical support or questions, please contact the system administrator.

---

<div align="center">
  <p>Developed for My Sister's Closet</p>
  <p>A professional donation management solution</p>
</div>
