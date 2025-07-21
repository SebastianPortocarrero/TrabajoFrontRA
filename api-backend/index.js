const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const getDriveService = require('./googleDrive');
const { Readable } = require('stream');
const unityExportRouter = require('./unityExport');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Unity Export API routes
app.use('/api/unity', unityExportRouter);

const APP_DRIVE_ROOT_FOLDER_NAME = 'ARTrabajo';
let APP_DRIVE_ROOT_FOLDER_ID = null;

function bufferToStream(buffer) {
  const readable = new Readable();
  readable._read = () => {}; 
  readable.push(buffer);
  readable.push(null);
  return readable;
}

async function findOrCreateFolder(driveService, folderName, parentId = null) {
  if (!folderName || String(folderName).trim() === '') {
    console.error('Folder name is invalid (empty or null). Parent ID:', parentId);
    throw new Error('Invalid folder name provided for findOrCreateFolder.');
  }
  const sanitizedFolderName = folderName.replace(/'/g, "\\\\'");
  let query = `mimeType='application/vnd.google-apps.folder' and name='${sanitizedFolderName}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  try {
    const response = await driveService.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 10
    });

    if (response.data.files.length > 0) {
      console.log(`Found existing folder '${folderName}' with ID: ${response.data.files[0].id}. Parent: ${parentId || 'root'}`);
      return response.data.files[0].id;
    } else {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      if (parentId) {
        fileMetadata.parents = [parentId];
      }
      const folder = await driveService.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });
      console.log(`Created folder '${folderName}' with ID: ${folder.data.id}. Parent: ${parentId || 'root'}`);
      return folder.data.id;
    }
  } catch (error) {
    console.error(`Error finding or creating folder '${folderName}'. Parent ID: ${parentId}. Query: ${query}. Error:`, error.message, error.stack);
    throw error;
  }
}

async function deleteAllFilesInFolder(driveService, folderId) {
  try {
    const response = await driveService.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const filesToDelete = response.data.files;
    if (filesToDelete && filesToDelete.length > 0) {
      console.log(`Deleting ${filesToDelete.length} files from folder ${folderId}...`);
      for (const file of filesToDelete) {
        try {
          await driveService.files.delete({ fileId: file.id });
        } catch (deleteError) {
          console.error(`Failed to delete file ${file.id} ('${file.name}') from folder ${folderId}:`, deleteError.message);
        }
      }
      console.log(`Finished attempting to delete files from folder ${folderId}`);
    }
  } catch (error) {
    console.error(`Error listing files for deletion in folder ${folderId}:`, error.message);
  }
}

app.get('/', (req, res) => {
  res.send('API Backend funcionando');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/drive/prepare-class-folder', async (req, res) => {
  try {
    const { userId, className } = req.body;

    if (!userId || !className) {
      return res.status(400).json({ error: 'userId and className are required.' });
    }

    const driveService = await getDriveService();

    if (!APP_DRIVE_ROOT_FOLDER_ID) {
      console.warn('APP_DRIVE_ROOT_FOLDER_ID is not set during prepare-class-folder. Attempting to initialize.');
      await initializeDrive();
      if (!APP_DRIVE_ROOT_FOLDER_ID) {
        throw new Error('Application root folder ID is not available. Cannot prepare class folder.');
      }
    }

    const userFolderId = await findOrCreateFolder(driveService, userId, APP_DRIVE_ROOT_FOLDER_ID);
    const classNamedFolderId = await findOrCreateFolder(driveService, className, userFolderId);
    
    console.log(`Preparing folder for class: ${className} (ID: ${classNamedFolderId}), user: ${userId}. Deleting existing files...`);
    await deleteAllFilesInFolder(driveService, classNamedFolderId);
    
    res.json({ 
      message: `Folder for class '${className}' prepared successfully. Existing files deleted.`,
      classFolderId: classNamedFolderId
    });

  } catch (error) {
    console.error('Error preparing class folder:', error.message, error.stack);
    res.status(500).json({
      error: 'Error preparing class folder',
      details: error.message,
    });
  }
});

app.post('/drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }
    const targetFolderId = req.body.targetFolderId; 

    if (!targetFolderId) {
        console.error('targetFolderId not provided in request body for upload.');
        return res.status(400).json({ error: 'El ID de la carpeta de destino es requerido.' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const fileStream = bufferToStream(buffer);
    const driveService = await getDriveService();

    const nameParts = originalname.replace(/\.png$/i, '').split('_');
    let userIdForLogging = 'unknown_user';
    let classNameForLogging = 'unknown_class';

    if (nameParts.length >= 3) { 
        userIdForLogging = nameParts[0];
    }
    
    let imageType = '';
    let indices = [];
    let typeStartIndex = -1;

    for (let i = 1; i < nameParts.length; i++) {
        if (nameParts[i] === 'marker' || nameParts[i] === 'step') {
            typeStartIndex = i;
            break;
        }
    }
    
    if (typeStartIndex === -1) { 
        console.error('Invalid filename format for simple name (marker/step keyword not found):', originalname);
        simpleFileName = originalname; 
    } else {
        imageType = nameParts[typeStartIndex];
        indices = nameParts.slice(typeStartIndex + 1);
        if (imageType === 'marker') {
            if (indices.length < 1) return res.status(400).json({ error: 'Nombre de archivo de marcador inválido (faltan índices).'});
            simpleFileName = `marcador_${indices[0]}.png`;
        } else if (imageType === 'step') {
            if (indices.length < 2) return res.status(400).json({ error: 'Nombre de archivo de paso inválido (faltan índices).'});
            simpleFileName = `marcador${indices[0]}_paso${indices[1]}.png`;
        } else {
            console.warn('Unknown image type after parsing for simpleFileName, using originalname', originalname);
            simpleFileName = originalname; 
        }
    }
    
    const response = await driveService.files.create({
      requestBody: {
        name: simpleFileName, 
        mimeType: mimetype,
        parents: [targetFolderId],
      },
      media: {
        mimeType: mimetype,
        body: fileStream,
      },
      fields: 'id, name', 
    });

    const uploadedFileId = response.data.id;

    await driveService.permissions.create({
      fileId: uploadedFileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = `https://drive.google.com/uc?id=${uploadedFileId}`;
    console.log(`File ${simpleFileName} (from ${originalname}) uploaded to target folder ID ${targetFolderId}. URL: ${fileUrl}`);
    res.json({ fileId: uploadedFileId, url: fileUrl, name: simpleFileName });

  } catch (error) {
    console.error('Error detallado al subir archivo a Google Drive:', error.message, error.stack);
    res.status(500).json({ 
        error: 'Error al subir el archivo a Google Drive', 
        details: error.message, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

async function initializeDrive() {
    if (APP_DRIVE_ROOT_FOLDER_ID) {
        console.log('Google Drive root folder already initialized.');
        return;
    }
    try {
        console.log('Initializing Google Drive root folder...');
        const driveService = await getDriveService();
        APP_DRIVE_ROOT_FOLDER_ID = await findOrCreateFolder(driveService, APP_DRIVE_ROOT_FOLDER_NAME);
        if (APP_DRIVE_ROOT_FOLDER_ID) {
          console.log(`Google Drive initialized. App root folder '${APP_DRIVE_ROOT_FOLDER_NAME}' ID: ${APP_DRIVE_ROOT_FOLDER_ID}`);
        } else {
          console.error('Failed to get/create Google Drive root folder ID during initialization. APP_DRIVE_ROOT_FOLDER_ID is still null.');
        }
    } catch (error) {
        console.error("Could not initialize Google Drive root folder on startup:", error.message, error.stack);
    }
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  initializeDrive();
});
