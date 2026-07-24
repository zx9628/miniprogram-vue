// utils/request.ts

// 1. 定义基础配置
const BASE_URL = 'https://zx.juntaitec.cn' // 替换为你的后端地址
const TIMEOUT = 10000

// 2. 封装请求函数
const uniRequest = (url: string, method: 'GET' | 'POST', data?: any) => {
    // 显示加载中（可选）
    uni.showLoading({ title: '请求中...' })

    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + url,
            method,
            data,
            timeout: TIMEOUT,
            header: {
                // 可以在这里统一添加 token
                'Content-Type': 'application/json'
            },
            success: (res: any) => {
                // 隐藏加载中
                uni.hideLoading()
                // 假设后端返回格式为 { code: 0, data: {}, msg: '' }
                if (res.statusCode === 200) {
                    resolve(res.data) // 只返回业务数据
                } else {
                    uni.showToast({ title: '网络错误', icon: 'none' })
                    reject(res)
                }
            },
            fail: (err) => {
                uni.hideLoading()
                uni.showToast({ title: '网络请求失败', icon: 'none' })
                reject(err)
            }
        })
    })
}

// 3. 导出常用方法
export default {
    get(url: string, data?: any) {
        return uniRequest(url, 'GET', data)
    },
    post(url: string, data?: any) {
        return uniRequest(url, 'POST', data)
    }
}