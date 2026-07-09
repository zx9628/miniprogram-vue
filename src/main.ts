// src/main.ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';

// 🔥 在应用入口配置适配器，确保全局生效
axios.defaults.adapter = mpAdapter as any;

// 测试配置是否生效
console.log('axios adapter:', axios.defaults.adapter);

export function createApp() {
  const app = createSSRApp(App);
  return {
    app
  };
}