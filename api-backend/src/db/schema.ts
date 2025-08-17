import { pgTable, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';

// Better Auth required tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  name: text('name'),
  image: text('image'),
  role: text('role').default('user'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Application specific tables
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  driveProjectId: text('driveProjectId'), // Google Drive folder ID
  driveFileId: text('driveFileId'), // project.json file ID
  settings: json('settings'), // Project settings as JSON
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const markerObjects = pgTable('markerObjects', {
  id: text('id').primaryKey(),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'image', 'object', 'location'
  position: json('position'), // {x, y, z}
  rotation: json('rotation'), // {x, y, z}
  scale: json('scale'), // {x, y, z}
  properties: json('properties'), // Additional properties
  imageFileId: text('imageFileId'), // Google Drive file ID for marker image
  modelFileId: text('modelFileId'), // Google Drive file ID for 3D model
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const files = pgTable('files', {
  id: text('id').primaryKey(),
  projectId: text('projectId').references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  driveFileId: text('driveFileId').notNull(), // Google Drive file ID
  name: text('name').notNull(),
  originalName: text('originalName').notNull(),
  mimeType: text('mimeType').notNull(),
  size: integer('size'),
  purpose: text('purpose'), // 'marker', 'model', 'texture', 'other'
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const projectExports = pgTable('exports', {
  id: text('id').primaryKey(),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  format: text('format').notNull(), // 'unity', 'ar-foundation', 'vuforia'
  status: text('status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  driveFileId: text('driveFileId'), // Exported file in Google Drive
  downloadUrl: text('downloadUrl'),
  fileSize: integer('fileSize'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});