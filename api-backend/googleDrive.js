const { google } = require('googleapis');
const path = require('path');

const KEYFILEPATH = path.join(__dirname, 'google-drive-key.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function getDriveService() {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });
  return drive;
}

module.exports = getDriveService;
