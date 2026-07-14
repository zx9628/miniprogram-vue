import request from '@/http/axios';

// ✅ 定义 Dish 类型
export interface Dish {
    id: number
    shopId: number
    name: string
    price: number
    category: string
    description?: string
    image?: string | null
    specification?: number  // ✅ 添加 specification 字段
    sortOrder: number
    status: number
    createTime?: string
    updateTime?: string
}

export function getDishInfo(shopId: number) {
    return request.get('/api/dish/getDishInfo', {
        params: { shopId }
    });
}

export function getAllDishes() {
    return request.get('/api/dish/getAllDishes');
}