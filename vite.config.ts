import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { VueAmapResolver } from "@vuemap/unplugin-resolver";
import legacy from "./legacy.ts";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    console.log("API URL:", env.VITE_API_URL);
    console.log("App Title:", env.VITE_APP_TITLE);

    // 代理配置
    const proxyConfig: Record<string, any> = {};
    if (env.VITE_PROXY_ENABLED === "true") {
        proxyConfig["/api"] = {
            target: env.VITE_PROXY_TARGET || env.VITE_API_URL || "http://localhost:3001",
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, "")
        };
    }

    return {
        define: {
            __APP_ENV__: env.APP_ENV,
            __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || "换电站管理系统"),
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0")
        },
        plugins: [
            vue(),
            legacy,
            AutoImport({
                resolvers: [
                    ElementPlusResolver({
                        exclude: /^ElAmap[A-Z]*/
                    }),
                    VueAmapResolver()
                ]
            }),
            Components({
                resolvers: [
                    ElementPlusResolver({
                        exclude: /^ElAmap[A-Z]*/
                    }),
                    VueAmapResolver()
                ]
            })
        ],
        optimizeDeps: {
            include: ["lamejs"]
        },
        server: {
            host: true,
            port: 5173,
            proxy: proxyConfig
        },
        build: {
            outDir: env.VITE_BUILD_OUTPUT_DIR || "dist",
            sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["vue", "vue-router", "pinia"],
                        elementPlus: ["element-plus"],
                        amap: ["@vuemap/vue-amap"]
                    }
                }
            }
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url))
            }
        }
    };
});
