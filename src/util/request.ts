// src/utils/request.ts

// 1. 定义基础地址
const BASE_URL = 'http://localhost:8083';

// 定义请求配置的类型（可选，为了TS不报错）
interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: any;
}

 const request = (options: RequestOptions) => {
    return new Promise((resolve, reject) => {
        uni.request({
            // 自动拼接前缀
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                // 2. 自动携带 Token (如果有登录的话)
                'Authorization': uni.getStorageSync('token') || '',
                'Content-Type': 'application/json'
            },
            success: (res) => {
                // 3. 简单的拦截判断
                if (res.statusCode === 200) {
                    // 这里假设后端返回格式是 { code: 200, data: ..., msg: ... }
                    // 直接把整个 res.data 抛出去给页面用
                    resolve(res.data);
                } else {
                    uni.showToast({ title: '网络请求失败', icon: 'none' });
                    reject(res);
                }
            },
            fail: (err) => {
                uni.showToast({ title: '连接服务器失败', icon: 'none' });
                reject(err);
            }
        });
    });

};  export default request;