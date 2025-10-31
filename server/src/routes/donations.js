const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken } = require('./auth');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const excelLogger = require('../utils/excelLogger');

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '';
  
  // Strip all non-numeric characters
  const cleaned = phoneNumberString.replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  // If the number doesn't match the expected format, return the original
  return phoneNumberString;
};

// Create email transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email configuration is missing. Please check your .env file.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate PDF receipt
const generatePDFReceipt = async (donation) => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  
  // Format items for PDF if it's an in-kind donation
  let itemsHtml = '';
  if (donation.type === 'in-kind' && donation.items) {
    try {
      const items = JSON.parse(donation.items);
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #F052A1;">
              <th style="text-align: left; padding: 12px; font-size: 1.1em;">Description</th>
              <th style="text-align: right; padding: 12px; font-size: 1.1em;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${item.description}</td>
                <td style="text-align: right; padding: 10px;">$${parseFloat(item.value).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 2px solid #F052A1;">
              <td style="padding: 12px; font-weight: bold; font-size: 1.1em;">Total Value:</td>
              <td style="text-align: right; padding: 12px; font-weight: bold; font-size: 1.1em;">$${parseFloat(donation.total_value).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } catch (e) {
      console.error('Error parsing items:', e);
    }
  }

  const letterContent = donation.type === 'in-kind' 
    ? `On behalf of the women we serve and My Sister's Closet staff, we wish to thank you for 
contributing to our organization. Your support is deeply appreciated. Your generous gift will 
help us to provide essential tools and training to low-income and at-risk women who have the 
immediate goal of moving beyond poverty by finding sustainable employment. By helping 
these vulnerable women remarket themselves as credible, professional, and reliable job 
candidates, we can directly increase their chances of eventually becoming self-sufficient.

Since 1998, MSC has helped thousands of voucher clients with essential mentoring and advocacy 
assistance to overcome obstacles such as homelessness and domestic violence. In many cases, these 
individuals have not been able to move forward because they lack basic life skills and education. My 
Sister's Closet of Monroe County helps them take critical steps to change their ability to move into 
better-paying jobs with benefits. By providing this unique assistance, they are able to change their 
economic standing and provide better lives for their children.

My Sister's Closet also provides emergency clothing and hygiene products (hats, gloves, 
chapstick, sunscreen, dry socks, shoes, etc.) to over one hundred indigent walk-ins. In addition, 
approximately 800 local women each year seek out My Sister's Closet for discounted professional 
clothing and free image consulting.

We can only continue to provide these life-changing services because of your valuable support.`
    : `On behalf of the women we serve, thank you for your generous gift. MSC uses unique 
mentoring, advocacy, tools and training services to help clients living in poverty or at-risk 
circumstances stabilize their lives and meet with life success. By helping these women remarket 
themselves as credible, professional, and reliable job candidates, we can directly increase their 
chances of becoming self-sufficient.

Since 1998, MSC has helped thousands of women move past obstacles such as homelessness 
and domestic violence, and into better-paying jobs with benefits. By providing these life-changing 
services, they are able to improve their economic standing and provide brighter lives for their children.`;

  const logoPath = path.join(__dirname, '../../../client/public/images.png');
  const logoBase64 = await fs.readFile(logoPath, { encoding: 'base64' });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 25px;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #F052A1;
          padding-bottom: 20px;
        }
        .logo {
          max-width: 180px;
          margin-bottom: 15px;
        }
        .receipt-title {
          font-size: 24px;
          color: #F052A1;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 12px;
          margin-bottom: 20px;
          font-size: 1.1em;
        }
        .label {
          font-weight: bold;
          color: #F052A1;
        }
        .value {
          color: #333;
        }
        .letter {
          margin: 20px 0;
          text-align: justify;
          line-height: 1.5;
          font-size: 1em;
        }
        .signature {
          margin-top: 25px;
          color: #F052A1;
        }
        .signature p {
          margin: 5px 0;
        }
        .tax-notice {
          margin-top: 25px;
          font-style: italic;
          color: #666;
          font-size: 0.9em;
          border-top: 1px solid #F052A1;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="data:image/png;base64,${logoBase64}" alt="My Sister's Closet Logo" class="logo">
        <div class="receipt-title">Donation Receipt</div>
      </div>

      <div class="info-grid">
        <div class="label">Date of Gift:</div>
        <div class="value">${new Date(donation.date).toLocaleDateString()}</div>

        <div class="label">Name:</div>
        <div class="value">${donation.donor_name}</div>

        ${donation.donor_address ? `
          <div class="label">Address:</div>
          <div class="value">${donation.donor_address}</div>
        ` : ''}

        ${donation.donor_phone ? `
          <div class="label">Phone:</div>
          <div class="value">${formatPhoneNumber(donation.donor_phone)}</div>
        ` : ''}

        ${donation.donor_email ? `
          <div class="label">Email:</div>
          <div class="value">${donation.donor_email}</div>
        ` : ''}

        ${donation.type === 'cash' ? `
          <div class="label">Amount:</div>
          <div class="value">$${parseFloat(donation.amount).toFixed(2)}</div>
        ` : ''}
      </div>

      ${donation.type === 'in-kind' ? itemsHtml : ''}

      <div class="letter">
        ${letterContent}
      </div>

      <div class="signature">
        <p>Warmest and sincerest thanks and appreciation!</p>
        <p>Sandy Keller<br>Founder / Executive Director</p>
      </div>

      <div class="tax-notice">
        This letter serves as your official receipt for tax purposes. My Sister's Closet is a registered non-profit organization. 
        No goods or services were provided in exchange for this donation.
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  
  // Create temp directory if it doesn't exist
  const tempDir = path.join(__dirname, '../../temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const pdfPath = path.join(tempDir, `receipt-${donation.id}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'letter',
    margin: {
      top: '0.4in',
      right: '0.4in',
      bottom: '0.4in',
      left: '0.4in'
    },
    printBackground: true
  });
  await browser.close();
  
  return pdfPath;
};

