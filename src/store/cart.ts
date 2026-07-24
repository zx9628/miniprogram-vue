export interface FoodItem {
    id: number
    name: string
    price: number
    image?: string
    spicy?: boolean
    type?: string
    recommend?: number
    stock?: number
}

export interface CartItem {
    dishId: number
    name: string
    price: number
    image: string
    specName: string
    specId: number
    quantity: number
    selected: boolean
    stock: number
    type: string
}

export interface OrderItem {
    dishId: number
    name: string
    price: number
    specName: string
    specId: number
    quantity: number
}

export interface Order {
    id: string
    userId: number
    storeId: number
    storeName?: string
    items: OrderItem[]
    totalAmount: number
    payAmount: number
    mark: string
    status: 'pending' | 'paid' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
    createTime: string
    updateTime: string
}
// 获取购物车
export function getCart(): CartItem[] {
    try {
        const data = uni.getStorageSync('shopping_cart')
        return data && Array.isArray(data) ? data : []
    } catch (e) {
        return []
    }
}

export function addToCart(
    food: any,
    quantity: number = 1,
    specId: any = 0,
    specName: string = '默认',
    specPrice: number | null = null
): boolean {
    let finalSpecId = 0
    if (specId !== null && specId !== undefined) {
        if (typeof specId === 'object') {
            finalSpecId = Number(specId.id) || Number(specId.specId) || 0
            console.warn('⚠️ specId 是对象，已转换为数字:', specId, '->', finalSpecId)
        } else {
            finalSpecId = Number(specId) || 0
        }
    }

    let finalPrice = 0
    if (specPrice !== null && !isNaN(Number(specPrice))) {
        finalPrice = Number(specPrice)
    } else if (food.price !== undefined && !isNaN(Number(food.price))) {
        finalPrice = Number(food.price)
    }

    const finalSpecName = String(specName || '默认')
    const finalQuantity = Number(quantity) || 1

    const items = getCart()

    const existing = items.find(
        item => item.dishId === food.id && item.specId === finalSpecId
    )

    if (existing) {
        const newQuantity = existing.quantity + finalQuantity
        if (newQuantity > existing.stock) {
            uni.showToast({ title: '库存不足', icon: 'none' })
            return false
        }
        existing.quantity = newQuantity
        if (existing.price !== finalPrice) {
            existing.price = finalPrice
        }
    } else {
        items.push({
            dishId: Number(food.id),
            name: String(food.name),
            price: finalPrice,
            image: food.image || '/static/images/default-food.png',
            specName: finalSpecName,
            specId: finalSpecId,
            quantity: finalQuantity,
            selected: true,
            stock: Number(food.stock) || 999,
            type: String(food.type || '菜品'),
        })
    }

    saveCart(items)
    return true
}

// 保存购物车
export function saveCart(items: CartItem[]) {
    try {
        uni.setStorageSync('shopping_cart', items)
        updateBadge(items)
    } catch (e) {
        console.error('保存购物车失败', e)
    }
}

export function clearCart(): void {
    saveCart([])
}

export function getTotalCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getSelectedItems(items: CartItem[]): CartItem[] {
    return items.filter(item => item.selected)
}

export function getTotalPrice(items: CartItem[]): number {
    return getSelectedItems(items).reduce((sum, item) => {
        return sum + item.price * item.quantity
    }, 0)
}

export function getSelectedCount(items: CartItem[]): number {
    return getSelectedItems(items).reduce((sum, item) => sum + item.quantity, 0)
}

export function isAllSelected(items: CartItem[]): boolean {
    if (items.length === 0) return true
    return items.every(item => item.selected)
}

export function updateCartQuantity(dishId: number, specName: string, delta: number): boolean {
    const items = getCart()
    const item = items.find(i => i.dishId === dishId && i.specName === specName)
    if (!item) return false

    const newQuantity = item.quantity + delta
    if (newQuantity <= 0) {
        return removeFromCart(dishId, specName)
    }
    if (newQuantity > item.stock) {
        uni.showToast({ title: '库存不足', icon: 'none' })
        return false
    }

    item.quantity = newQuantity
    saveCart(items)
    return true
}

export function removeFromCart(dishId: number, specName: string): boolean {
    const items = getCart()
    const index = items.findIndex(i => i.dishId === dishId && i.specName === specName)
    if (index === -1) return false

    items.splice(index, 1)
    saveCart(items)
    return true
}

