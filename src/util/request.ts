// util/request.ts
const DEV_BASE_URL = "http://127.0.0.1:8083";
const PROD_BASE_URL = "https://xxx线上域名";
const baseUrl = process.env.NODE_ENV === "development" ? DEV_BASE_URL : PROD_BASE_URL;

// 默认导出单一请求函数，无 .get / .post 子方法
export default function request(url: string, method: string = "GET", data?: any) {
    const token = uni.getStorageSync("token");
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + url,
            method,
            data,
            header: {
                token: token || ""
            },
            success: (res) => {
                // token失效自动清缓存跳登录
                if (res.data.code === 401) {
                    uni.removeStorageSync("token");
                    uni.redirectTo({ url: "/pages/my/login" });
                }
                resolve(res.data);
            },
            fail: reject
        });
    });
}