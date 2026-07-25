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
    return request.get('/wechat/dish/getDishInfo', {
        params: { shopId }
    });
}

export function getAllDishes() {
    return request.get('/wechat/dish/getAllDishes');
}

export function getSpecifications(specificationId:any) {
    return request.get('/wechat/dish/getSpecifications', {
        params: { specificationId }
    });
}

export function addDish(data: any) {
    return request.post('/wechat/dish/addDish', data);
}

export function deleteDish(data: any) {
    return request.post('/wechat/dish/deleteDish', data);
}

export function changeDish(data: any) {
    return request.post('/api/dish/changeDish', data);
}