// src/http/axios.ts
import axios from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';

// 配置适配器
axios.defaults.adapter = mpAdapter as any;

const request = axios.create({
    baseURL: 'http://localhost:8081',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器 - 确保 headers 是对象
request.interceptors.request.use(
    config => {
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

export default request;