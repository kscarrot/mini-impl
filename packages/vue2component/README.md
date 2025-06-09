# Vue 2.7 Login Component

一个基于 Vue 2.7 的登录组件，支持表单验证和自定义样式。

## 安装

```bash
npm install @mini-impl/vue2-login
```

## 使用方法

### 全局注册

```js
import Vue from 'vue';
import Vue2Login from '@mini-impl/vue2-login';

Vue.use(Vue2Login);
```

### 局部注册

```js
import { Vue2Login } from '@mini-impl/vue2-login';

export default {
  components: {
    Vue2Login,
  },
};
```

### 在模板中使用

```vue
<template>
  <vue2-login :initial-values="{ username: '', password: '' }" @submit="handleLogin" />
</template>

<script>
export default {
  methods: {
    async handleLogin(formData) {
      try {
        // 处理登录逻辑
        console.log('Login data:', formData);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
  },
};
</script>
```

## Props

| 属性名        | 类型   | 默认值                         | 说明       |
| ------------- | ------ | ------------------------------ | ---------- |
| initialValues | Object | { username: '', password: '' } | 表单初始值 |

## Events

| 事件名 | 参数                                   | 说明           |
| ------ | -------------------------------------- | -------------- |
| submit | { username: string, password: string } | 表单提交时触发 |

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```
