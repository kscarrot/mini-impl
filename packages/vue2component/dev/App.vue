<template>
  <div id="app">
    <h1>Vue2 Login Component 测试页面</h1>

    <div class="test-section">
      <h2>基础用法</h2>
      <vue2-login :initial-values="{ username: '', password: '' }" @submit="handleLogin" />
    </div>

    <div class="test-section">
      <h2>带初始值</h2>
      <vue2-login :initial-values="{ username: 'test', password: '123456' }" @submit="handleLogin" />
    </div>

    <div class="test-section">
      <h2>调试信息</h2>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { Vue2Login } from '../src';

export default {
  name: 'App',
  components: {
    Vue2Login,
  },
  data() {
    return {
      debugInfo: {
        lastSubmit: null,
        submitCount: 0,
      },
    };
  },
  methods: {
    async handleLogin(formData) {
      this.debugInfo = {
        lastSubmit: formData,
        submitCount: this.debugInfo.submitCount + 1,
        timestamp: new Date().toISOString(),
      };
      console.log('Login data:', formData);
    },
  },
};
</script>

<style>
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

h2 {
  color: #42b983;
  margin-bottom: 20px;
}

pre {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
}
</style>
