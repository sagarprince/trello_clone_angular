
export type Board = {
    id: any;
    title: string;
    starred: boolean;
    users?: Array<User>;
    color?: string;
    isUsersLoading?: boolean;
    isLoading?: boolean;
    isDeleting?: boolean;
}

export type User = {
    id: any;
    email: string;
    firstName: string;
    lastName: string;
    profilePicUrl: string;
}