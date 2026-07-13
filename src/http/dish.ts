import request from '@/http/axios';

export function getDishInfo(shopId:number) {
    return request.get('/api/dish/getDishInfo', {
        params: { shopId }  // 作为查询参数传递
    });
}
export function getAllDishes() {
    return request.get('/api/dish/getAllDishes');
}
