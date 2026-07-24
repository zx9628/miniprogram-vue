//以下是用户权限
//获取当前用户有的优惠卷
export const getCoupon = (userId: {
     userId:number
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            //url: 'http://localhost:8081/api/coupon/getCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/getCoupon',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
            },
            data: userId,
            success: (res) => {
                resolve(res.data);  // ✅ 必须调用 resolve，才能拿到数据
            },
            fail: (err) => {
                reject(err);   // ✅ 必须调用 reject，捕获错误
            },
        });
    });
};

//以下是管理员权限
//获取所有优惠卷
export const getAllCoupon = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            //url: 'http://localhost:8081/api/coupon/getAllCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/getAllCoupon',
            method: 'GET',
            success: (res) => {
                resolve(res);
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};

//增加优惠券
export const addCoupon = (coupon: {
    name: string,
    type: 'NUMVALUE' | 'DISCOUNT',  // 更精确的联合类型
    numValue: number,      // 根据 type 可能需要，但留空让前端自己判断
    discount: number,      // 同上
    status: number,        // 新增时若后端有默认值，可省略
    userHave: number
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            //url: 'http://localhost:8081/api/coupon/addCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/addCoupon',
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: coupon,
            success: (res) => {
                resolve(res.data);  // 建议只返回 data
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};

//删除优惠券
export const deleteCoupon = (coupon: {
    id:number;
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            // url: 'http://localhost:8081/api/coupon/deleteCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/deleteCoupon',
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: coupon,
            success: (res) => {
                resolve(res.data);  // 建议只返回 data
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};

//更改优惠券
export const updateCoupon = (coupon: {
    id:number,
    name: string,
    type: 'NUMVALUE' | 'DISCOUNT',  // 更精确的联合类型
    numValue: number,      // 根据 type 可能需要，但留空让前端自己判断
    discount: number,      // 同上
    status: number,        // 新增时若后端有默认值，可省略
    userHave: number
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            //url: 'http://localhost:8081/api/coupon/updateCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/updateCoupon',
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: coupon,
            success: (res) => {
                resolve(res.data);  // 建议只返回 data
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};

//查询优惠券
export const searchCoupon = (coupon: {
    userHave:number
}): Promise<any> => {
    return new Promise((resolve, reject) => {
        uni.request({
            //url: 'http://localhost:8081/api/coupon/searchCoupon',
            url: 'https://zx.juntaitec.cn/wechat/coupon/searchCoupon',
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: coupon,
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};