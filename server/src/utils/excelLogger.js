const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelLogger {
  constructor() {
    this.excelDir = path.join(__dirname, '../../excel-logs');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }
  }

  getWorkbookPath(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const fileName = `donations-${year}-${month.toString().padStart(2, '0')}.xlsx`;
    return path.join(this.excelDir, fileName);
  }

  formatDonation(donation) {
    let items = '';
    let totalValue = donation.amount || 0;

    if (donation.type === 'in-kind' && donation.items) {
      try {
        const itemsList = JSON.parse(donation.items);
        items = itemsList.map(item => 
          `${item.description}: $${parseFloat(item.value).toFixed(2)}`
        ).join('; ');
        totalValue = donation.total_value || 0;
      } catch (e) {
        console.error('Error parsing items:', e);
      }
    }

    // Handle both YYYY-MM-DD format and ISO format
    let formattedDate;
    if (donation.date.includes('T')) {
      // Handle ISO format (e.g., 04/20T06:45:53.365Z/2025)
      const isoDate = new Date(donation.date);
      formattedDate = `${(isoDate.getMonth() + 1).toString().padStart(2, '0')}/${isoDate.getDate().toString().padStart(2, '0')}/${isoDate.getFullYear()}`;
    } else {
      // Handle YYYY-MM-DD format
      const dateParts = donation.date.split('-');
      formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    }

    return {
      'Receipt ID': `MSC-${donation.id.toString().padStart(4, '0')}`,
      'Date': formattedDate,
      'Type': donation.type === 'cash' ? 'Cash' : 'In-Kind',
      'Donor Name': donation.donor_name,
      'Email': donation.donor_email || '',
      'Phone': this.formatPhoneNumber(donation.donor_phone) || '',
      'Address': donation.donor_address || '',
      'Items': items,
      'Amount': totalValue ? `$${parseFloat(totalValue).toFixed(2)}` : ''
    };
  }

  formatPhoneNumber(phoneNumberString) {
    if (!phoneNumberString) return '';
    const cleaned = phoneNumberString.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumberString;
  }

  async logDonation(donation) {
    try {
      const date = new Date(donation.date);
      const filePath = this.getWorkbookPath(date);
      let workbook;

      // Load existing workbook or create new one
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
      } else {
        workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([]), 'Donations');
      }

      // Get the worksheet
      const ws = workbook.Sheets['Donations'];
      
      // Convert worksheet to JSON to append new data
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Add new donation
      data.push(this.formatDonation(donation));

      // Convert back to worksheet
      const newWs = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = [
        { wch: 12 },  // Receipt ID
        { wch: 12 },  // Date
        { wch: 8 },   // Type
        { wch: 25 },  // Donor Name
        { wch: 25 },  // Email
        { wch: 15 },  // Phone
        { wch: 35 },  // Address
        { wch: 50 },  // Items
        { wch: 12 }   // Amount
      ];
      newWs['!cols'] = colWidths;

      // Replace worksheet in workbook
      workbook.Sheets['Donations'] = newWs;

      // Write to file
      XLSX.writeFile(workbook, filePath);

      console.log(`Donation logged to Excel: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error logging donation to Excel:', error);
      throw error;
    }
  }

  async getMonthlyReport(year, month) {
    const filePath = this.getWorkbookPath(new Date(year, month - 1));
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const workbook = XLSX.readFile(filePath);
    const ws = workbook.Sheets['Donations'];
    return XLSX.utils.sheet_to_json(ws);
  }
}

module.exports = new ExcelLogger(); 