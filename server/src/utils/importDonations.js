const XLSX = require('xlsx');
const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Import donations from an Excel file into the database
 *
 * Expected Excel format:
 * - Date (MM/DD/YYYY or YYYY-MM-DD)
 * - Type (Cash or In-Kind)
 * - Donor Name
 * - Email
 * - Phone
 * - Street Address (or combined Address)
 * - City
 * - State
 * - ZIP Code
 * - Amount (for cash) or Items (for in-kind)
 *
 * Usage:
 *   node server/src/utils/importDonations.js path/to/your/file.xlsx
 */

class DonationImporter {
  parseDate(dateValue) {
    // Handle Excel serial date numbers
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }

    // Handle MM/DD/YYYY format
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const [month, day, year] = dateValue.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Handle YYYY-MM-DD format
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      return dateValue;
    }

    // Default to today
    return new Date().toISOString().split('T')[0];
  }

  parseName(row) {
    // If there's a combined "Donor Name" field, split it
    if (row['Donor Name'] && !row['First Name']) {
      const nameParts = row['Donor Name'].trim().split(' ');
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      };
    }

    return {
      firstName: row['First Name'] || row['FirstName'] || '',
      lastName: row['Last Name'] || row['LastName'] || ''
    };
  }

  parseAddress(row) {
    return {
      street: row['Street Address'] || row['Street'] || '',
      city: row['City'] || '',
      state: row['State'] || '',
      zip: row['ZIP Code'] || row['ZIP'] || row['Zip'] || ''
    };
  }

  parsePhone(phone) {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.toString().replace(/\D/g, '');
    // Take only first 10 digits
    return cleaned.substring(0, 10);
  }

  parseAmount(amount) {
    if (!amount) return null;
    // Remove $ and commas
    const cleaned = amount.toString().replace(/[$,]/g, '');
    return parseFloat(cleaned) || null;
  }

  parseItems(itemsString) {
    if (!itemsString) return null;

    // If it's already formatted like "Item1: $10.00; Item2: $20.00"
    if (itemsString.includes(':') && itemsString.includes('$')) {
      const items = itemsString.split(';').map(item => {
        const [description, value] = item.split(':').map(s => s.trim());
        return {
          description,
          value: this.parseAmount(value)
        };
      });
      return JSON.stringify(items);
    }

    // Simple text description - create a single item
    return JSON.stringify([{
      description: itemsString.toString(),
      value: 0
    }]);
  }

  async importFromExcel(filePath) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Reading Excel file: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Found ${data.length} rows to import`);

        let imported = 0;
        let errors = 0;

        // Process each row
        data.forEach((row, index) => {
          const type = (row['Type'] || '').toLowerCase().includes('kind') ? 'in-kind' : 'cash';
          const date = this.parseDate(row['Date']);
          const name = this.parseName(row);
          const address = this.parseAddress(row);
          const phone = this.parsePhone(row['Phone']);

          let amount = null;
          let items = null;
          let totalValue = null;

          if (type === 'cash') {
            amount = this.parseAmount(row['Amount']);
          } else {
            items = this.parseItems(row['Items'] || row['Description']);
            totalValue = this.parseAmount(row['Amount'] || row['Total Value']);
          }

          const sql = `INSERT INTO donations (
            type, date, donor_first_name, donor_last_name, street_address, city, state, zip_code,
            donor_phone, donor_email, amount, items, total_value
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const values = [
            type,
            date,
            name.firstName || 'Anonymous',
            name.lastName || '',
            address.street,
            address.city,
            address.state,
            address.zip,
            phone,
            row['Email'] || '',
            amount,
            items,
            totalValue
          ];

          db.run(sql, values, function(err) {
            if (err) {
              console.error(`Error importing row ${index + 1}:`, err.message);
              errors++;
            } else {
              imported++;
              if (imported % 100 === 0) {
                console.log(`Imported ${imported} donations...`);
              }
            }

            // Check if this is the last row
            if (index === data.length - 1) {
              setTimeout(() => {
                console.log(`\n✅ Import complete!`);
                console.log(`   Imported: ${imported}`);
                console.log(`   Errors: ${errors}`);
                resolve({ imported, errors });
              }, 100);
            }
          });
        });

      } catch (error) {
        console.error('Import failed:', error);
        reject(error);
      }
    });
  }
}

// Command-line usage
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node importDonations.js <path-to-excel-file>');
    process.exit(1);
  }

  const importer = new DonationImporter();
  importer.importFromExcel(filePath)
    .then(() => {
      console.log('Import successful!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}

module.exports = DonationImporter;
