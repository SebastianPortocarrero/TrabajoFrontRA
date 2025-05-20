const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const driveService = require('./googleDrive');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Función auxiliar para convertir Buffer a Stream
function bufferToStream(buffer) {
  const readable = new Readable();
  readable._read = () => {}; // _read es requerido pero puede estar vacío
  readable.push(buffer);
  readable.push(null); // Indica el fin del stream
  return readable;
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Backend funcionando');
});

// Ruta informativa para Google Drive (solo GET)
app.get('/drive', (req, res) => {
  res.send('Endpoint de Google Drive');
});

// Placeholder: Ruta para Firebase
app.use('/firebase', (req, res) => {
  res.send('Endpoint de Firebase');
});

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint para subir imágenes a Google Drive
app.post('/drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const { originalname, buffer, mimetype } = req.file;
    
    // Convertir buffer a stream para que funcione con la API de Google Drive
    const fileStream = bufferToStream(buffer);

    // Subir archivo a Google Drive usando el stream
    const response = await driveService.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: fileStream
      },
      fields: 'id',
    });

    // Hacer el archivo público
    await driveService.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Obtener la URL pública
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