# TrabajoFrontRA

## Autenticación Better Auth + Neon (modular)

Sigue estos pasos. Solo debes pegar tu conexión de Neon.

### Backend (microservicio `api-backend/auth/`)

1) Crea un archivo `.env` en `api-backend/auth/` con:

```
PORT=3002
AUTH_SECRET=<cadena-larga-aleatoria>
NEON_DATABASE_URL=<cadena de conexión de Neon>
FRONTEND_URL=http://localhost:5173
COOKIE_DOMAIN=localhost
```

2) Instala dependencias del auth service:

```
cd api-backend/auth
npm i
```

3) Inicia el servidor de auth:

```
npm run start
```

### Frontend (`BOLT`)

1) Crea un `.env` en `BOLT/` con:

```
VITE_USE_BETTER_AUTH=true
VITE_AUTH_SERVER_URL=http://localhost:3002
```

2) Inicia el frontend (en otra terminal):

```
cd BOLT
npm run dev
```

Listo. Inicia sesión/registro desde la UI y quedará gestionado por Better Auth + Neon. Si pones `VITE_USE_BETTER_AUTH=false`, vuelve a la auth local.

