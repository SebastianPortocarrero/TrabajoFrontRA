const { google } = require('googleapis');
const path = require('path');
const KEYFILEPATH = path.join(__dirname, 'google-drive-key.json'); // Asegúrate que el nombre coincida

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const driveService = google.drive({ version: 'v3', auth });

module.exports = driveService;