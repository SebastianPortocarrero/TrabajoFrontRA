const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const getDriveService = require('./googleDrive'); // CAMBIO aquí
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Función auxiliar para convertir Buffer a Stream
function bufferToStream(buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Backend funcionando');
});

app.get('/drive', (req, res) => {
  res.send('Endpoint de Google Drive');
});

app.use('/firebase', (req, res) => {
  res.send('Endpoint de Firebase');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ NUEVA implementación usando `await getDriveService()`
app.post('/drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const fileStream = bufferToStream(buffer);

    // Obtener el cliente de Google Drive autenticado
    const driveService = await getDriveService();

    const folderId = '11gr-s1uznEquZd9QyLyRASHpS-gdDhOY';

    const response = await driveService.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
        parents: [folderId],
      },
      media: {
        mimeType: mimetype,
        body: fileStream,
      },
      fields: 'id',
    });

    await driveService.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = `https://drive.google.com/uc?id=${response.data.id}`;
    res.json({ fileId: response.data.id, url: fileUrl });

  } catch (error) {
    console.error('Error al subir archivo a Google Drive:', error);
    res.status(500).json({ error: 'Error al subir el archivo a Google Drive: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
