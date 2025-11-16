<template>
  <div class="auth-wrapper">
    <section class="auth-panel">
      <header class="auth-header">
        <h2>Bienvenue sur BudgetApp</h2>
        <p>Créez un compte pour suivre vos budgets ou connectez-vous pour continuer.</p>
      </header>

      <div class="auth-content">
        <form class="auth-card main-card" @submit.prevent="handleLogin">
          <h3>Se connecter</h3>
          <label>
            Email
            <input v-model="loginForm.email" type="email" placeholder="jean@exemple.com" required />
          </label>
          <label>
            Mot de passe
            <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
          </label>
          <button type="submit" :disabled="isLoginLoading">
            {{ isLoginLoading ? "Connexion..." : "Connexion" }}
          </button>
          <p v-if="loginError" class="form-error">{{ loginError }}</p>
          <p class="secondary-action">
            Pas encore de compte ?
            <button class="link-button" type="button" @click="openRegister">Créer un compte</button>
          </p>
        </form>

        <form
          v-if="showRegister"
          class="auth-card secondary-card"
          @submit.prevent="handleRegister"
        >
          <header>
            <h3>Créer un compte</h3>
            <button type="button" class="close-button" @click="closeRegister" aria-label="Fermer">
              ×
            </button>
          </header>
          <label>
            Nom complet
            <input v-model="registerForm.name" type="text" placeholder="Jean Dupont" required />
          </label>
          <label>
            Email
            <input v-model="registerForm.email" type="email" placeholder="jean@exemple.com" required />
          </label>
          <label>
            Mot de passe
            <input v-model="registerForm.password" type="password" placeholder="••••••••" required />
          </label>
          <button type="submit" :disabled="isRegisterLoading">
            {{ isRegisterLoading ? "Création..." : "Créer mon compte" }}
          </button>
          <p v-if="registerError" class="form-error">{{ registerError }}</p>
        </form>
      </div>
      <p v-if="registerSuccess" class="success-banner">{{ registerSuccess }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import type { LoginCredentials } from "src/shared/auth";
import { useAuth } from "../composables/auth";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface LoginForm extends LoginCredentials {}

const router = useRouter();
const { setUser, currentUser } = useAuth();

const registerForm = reactive<RegisterForm>({
  name: "",
  email: "",
  password: "",
});

const loginForm = reactive<LoginForm>({
  email: "",
  password: "",
});

const showRegister = ref(false);
const isLoginLoading = ref(false);
const isRegisterLoading = ref(false);
const loginError = ref<string | null>(null);
const registerError = ref<string | null>(null);
const registerSuccess = ref<string | null>(null);

watch(showRegister, (visible) => {
  if (visible) {
    registerError.value = null;
    registerSuccess.value = null;
  }
});

watch(
  () => currentUser.value,
  (user) => {
    if (user) {
      void router.replace("/dashboard");
    }
  },
  { immediate: true },
);

const openRegister = () => {
  showRegister.value = true;
};

const closeRegister = () => {
  showRegister.value = false;
};

const resetRegisterForm = () => {
  registerForm.name = "";
  registerForm.email = "";
  registerForm.password = "";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const handleRegister = async () => {
  registerError.value = null;
  registerSuccess.value = null;

  try {
    isRegisterLoading.value = true;

    const user = await window.electronService.auth.register({
      fullName: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    });

    registerSuccess.value = `Compte créé pour ${user.fullName ?? user.email}. Vous pouvez maintenant vous connecter.`;
    loginForm.email = user.email;
    loginForm.password = "";
    resetRegisterForm();
    closeRegister();
  } catch (error) {
    registerError.value = getErrorMessage(
      error,
      "Impossible de créer le compte.",
    );
  } finally {
    isRegisterLoading.value = false;
  }
};

const handleLogin = async () => {
  loginError.value = null;
  registerSuccess.value = null;

  try {
    isLoginLoading.value = true;

    const user = await window.electronService.auth.login({
      email: loginForm.email,
      password: loginForm.password,
    });

    setUser(user);
    await router.push("/dashboard");
  } catch (error) {
    loginError.value = getErrorMessage(error, "Impossible de se connecter.");
  } finally {
    isLoginLoading.value = false;
  }
};

</script>

<style scoped>
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}

.auth-panel {
  width: min(960px, 100%);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.auth-header p {
  color: #94a3b8;
}

.auth-content {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.65);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.auth-card h3 {
  margin-bottom: 0.5rem;
  color: #f8fafc;
}

.auth-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-card {
  flex: 1;
  min-width: 280px;
}

.secondary-card {
  width: min(320px, 100%);
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #cbd5f5;
  font-size: 0.9rem;
}

input {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.35);
  padding: 0.75rem 1rem;
  color: #e2e8f0;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #38bdf8;
}

button {
  margin-top: 0.5rem;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

.form-error {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fecaca;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
}

.secondary-action {
  margin-top: 0.75rem;
  color: #94a3b8;
  text-align: center;
  font-size: 0.9rem;
}

.link-button {
  border: none;
  background: transparent;
  color: #38bdf8;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.close-button {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.success-banner {
  margin-top: 1rem;
  background: rgba(134, 239, 172, 0.15);
  border: 1px solid rgba(134, 239, 172, 0.4);
  color: #bbf7d0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  text-align: center;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

</style>
