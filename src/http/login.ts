// src/http/login.ts
import request from '@/http/axios';

export function Login(data: { username: string; password: string }) {
    return request.post('/api/auth/login', data);
}