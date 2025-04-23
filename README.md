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

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- npm (v7+)
- Git

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd my-sisters-closet
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```env
   PORT=5002
   JWT_SECRET=your_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   SMTP_FROM=noreply@mysisterscloset.org
   ```

4. **Start the Application**
   ```bash
   npm start
   ```
   This will launch both the frontend and backend servers.

## 🚀 Deployment

### Simple Deployment
The application can be deployed with a single command:

```bash
npm start
```

This will start both the client and server components of the application. The client will be available at `http://localhost:3000` and the server at `http://localhost:5002`.

### Production Considerations
For a more permanent deployment:

1. **Database Management**
   - The SQLite database is automatically created on first run
   - To reset the database:
     ```bash
     cd server
     node reset-db.js
     ```

3. **Backup Strategy**
   - Regularly back up the `database.sqlite` file
   - Consider setting up automated backups

## 📜 Available Scripts

### Root Directory Scripts
- `npm start` - Starts both the client and server
- `npm run install:all` - Installs dependencies for both client and server
- `npm run client` - Starts only the client development server
- `npm run server` - Starts only the server
- `npm run dev` - Starts both client and server in development mode with hot reloading

### Server Scripts
- `node reset-db.js` - Resets the database by deleting all donation records
- `node src/index.js` - Starts the server directly

### Client Scripts
- `npm start` - Starts the React development server
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App

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