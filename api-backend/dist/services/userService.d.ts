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
declare class UserService {
    createUser(userData: CreateUserData): Promise<{
        id: string;
        email: string;
        emailVerified: boolean | null;
        name: string | null;
        image: string | null;
        role: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getUserById(userId: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean | null;
        name: string | null;
        image: string | null;
        role: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean | null;
        name: string | null;
        image: string | null;
        role: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updateUser(userId: string, updateData: UpdateUserData): Promise<{
        id: string;
        email: string;
        emailVerified: boolean | null;
        name: string | null;
        image: string | null;
        role: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deleteUser(userId: string): Promise<boolean>;
    verifyUserEmail(userId: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean | null;
        name: string | null;
        image: string | null;
        role: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getUserStats(): Promise<{
        total: number;
        verified: number;
        unverified: number;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=userService.d.ts.map