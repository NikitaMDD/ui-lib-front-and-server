export interface LoginRequest {
    login: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    email?: string;
}

export interface VerifyCodeRequest {
    email: string;
    code: string;
}

export interface VerifyCodeResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

export interface ApiError {
    message: string;
}