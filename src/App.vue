<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Credential Manager</h1>
      <div class="status-bar" v-if="store.isLoading || store.error">
        <div v-if="store.isLoading" class="loading">Loading...</div>
        <div v-if="store.error" class="error">{{ store.error }}</div>
      </div>
    </header>

    <main class="app-content">
      <div class="welcome-message">
        <h2>Welcome to Credential Manager</h2>
        <p>A secure and efficient way to manage your credentials</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from './stores'

const store = useMainStore()
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.status-bar {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.loading {
  color: #3498db;
}

.error {
  color: #e74c3c;
}

.app-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.welcome-message {
  text-align: center;
  margin-top: 2rem;
}

.welcome-message h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.welcome-message p {
  color: #7f8c8d;
}
</style>
