import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [uni()],
    // 👇 新增 build 配置项
    build: {
        // 生产环境关闭 sourcemap，减小包体积
        sourcemap: false,
        // 可选：如果分包依然很大，可以开启 minify 压缩（通常默认是开启的）
        minify: 'terser',
        terserOptions: {
            compress: {
                // 生产环境去除 console.log
                drop_console: true,
                drop_debugger: true
            }
        }
    }
})