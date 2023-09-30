import {defineStore} from 'pinia'
import router from "../router/router";
import {getData, METHODS} from "@/utils/http";

let token = localStorage.getItem('token');
let profile = JSON.parse(localStorage.getItem('profile'));
let isAuthenticated = !!token;

export const useStore = defineStore('main', {
  state: () => ({
    isAuthenticated: isAuthenticated,
    token: null,
    profile: profile,
  }),
  getters: {
    isAuthenticate(state) {
      return state.isAuthenticated;
    },
    userProfile(state) {
      return state.profile;
    },
  },
  actions: {
    async login({email, password}) {
      try {
        let response = await fetch(import.meta.env.VITE_API_URL + '/admin/auth/login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email,
                password: password,
              })
            }
        );

        response = await response.json();

        if (response.success) {
          localStorage.setItem('token', response.result.items.token);
          await this.getProfile();
          this.token = response?.result.items.token;
          this.isAuthenticated = true;
          router.push(router?.currentRoute?.query?.redirect ?? '/cards');
        }

        return response;
      } catch (e) {
        return e;
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      this.profile = null;
      this.token = null;
      this.isAuthenticated = false;
      router.push('/login');
    },
    getProfile() {
      return getData('/admin/auth/self', METHODS.GET).then((r) => {
        if (r.success) {
          this.setProfile(r.result.item);
        }
      });
    },
    setProfile(payload) {
      this.profile = payload;
      localStorage.setItem('profile', JSON.stringify(payload));
    }

  },
})
