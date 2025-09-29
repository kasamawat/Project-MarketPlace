export type User = {
    _id: string,
    username: string;
    email: string;
    password: string;
    role: "customer" | "seller" | "admin";
    createdAt: Date;
    firstname: string;
    lastname: string;
    gender: string;
    dob: Date
    avatarUrl: string;
}