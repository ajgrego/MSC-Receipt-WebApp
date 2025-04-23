# My Sister's Closet - Donation Management System

<div align="center">
  <img src="client/public/images.png" alt="My Sister's Closet Logo" width="200"/>
  <h3>Streamlining Donation Processing and Management</h3>
</div>

## 🌟 Overview

The My Sister's Closet Donation Management System is a comprehensive web application designed to streamline the donation process for both cash and in-kind contributions. This system modernizes donation handling, receipt generation, and administrative oversight while maintaining a user-friendly interface.

## ✨ Key Features

### 💎 Donation Processing
- **Cash Donations**
  - Quick and intuitive form entry
  - Automatic receipt generation
  - Real-time validation
  - Email receipt functionality

- **In-Kind Donations**
  - Multiple item entry
  - Individual item valuation
  - Automatic total calculation
  - Detailed item listing in receipts

### 📊 Administrative Features
- **Secure Admin Portal**
  - Protected access with authentication
  - Comprehensive donation history
  - Advanced filtering capabilities:
    - Date range selection
    - Donation type filtering
    - Real-time search

- **Data Management**
  - Excel export functionality
  - Formatted phone numbers
  - Organized data presentation
  - Secure data storage

### 🧾 Receipt Management
- **Professional Receipt Generation**
  - Branded layout
  - Print-ready formatting
  - Email delivery option
  - PDF generation

## 🛠 Technical Stack

- **Frontend**
  - React.js 18+
  - Material-UI (MUI)
  - React Router v6
  - Axios for API calls

- **Backend**
  - Node.js
  - Express.js
  - SQLite database
  - JWT authentication

- **Additional Technologies**
  - Socket.IO for real-time updates
  - html2pdf.js for PDF generation
  - SheetJS for Excel export
  - Nodemailer for email functionality

## 🚀 Quick Start Guide

### Development Setup (ThinkPad)

1. **Clone and Install**
   ```bash
   # Clone the repository
   git clone [repository-url]
   cd MSC-Receipt-WebApp

   # Install all dependencies (this will install for both client and server)
   npm run install:all
   ```

2. **Environment Setup**
   ```bash
   # Navigate to server directory
   cd server

   # Create .env file
   echo "PORT=5002
   JWT_SECRET=your_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   SMTP_FROM=noreply@mysisterscloset.org" > .env

   # Return to root directory
   cd ..
   ```

3. **Start Development Server**
   ```bash
   # This will start both client and server in development mode
   npm start

   # The application will be available at:
   # Frontend: http://localhost:3000
   # Backend: http://localhost:5002
   ```

### Production Deployment (Work Network)

1. **Build the Application**
   ```bash
   # Navigate to client directory
   cd client
   
   # Create production build
   npm run build
   
   # Return to root
   cd ..
   ```

2. **Server Configuration**
   - Update the `.env` file in the server directory with production values
   - Ensure all SMTP settings are configured for your work email server
   - Set `NODE_ENV=production`

3. **Database Setup**
   ```bash
   # Navigate to server directory
   cd server
   
   # Initialize the database (if first time)
   node src/db/init.js
   ```

4. **Start Production Server**
   ```bash
   # In the server directory
   NODE_ENV=production npm start
   ```

### Available Scripts

All scripts can be run from the root directory:

- `npm run install:all` - Installs all dependencies (client + server)
- `npm start` - Starts both client and server in development mode
- `npm run start:client` - Starts only the client
- `npm run start:server` - Starts only the server
- `npm run install:client` - Installs only client dependencies
- `npm run install:server` - Installs only server dependencies

### Troubleshooting

1. **Port Conflicts**
   - If port 3000 or 5002 is in use:
     ```bash
     # Windows (PowerShell)
     netstat -ano | findstr :3000
     netstat -ano | findstr :5002
     
     # Then kill the process using the PID
     taskkill /PID [PID] /F
     ```

2. **Database Issues**
   - If you encounter database errors:
     ```bash
     cd server
     # Backup existing database
     copy database.sqlite database.sqlite.backup
     # Reinitialize database
     node src/db/init.js
     ```

3. **Node Module Issues**
   - If you encounter module-related errors:
     ```bash
     # Clear npm cache
     npm cache clean --force
     
     # Remove all node_modules and reinstall
     rm -rf node_modules
     rm -rf client/node_modules
     rm -rf server/node_modules
     npm run install:all
     ```

## 🔧 System Architecture

### Frontend Architecture
- **Pages**
  - `Home.js` - Landing page with donation type selection
  - `CashDonation.js` - Form for cash donations
  - `InKindDonation.js` - Form for in-kind donations
  - `AdminPanel.js` - Administrative dashboard for managing donations

- **Components**
  - Reusable UI components from Material-UI
  - Custom form components for donation entry
  - Receipt preview components

### Backend Architecture
- **Routes**
  - `/api/donations` - Handles donation creation, retrieval, and management
  - `/api/auth` - Manages authentication and authorization
  - `/api/donations/export/excel` - Handles Excel export functionality

- **Utils**
  - `excelLogger.js` - Manages Excel file creation and logging
  - `database.js` - Database configuration and initialization

- **Database Schema**
  - `donations` table - Stores all donation records
  - `admin` table - Stores admin user credentials

## 👥 User Guide

### Making Donations
1. Select donation type (Cash/In-Kind)
2. Fill in donor information
3. Enter donation details
4. Submit and generate receipt
5. Choose to print or email the receipt

### Administrative Access
1. Navigate to `/admin`
2. Log in with provided credentials
3. Access donation history and management tools
4. Use filters to find specific donations
5. Export data as needed

## 🔐 Security

- JWT-based authentication
- Encrypted password storage
- Protected admin routes
- Secure email transmission
- Data validation and sanitization

## 🛟 Support

For technical support or questions:
- Email: [support-email]
- Phone: [support-phone]
- Hours: Monday-Friday, 9 AM - 5 PM EST

## 🔄 Maintenance

### Regular Tasks
- Database backups (recommended daily)
- Log rotation
- System updates

### Troubleshooting
- Check server logs in `server/logs`
- Monitor email service status
- Verify database connectivity
- Check network permissions

---

<div align="center">
  <p>Developed with ❤️ for My Sister's Closet</p>
  <p>© 2024 My Sister's Closet. All rights reserved.</p>
</div> 