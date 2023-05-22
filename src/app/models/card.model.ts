
export type Card = {
    id: any;
    list_id: any;
    board_id: any;
    position: number;
    title: string;
    description: string;
    attachments: string;
    done: boolean;
    prevListId?: any;
    isLoading?: boolean;
    isDeleting?: boolean;
}