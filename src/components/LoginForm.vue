<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>{{ isLogin ? 'MEMBER LOGIN' : 'REGISTER' }}</h1>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <input 
            type="text" 
            v-model="username" 
            placeholder="Username"
            required
          >
        </div>
        
        <div class="input-group">
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password"
            required
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-button">
          {{ isLogin ? 'LOGIN' : 'REGISTER' }}
        </button>

        <div class="form-footer">
          <button 
            type="button" 
            class="switch-mode" 
            @click="toggleMode"
          >
            {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();

const username = ref('');
const password = ref('');
const error = ref('');
const isLogin = ref(true);

const handleSubmit = async () => {
  try {
    error.value = '';
    console.log(`Attempting to ${isLogin.value ? 'login' : 'register'} with username: ${username.value}`);
    
    const success = isLogin.value 
      ? await userStore.login(username.value, password.value)
      : await userStore.register(username.value, password.value);

    if (!success) {
      error.value = isLogin.value 
        ? 'Invalid username or password'
        : 'Registration failed. Username may already exist.';
    }
  } catch (err) {
    console.error('Form submission error:', err);
    error.value = 'An error occurred. Please try again.';
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  username.value = '';
  password.value = '';
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.login-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
}

input:focus {
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.login-button {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  text-align: center;
}

.form-footer {
  margin-top: 1rem;
  text-align: center;
}

.switch-mode {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  text-decoration: underline;
}

.switch-mode:hover {
  color: #ffffff;
}
</style>