export function toggleSelected(dishId: number, specName: string): void {
    const items = getCart()
    const item = items.find(i => i.dishId === dishId && i.specName === specName)
    if (!item) return

    item.selected = !item.selected
    saveCart(items)
}

export function toggleAll(selected: boolean): void {
    const items = getCart()
    items.forEach(item => item.selected = selected)
    saveCart(items)
}

export function getItemQuantity(dishId: number, specName: string = '默认'): number {
    const items = getCart()
    const item = items.find(i => i.dishId === dishId && i.specName === specName)
    return item ? item.quantity : 0
}

export function updateBadge(items: CartItem[]) {
    const count = getTotalCount(items)
    if (count > 0) {
        uni.setTabBarBadge({
            index: 1,
            text: count > 99 ? '99+' : String(count)
        })
    } else {
        uni.removeTabBarBadge({ index: 1 })
    }
}

export function getOrders(): Order[] {
    try {
        const data = uni.getStorageSync('orders')
        return data && Array.isArray(data) ? data : []
    } catch (e) {
        return []
    }
}

export function saveOrders(orders: Order[]) {
    try {
        uni.setStorageSync('orders', orders)
    } catch (e) {
        console.error('保存订单失败', e)
    }
}

export function createOrder(
    storeId: any,
    userId: any,
    mark: string = '',
    storeName: string = ''
): Promise<Order | null> {
    return new Promise((resolve) => {
        const items = getCart()
        const selectedItems = getSelectedItems(items)

        if (selectedItems.length === 0) {
            uni.showToast({ title: '请选择要下单的商品', icon: 'none' })
            resolve(null)
            return
        }

        const finalUserId = Number(userId) || 1
        const finalStoreId = Number(storeId) || 1

        if (isNaN(finalUserId) || isNaN(finalStoreId)) {
            console.error('userId 或 storeId 不是有效数字:', { userId, storeId })
            uni.showToast({ title: '用户或店铺信息错误', icon: 'none' })
            resolve(null)
            return
        }

        const totalAmount = getTotalPrice(items)

        const orderData = {
            userId: finalUserId,
            storeId: finalStoreId,
            totalAmount: totalAmount.toFixed(2),
            payAmount: totalAmount.toFixed(2),
            mark: String(mark || ''),
            selectedItems: selectedItems.map(item => ({
                dishId: Number(item.dishId),
                name: String(item.name),
                price: Number(item.price),
                specName: String(item.specName || '默认'),
                specId: Number(item.specId || 0),
                quantity: Number(item.quantity)
            }))
        }

        uni.showLoading({ title: '正在下单...', mask: true })

        uni.request({
            url: 'http://localhost:8081/api/order/createOrders',
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: orderData,
            success: (res: any) => {
                uni.hideLoading()
                console.log('下单响应:', res)

                if (res.statusCode === 200) {
                    const result = res.data
                    if (result.code === 200 || result.success) {
                        // 生成本地订单
                        const orderId = 'ORD' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase()
                        const order: Order = {
                            id: orderId,
                            userId: finalUserId,
                            storeId: finalStoreId,
                            storeName: String(storeName || ''),
                            items: selectedItems.map(item => ({
                                dishId: Number(item.dishId),
                                name: String(item.name),
                                price: Number(item.price),
                                specName: String(item.specName || '默认'),
                                specId: Number(item.specId || 0),
                                quantity: Number(item.quantity)
                            })),
                            totalAmount: totalAmount,
                            payAmount: totalAmount,
                            mark: String(mark || ''),
                            status: 'pending',
                            createTime: new Date().toISOString(),
                            updateTime: new Date().toISOString()
                        }

                        const orders = getOrders()
                        orders.unshift(order)
                        saveOrders(orders)
                        clearCart()

                        uni.showToast({ title: '下单成功！', icon: 'success' })
                        resolve(order)

                        setTimeout(() => {
                            uni.switchTab({ url: '/pages/orderFood/orderFood' })
                        }, 1500)
                    } else {
                        uni.showToast({
                            title: result.message || result.msg || '下单失败',
                            icon: 'none'
                        })
                        resolve(null)
                    }
                } else {
                    console.error('请求失败:', res.statusCode, res.data)
                    uni.showToast({
                        title: `下单失败 (${res.statusCode})`,
                        icon: 'none'
                    })
                    resolve(null)
                }
            },
            fail: (err) => {
                uni.hideLoading()
                console.error('下单请求失败:', err)
                uni.showToast({
                    title: '网络异常，请重试',
                    icon: 'none'
                })
                resolve(null)
            }
        })
    })
}