import request from '@/http/axios';

export function getDishInfo(shopId:number) {
    return request.get('/api/dish/getDishInfo');
}