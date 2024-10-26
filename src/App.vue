<template>
  <div class="app">
    <template v-if="userStore.isAuthenticated">
      <header class="header">
        <span>Welcome, {{ userStore.username }}</span>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </header>
      <div class="content">
        <h2>Dashboard</h2>
        <p>You are now logged in.</p>
      </div>
    </template>
    <LoginForm v-else />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './stores/userStore';
import LoginForm from './components/LoginForm.vue';

const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  min-height: 100vh;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content {
  padding: 2rem;
  color: white;
}
</style>
