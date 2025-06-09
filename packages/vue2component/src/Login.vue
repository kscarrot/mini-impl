<template>
  <div class="vue2-login">
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          :class="{ error: errors.username }"
          @input="validateField('username')"
        />
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          :class="{ error: errors.password }"
          @input="validateField('password')"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Vue2Login',
  props: {
    initialValues: {
      type: Object,
      default: () => ({
        username: '',
        password: '',
      }),
    },
  },
  data() {
    return {
      form: {
        username: this.initialValues.username,
        password: this.initialValues.password,
      },
      errors: {
        username: '',
        password: '',
      },
      isSubmitting: false,
    };
  },
  methods: {
    validateField(field) {
      this.errors[field] = '';
      if (!this.form[field]) {
        this.errors[field] = `${field === 'username' ? '用户名' : '密码'}不能为空`;
      }
    },
    validateForm() {
      this.validateField('username');
      this.validateField('password');
      return !this.errors.username && !this.errors.password;
    },
    async handleSubmit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      try {
        await this.$emit('submit', { ...this.form });
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.vue2-login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
}

button {
  padding: 10px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #40a9ff;
}

button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}
</style>
