import Vue from 'vue';
import wrap from '@vue/web-component-wrapper';
import { Vue2Login } from '@mini-impl/vue2-login';

// 确保 Vue2Login 组件有正确的名称
Vue2Login.name = 'Vue2Login';

export const WebComponentName = 'vue-login';

export function installWebComponent() {
  if (typeof window === 'undefined' || !window.customElements) {
    console.warn('window.customElements is not defined');
    return;
  }

  const isExist = Boolean(window.customElements.get(WebComponentName));
  if (isExist) return;

  // 包装 Vue 组件为 Web Component
  const WrappedLogin = wrap(Vue, Vue2Login, {
    functionalProps: ['submit'],
  });

  window.customElements.define(WebComponentName, WrappedLogin);
}