// Create a new donation
router.post('/', async (req, res) => {
  const {
    type,
    date,
    donor_name,
    donor_address,
    donor_phone,
    donor_email,
    amount,
    items,
    total_value
  } = req.body;

  // Validate required fields
  if (!type || !date || !donor_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate amount for cash donations
  if (type === 'cash' && (!amount || isNaN(amount) || amount <= 0)) {
    return res.status(400).json({ error: 'Invalid amount for cash donation' });
  }

  try {
    // Insert into database
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO donations (
          type, date, donor_name, donor_address, donor_phone,
          donor_email, amount, items, total_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          type,
          date,
          donor_name,
          donor_address || null,
          donor_phone || null,
          donor_email || null,
          amount || null,
          items ? JSON.stringify(items) : null,
          total_value || null
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    // Get the inserted donation
    const donation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE id = ?', [result.lastID], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Log to Excel
    try {
      await excelLogger.logDonation(donation);
    } catch (error) {
      console.error('Error logging to Excel:', error);
      // Don't fail the request if Excel logging fails
    }
    
    // Get the emitDonationUpdate function from the app
    const emitDonationUpdate = req.app.get('emitDonationUpdate');
    if (typeof emitDonationUpdate === 'function') {
      emitDonationUpdate();
    }
    
    res.json({ id: result.lastID });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Export donations to Excel (place this BEFORE the :id route)
router.get('/export/excel', verifyToken, async (req, res) => {
  try {
    console.log('Export request received with token');
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM donations ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Processing ${rows.length} donations for export`);

    // Format dates and phone numbers
    const formattedRows = rows.map(row => {
      let itemDescriptions = '';
      let totalValue = 0;

      if (row.type === 'in-kind' && row.items) {
        try {
          const items = JSON.parse(row.items);
          itemDescriptions = items.map(item => item.description).join('; ');
          totalValue = items.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
        } catch (e) {
          console.error('Error parsing items:', e);
        }
      }

      // Handle both YYYY-MM-DD format and ISO format
      let formattedDate;
      if (row.date.includes('T')) {
        // Handle ISO format (e.g., 04/20T06:45:53.365Z/2025)
        const isoDate = new Date(row.date);
        formattedDate = `${(isoDate.getMonth() + 1).toString().padStart(2, '0')}/${isoDate.getDate().toString().padStart(2, '0')}/${isoDate.getFullYear()}`;
      } else {
        // Handle YYYY-MM-DD format
        const dateParts = row.date.split('-');
        formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      }

      return {
        id: `MSC-${row.id.toString().padStart(4, '0')}`,
        date: formattedDate,
        type: row.type === 'cash' ? 'Cash' : 'In-Kind',
        donor_name: row.donor_name,
        donor_email: row.donor_email || '',
        donor_phone: formatPhoneNumber(row.donor_phone) || '',
        donor_address: row.donor_address || '',
        items: itemDescriptions,
        value: row.type === 'cash' 
          ? (row.amount ? `$${parseFloat(row.amount).toFixed(2)}` : '')
          : (totalValue ? `$${totalValue.toFixed(2)}` : '')
      };
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add a title row with pink background
    const titleRow = [['My Sister\'s Closet - Donation Records']];
    const titleWs = XLSX.utils.aoa_to_sheet(titleRow);
    
    // Create the main data worksheet
    const ws = XLSX.utils.json_to_sheet(formattedRows, {
      header: [
        'id',
        'date',
        'type',
        'donor_name',
        'donor_email',
        'donor_phone',
        'donor_address',
        'items',
        'value'
      ]
    });

    // Customize header names
    ws['A1'].v = 'Receipt ID';
    ws['B1'].v = 'Date';
    ws['C1'].v = 'Type';
    ws['D1'].v = 'Donor Name';
    ws['E1'].v = 'Email';
    ws['F1'].v = 'Phone';
    ws['G1'].v = 'Address';
    ws['H1'].v = 'Items';
    ws['I1'].v = 'Value';

    // Style the header row
    const headerStyle = {
      fill: { fgColor: { rgb: "F052A1" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center" }
    };

    // Apply styles to header cells
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'].forEach(cellRef => {
      ws[cellRef].s = headerStyle;
    });

    // Adjust column widths
    ws['!cols'] = [
      { wch: 12 },  // Receipt ID
      { wch: 12 },  // Date
      { wch: 8 },   // Type
      { wch: 25 },  // Donor Name
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 35 },  // Address
      { wch: 50 },  // Items
      { wch: 12 }   // Value
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, ws, 'Donations');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=MSC-Donations.xlsx');
    res.send(buffer);
    
    console.log('Export completed successfully');
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export donations: ' + error.message });
  }
});

// Get all donations (protected route)
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM donations ORDER BY date DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get donation by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM donations WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.json(row);
  });
});

// Delete donation by ID (protected route)
router.delete('/:id', verifyToken, async (req, res) => {
  const donationId = req.params.id;

  try {
    // First check if the donation exists
    const donation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE id = ?', [donationId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Delete the donation
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM donations WHERE id = ?', [donationId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get the emitDonationUpdate function from the app
    const emitDonationUpdate = req.app.get('emitDonationUpdate');
    if (typeof emitDonationUpdate === 'function') {
      emitDonationUpdate();
    }

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ error: 'Failed to delete donation: ' + error.message });
  }
});

// Email receipt
router.post('/:id/email', async (req, res) => {
  const { email } = req.body;
  const donationId = req.params.id;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  console.log(`Attempting to send email receipt for donation ID: ${donationId} to email: ${email}`);

  try {
    const donation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE id = ?', [donationId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    console.log('Donation found:', donation);

    // Generate PDF receipt
    const pdfPath = await generatePDFReceipt(donation);

    // Create email transporter
    const transporter = createTransporter();

    // Format items for email if it's an in-kind donation
    let itemsHtml = '';
    if (donation.type === 'in-kind' && donation.items) {
      try {
        const items = JSON.parse(donation.items);
        itemsHtml = '<ul>';
        items.forEach(item => {
          itemsHtml += `<li>${item.description} - $${parseFloat(item.value).toFixed(2)}</li>`;
        });
        itemsHtml += '</ul>';
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }

    // Send email with PDF attachment
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for your donation to My Sister\'s Closet',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #F052A1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #F052A1;">My Sister's Closet</h1>
            <h2 style="color: #333;">Donation Receipt</h2>
          </div>
          <p>Dear ${donation.donor_name},</p>
          <p>Thank you for your generous ${donation.type} donation to My Sister's Closet.</p>
          <p><strong>Date:</strong> ${new Date(donation.date).toLocaleDateString()}</p>
          <p><strong>Donation Type:</strong> ${donation.type === 'cash' ? 'Cash' : 'In-Kind'}</p>
          ${donation.type === 'cash' 
            ? `<p><strong>Amount:</strong> $${parseFloat(donation.amount).toFixed(2)}</p>` 
            : `<p><strong>Items:</strong></p>${itemsHtml}<p><strong>Total Value:</strong> $${parseFloat(donation.total_value).toFixed(2)}</p>`
          }
          <p>Your generosity helps us continue our mission to support women in need.</p>
          <p>Please find your receipt attached to this email.</p>
          <p style="margin-top: 30px;">Best regards,<br>The My Sister's Closet Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'MSC-Donation-Receipt.pdf',
          path: pdfPath
        }
      ]
    });
    
    // Clean up the temporary PDF file
    await fs.unlink(pdfPath);
    
    console.log('Email sent successfully:', info.response);
    res.json({ message: 'Receipt sent successfully', info: info.response });
  } catch (error) {
    console.error('Error in email endpoint:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
});

module.exports = router; 
