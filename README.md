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
- [Maintenance](#maintenance)

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

**Important**: Replace all placeholder values with your actual configuration.

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

Docker configuration files are included in the repository with built-in health checks for reliable deployments.

**Quick Start:**

1. Create environment configuration:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values
nano .env
```

2. Start the containers:
```bash
docker-compose up -d
```

The application will be accessible at:
- **Client**: http://your-server-ip:8080 (configurable via CLIENT_PORT)
- **Server API**: http://your-server-ip:5002 (configurable via SERVER_PORT)

#### Option 3: Portainer Deployment

This application is fully configured for Portainer deployment with health checks.

**Prerequisites:**
- Portainer installed and running on your server
- Git repository access (GitHub, GitLab, etc.)

**Deployment Steps:**

1. **Access Portainer** (usually at http://your-server-ip:9000)

2. **Navigate to Stacks** > Click "Add stack"

3. **Configure the Stack:**
   - **Name**: `msc-receipt-webapp`
   - **Build method**: Select "Repository"
   - **Repository URL**: Your git repository URL
   - **Repository reference**: `refs/heads/main` (or your branch name)
   - **Compose path**: `docker-compose.yml`

4. **Set Environment Variables** (click "Add environment variable" for each):
   ```
   CLIENT_PORT=8080
   SERVER_PORT=5002
   JWT_SECRET=your-super-secret-jwt-key-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   CLIENT_URL=http://your-server-ip:8080
   ```

   **Important Notes:**
   - Change `CLIENT_PORT` to any available port (e.g., 3000, 8080, 8888)
   - Set `CLIENT_URL` to match your server's IP and `CLIENT_PORT`
   - Generate a secure `JWT_SECRET`: `openssl rand -base64 32`
   - For Gmail, use an [App Password](https://myaccount.google.com/apppasswords)

5. **Deploy** - Click "Deploy the stack"

6. **Monitor Health Status:**
   - Go to "Containers" in Portainer
   - Both `msc-server` and `msc-client` should show as "healthy"
   - If unhealthy, check container logs for errors

7. **Access Your Application:**
   - Open browser to `http://your-server-ip:[CLIENT_PORT]`
   - Default: http://your-server-ip:8080

**Health Checks:**

The application includes automatic health monitoring:
- **Server**: Checks `/health` endpoint every 30 seconds
- **Client**: Checks nginx `/health` endpoint every 30 seconds
- Portainer will automatically restart unhealthy containers

**Troubleshooting Portainer Deployment:**

- **Health check failing**: Check environment variables are set correctly
- **Client shows "Can't connect to server"**: Verify `CLIENT_URL` matches your actual server address
- **Email not working**: Verify SMTP credentials and check server logs
- **Port already in use**: Change `CLIENT_PORT` or `SERVER_PORT` in environment variables

**Updating the Deployment:**

1. Push changes to your git repository
2. In Portainer, go to your stack
3. Click "Pull and redeploy"
4. Wait for health checks to pass

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

## License

© 2025 My Sister's Closet. All rights reserved.

---

<div align="center">
  <p>Developed for My Sister's Closet</p>
  <p>A professional donation management solution</p>
</div>
