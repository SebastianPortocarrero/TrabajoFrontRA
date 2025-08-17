import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from '../config/auth';

const router = express.Router();

// Better Auth routes
router.all('/*', async (req, res, next) => {
  console.log(`🔍 Auth route hit: ${req.method} ${req.path}`);
  console.log(`🔍 Request headers:`, req.headers);
  console.log(`🔍 Request body:`, req.body);
  
  try {
    // Verificar que el cuerpo de la solicitud esté disponible
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      console.log(`🔍 Request body keys:`, Object.keys(req.body || {}));
    }
    
    const auth = await getAuth();
    const handler = toNodeHandler(auth);
    
    // Manejar posibles errores de stream
    const oldWrite = res.write;
    const oldEnd = res.end;
    let bodyChunks: any[] = [];
    
    res.write = function(chunk: any) {
      bodyChunks.push(chunk);
      return oldWrite.apply(res, arguments as any);
    };
    
    res.end = function(chunk: any) {
      if (chunk) bodyChunks.push(chunk);
      return oldEnd.apply(res, arguments as any);
    };
    
    return handler(req, res);
  } catch (error: any) {
    console.error('❌ Auth route error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Verificar si es un error de "disturbed or locked"
    if (error.message && error.message.includes('disturbed or locked')) {
      console.error('🔧 This error typically occurs when the response body is read twice');
      console.error('🔧 Check if there are any middleware that might be consuming the response body');
    }
    
    // Enviar una respuesta de error limpia
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Authentication service error',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
});

export default router;