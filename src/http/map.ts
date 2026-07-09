import request from '@/http/axios';

export function getMapInfo() {
    return request.get('/api/map/getMapInfo');
}