export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
    path?: string;
    timestamp?: string;
}
export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface PaginationQuery {
    page?: number;
    pageSize?: number;
    search?: string;
}
