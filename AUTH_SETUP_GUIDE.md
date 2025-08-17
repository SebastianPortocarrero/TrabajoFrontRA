# Better Auth Setup Guide

## Fixed Issues ✅

1. **Created proper auth server entry point** - `api-backend/auth/index.js`
2. **Fixed database migration** - `api-backend/auth/migrate.js`
3. **Updated auth configuration** - Enhanced with proper error handling
4. **Fixed frontend auth imports** - Consistent auth client usage
5. **Removed unsupported Roblox provider** - Only Google and GitLab now
6. **Added CommonJS compatibility** - Works with your existing setup

## Setup Instructions

### 1. Install Auth Dependencies
```bash
cd api-backend/auth
npm install
```

### 2. Setup Environment Variables
Update `api-backend/auth/.env` with your actual values:

```env
# Your current Neon database (already working)
CONNECTION_STRING=postgresql://neondb_owner:npg_LrSC4wa3ZMUb@ep-billowing-math-ac5l083h-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Better Auth Secret (already set)
BETTER_AUTH_SECRET=your-super-secret-key-here
BETTER_AUTH_URL=http://localhost:3002

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Social Providers (Get these from Google/GitLab)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITLAB_CLIENT_ID=your-gitlab-client-id  
GITLAB_CLIENT_SECRET=your-gitlab-client-secret
```

### 3. Run Database Migration
```bash
cd api-backend/auth
npm run migrate
```

### 4. Start Auth Server
```bash
cd api-backend/auth
npm start
```

### 5. Update BOLT Frontend Environment
In `BOLT/.env`:
```env
VITE_AUTH_SERVER_URL=http://localhost:3002
```

### 6. Start Both Servers
```bash
# Terminal 1: Main API Backend
cd api-backend
npm start

# Terminal 2: Auth Server  
cd api-backend/auth
npm start

# Terminal 3: Frontend
cd BOLT
npm run dev
```

## Expected Behavior

- Auth server runs on `http://localhost:3002`
- Main API runs on `http://localhost:3001` 
- Frontend runs on `http://localhost:5173`
- Login page should work with email/password and social providers
- Database tables will be auto-created on first migration

## Testing

1. **Health Check**: Visit `http://localhost:3002/health`
2. **Auth Endpoints**: `http://localhost:3002/api/auth/*`
3. **Frontend Login**: Visit frontend and try email/password registration

## Troubleshooting

- **Database errors**: Check your Neon connection string
- **CORS issues**: Verify frontend URL in auth config
- **Social login**: Add proper OAuth credentials
- **Tables missing**: Re-run `npm run migrate`

## Next Steps

1. Add your Google OAuth credentials
2. Add your GitLab OAuth credentials  
3. Test email/password registration
4. Test social login flows
5. Integrate with your main application