<template>
  <div class="app">
    <h1>Vue Login Web Component Demo</h1>
    <!-- 使用 Web Component -->
    <vue-login :initial-values="initialValues" @submit="handleLogin"></vue-login>

    <!-- 调试信息显示区域 -->
    <div class="debug-info">
      <h3>Debug Info:</h3>
      <pre>{{ debugInfo ? JSON.stringify(debugInfo, null, 2) : 'No data yet' }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      initialValues: {
        username: '',
        password: '',
      },
      debugInfo: null,
    };
  },
  methods: {
    handleLogin(event) {
      this.debugInfo = event.detail;
      console.log('Login data:', event.detail);
    },
  },
};
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.debug-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
