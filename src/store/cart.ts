// store/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    specId:number
    quantity: number
    selected: boolean
    stock: number
    type: string
}

const specMap: Record<string, number> = {
    '默认': 1,
    '微辣': 2,
    '中辣': 3,
    '特辣': 4,
};

export const useCartStore = defineStore('cart', () => {
    // ===== 状态 =====
    const items = ref<CartItem[]>([])
    const allSelected = ref(true)

    // ===== 计算属性 =====

    // 选中的商品列表
    const selectedItems = computed(() => {
        return items.value.filter(item => item.selected)
    })

    // 商品总数量（所有商品）
    const totalCount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    // 选中商品总价
    const totalPrice = computed(() => {
        return selectedItems.value.reduce((sum, item) => {
            return sum + item.price * item.quantity
        }, 0)
    })

    // 选中商品总数量
    const selectedCount = computed(() => {
        return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    // 购物车角标数字
    const badgeCount = computed(() => {
        return totalCount.value
    })

    // ===== 方法 =====

    // 初始化：从本地缓存读取
    function initCart() {
        try {
            const saved = uni.getStorageSync('shopping_cart')
            if (saved && Array.isArray(saved) && saved.length > 0) {
                items.value = saved
                updateAllSelectedState()
            }
        } catch (e) {
            console.error('读取购物车缓存失败', e)
        }
    }

    // 保存到本地缓存
    function saveToStorage() {
        try {
            uni.setStorageSync('shopping_cart', items.value)
        } catch (e) {
            console.error('保存购物车缓存失败', e)
        }
    }

    // 更新全选状态
    function updateAllSelectedState() {
        if (items.value.length === 0) {
            allSelected.value = true
            return
        }
        allSelected.value = items.value.every(item => item.selected)
    }

    // 添加商品到购物车
    function addItem(food: FoodItem, quantity: number = 1, specName: string = '默认') {
        const existing = items.value.find(
            item => item.dishId === food.id && item.specName === specName
        )

        if (existing) {
            // 已存在则增加数量
            const newQuantity = existing.quantity + quantity
            if (newQuantity > existing.stock) {
                uni.showToast({ title: '库存不足', icon: 'none' })
                return false
            }
            existing.quantity = newQuantity
        } else {
            const specId = specMap[specName] || 0

            // 新增商品
            items.value.push({
                dishId: food.id,
                name: food.name,
                price: food.price,
                image: food.image || '/static/images/default-food.png',
                specName: specName,
                specId:specId,
                quantity: quantity,
                selected: true,
                stock: food.stock || 999,
                type: food.type || '菜品',
            })
        }

        updateAllSelectedState()
        saveToStorage()
        syncToServer()
        updateBadge()
        return true
    }

    // 修改商品数量
    function updateQuantity(id: number, specName: string, delta: number) {
        const item = items.value.find(
            i => i.dishId === id && i.specName === specName
        )
        if (!item) return false

        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) {
            // 数量为0则删除
            return removeItem(id, specName)
        }
        if (newQuantity > item.stock) {
            uni.showToast({ title: '库存不足', icon: 'none' })
            return false
        }



        item.quantity = newQuantity
        updateAllSelectedState()
        saveToStorage()
        syncToServer()
        updateBadge()
        return true
    }

    // 删除商品
    function removeItem(id: number, specName: string) {
        const index = items.value.findIndex(
            i => i.dishId === id && i.specName === specName
        )
        if (index === -1) return false

        items.value.splice(index, 1)
        updateAllSelectedState()
        saveToStorage()
        syncToServer()
        updateBadge()
        return true
    }

    // 切换单个商品选中状态
    function toggleSelected(id: number, specName: string) {
        const item = items.value.find(
            i => i.dishId === id && i.specName === specName
        )
        if (!item) return

        item.selected = !item.selected
        updateAllSelectedState()
        saveToStorage()
    }

    // 全选/全不选
    function toggleAll() {
        const newStatus = !allSelected.value
        items.value.forEach(item => item.selected = newStatus)
        allSelected.value = newStatus
        saveToStorage()
    }

    // 清空购物车
    function clearCart() {
        items.value = []
        allSelected.value = true
        saveToStorage()
        syncToServer()
        updateBadge()
    }

    // 更新购物车角标
    function updateBadge() {
        const count = totalCount.value
        if (count > 0) {
            uni.setTabBarBadge({
                index: 1, // 购物车在 tabBar 中的位置
                text: count > 99 ? '99+' : String(count)
            })
        } else {
            uni.removeTabBarBadge({ index: 1 })
        }
    }

    function createOrder(storeId:number,userId:number,mark:string){

        const orderData = {
            userId:userId,
            storeId:storeId,
            totalAmount:totalPrice.value.toFixed(2),
            payAmount:totalPrice.value.toFixed(2),
            mark:mark,

            selectedItems: selectedItems.value.map(item=>({
            dishId: item.dishId,
            specId: item.specId,
            specName: item.specName,
            quantity: item.quantity,
            name: item.name,
            price: item.price
        }))
        }

        console.log("转换成的 orderData：",orderData);

        uni.request({
            url:`http://localhost:8081/api/order/createOrders`,
            method:'POST',
            header:{
                'Content-Type':'application/json'
            },
            data:orderData,
            success:(res) => {
                console.log(res.data)
                if(res.statusCode === 200) {
                    console.log(res);
                }
            }
        })
    }

    // 同步到后端（防抖）
    let syncTimer: any = null
    function syncToServer() {
        if (syncTimer) clearTimeout(syncTimer)
        syncTimer = setTimeout(() => {
            const token = uni.getStorageSync('token') || ''
            uni.request({
                url: 'https://your-api.com/cart/sync',
                method: 'POST',
                header: { Authorization: token },
                data: { items: items.value },
                success: (res) => {
                    if (res.statusCode !== 200) {
                        console.error('同步购物车失败', res)
                    }
                },
                fail: (err) => {
                    console.error('同步请求失败', err)
                }
            })
        }, 500)
    }

    // 获取选中商品（用于结算）
    function getSelectedItems() {
        return selectedItems.value
    }

    // 判断商品是否在购物车中
    function isInCart(id: number, specName: string = '默认') {
        return items.value.some(item => item.dishId === id && item.specName === specName)
    }

    // 获取商品在购物车中的数量
    function getItemQuantity(id: number, specName: string = '默认') {
        const item = items.value.find(i => i.dishId === id && i.specName === specName)
        return item ? item.quantity : 0
    }

    return {
        // 状态
        items,
        allSelected,

        // 计算属性
        selectedItems:{},
        totalCount,
        totalPrice,
        selectedCount,
        badgeCount,

        // 方法
        initCart,
        addItem,
        updateQuantity,
        removeItem,
        toggleSelected,
        toggleAll,
        clearCart,
        getSelectedItems,
        isInCart,
        getItemQuantity,
        updateBadge,
        createOrder
    }
})