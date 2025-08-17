import { db } from '../db';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';

interface CreateUserData {
  email: string;
  name?: string;
  image?: string;
  role?: string;
}

interface UpdateUserData {
  name?: string;
  image?: string;
  role?: string;
}

class UserService {
  async createUser(userData: CreateUserData) {
    try {
      const newUser = await db.insert(user).values({
        id: crypto.randomUUID(),
        email: userData.email,
        name: userData.name || null,
        image: userData.image || null,
        role: userData.role || 'user',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return newUser[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const userRecord = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      return userRecord[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const userRecord = await db.select().from(user).where(eq(user.email, email)).limit(1);
      return userRecord[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: UpdateUserData) {
    try {
      const updatedUser = await db.update(user)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId))
        .returning();

      return updatedUser[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await db.delete(user).where(eq(user.id, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async verifyUserEmail(userId: string) {
    try {
      const updatedUser = await db.update(user)
        .set({
          emailVerified: true,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId))
        .returning();

      return updatedUser[0] || null;
    } catch (error) {
      console.error('Error verifying user email:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const totalUsers = await db.select().from(user);
      const verifiedUsers = await db.select().from(user).where(eq(user.emailVerified, true));
      
      return {
        total: totalUsers.length,
        verified: verifiedUsers.length,
        unverified: totalUsers.length - verifiedUsers.length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export default new UserService();