import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user"
      }
    }
  },
  callbacks: {
    async signUp({ user }: { user: any }) {
      console.log("🆕 New user signed up:", user.email);
      return user;
    },
    async signIn({ user, session }: { user: any; session: any }) {
      console.log("🔐 User signed in:", user.email);
      return { user, session };
    }
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3002", 
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[]
});

export async function initializeAuth() {
  console.log('✅ Better Auth initialized with Drizzle');
  return auth;
}

export async function getAuth() {
  return auth;
}