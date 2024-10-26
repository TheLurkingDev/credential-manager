import { defineStore } from 'pinia';

interface UserState {
    isAuthenticated: boolean;
    username: string | null;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        isAuthenticated: false,
        username: null
    }),

    actions: {
        async login(username: string, password: string): Promise<boolean> {
            try {
                const success = await window.electron.verifyUser(username, password);
                if (success) {
                    this.isAuthenticated = true;
                    this.username = username;
                }
                return success;
            } catch (error) {
                console.error('Login failed:', error);
                return false;
            }
        },

        async register(username: string, password: string): Promise<boolean> {
            try {
                const success = await window.electron.createUser(username, password);
                if (success) {
                    // Automatically log in after successful registration
                    return this.login(username, password);
                }
                return false;
            } catch (error) {
                console.error('Registration failed:', error);
                return false;
            }
        },

        logout() {
            this.isAuthenticated = false;
            this.username = null;
        }
    }
});
