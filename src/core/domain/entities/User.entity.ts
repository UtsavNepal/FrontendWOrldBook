export interface User {
    id?: number; 
    firstname: string;
    lastname: string;
    email: string;
    password: string; 
    birthday?: string;
    gender?: string; 
    isVerified?: boolean;
    isActive?: boolean;
    joinedAt?: string; 
    otp?: string; 
}