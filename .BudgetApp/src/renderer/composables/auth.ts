import { ref } from "vue";
import type { UserProfile } from "src/shared/auth";

const STORAGE_KEY = "budgetapp:user";
const currentUser = ref<UserProfile | null>(null);

const isBrowser = typeof window !== "undefined";

const loadFromStorage = () => {
  if (!isBrowser || currentUser.value) {
    return;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      currentUser.value = JSON.parse(raw) as UserProfile;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};

const persist = (user: UserProfile | null) => {
  if (!isBrowser) {
    return;
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

loadFromStorage();

export function useAuth() {
  const setUser = (user: UserProfile | null) => {
    currentUser.value = user;
    persist(user);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    currentUser,
    setUser,
    logout,
  };
}
