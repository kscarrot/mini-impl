import Vue from 'vue';
import { installWebComponent } from '../src/index';
import App from './App.vue';

// 创建 Vue 实例
const app = new Vue({
  el: '#app',
  render: h => h(App),
});

// 等待 Vue 实例挂载完成后再安装 Web Component
app.$nextTick(() => {
  console.log('Vue app mounted');
  // 安装 Web Component
  installWebComponent();
});
