import "@/assets/styles/main.css";

import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores/index";
    // 引入vue-amap
import VueAMap, { initAMapApiLoader } from "@vuemap/vue-amap";
import "@vuemap/vue-amap/dist/style.css";
// 引入环境配置
import { ENV_CONFIG, getAmapConfigInfo } from "./config/env.ts";

// 验证高德地图配置
const amapConfig = getAmapConfigInfo();

if (!amapConfig.validation.isValid) {
    console.error('高德地图配置错误:', amapConfig.validation.errors);
    alert('高德地图配置错误:\n' + amapConfig.validation.errors.join('\n'));
}

// 初始化vue-amap
initAMapApiLoader({
    // 从环境配置获取高德的key
    key: ENV_CONFIG.AMAP_KEY || "your_key",
    securityJsCode: ENV_CONFIG.AMAP_SECURITY_JS_CODE || "your_security_js_code", // 新版key需要配合安全密钥使用
    Loca: {
        version: "2.0.0"
    },
    plugins: [
        "AMap.MouseTool",
        "AMap.PolyEditor",
        "AMap.ToolBar",
        "AMap.MapType",
        "AMap.PlaceSearch",
        "AMap.Autocomplete",
        "AMap.Scale",
        "AMap.OverView",
        "AMap.CitySearch",
        "AMap.Geolocation",
        "AMap.Geocoder",
        "AMap.DistrictSearch",
        "AMap.InfoWindow",
        "AMap.Riding"
    ]
});

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(VueAMap);
app.use(ElementPlus, {
    locale: zhCn
});
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.mount("#app");
