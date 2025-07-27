import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  // 基本路径
  base: '/',
   // 服务器选项
  server: {
    host: '0.0.0.0', // 指定服务器主机名
    port: 5173, // 指定服务器端口
    open: false, // 在服务器启动时自动打开浏览器
    cors: true, // 为开发服务器配置 CORS
  },
   // 构建选项
  build: {
    outDir: 'dist', // 指定输出路径
    assetsDir: 'assets', // 指定生成静态资源的存放路径
    sourcemap: true, // 构建后是否生成 source map 文件
    minify: 'terser', // 指定压缩方式，'terser' 或 'esbuild'
  },
  plugins: [vue(), 
     AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // 路径别名
    },
    extensions: ['.js', '.json', '.ts', '.vue'] // 使用路径别名时想要省略的后缀名，可以自己 增减
  }
});
