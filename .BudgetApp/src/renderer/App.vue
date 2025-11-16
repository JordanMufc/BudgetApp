<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <h1>BudgetApp</h1>
        <p>Gestion de budget personnelle</p>
      </div>
      <nav class="app-nav">
        <RouterLink to="/dashboard">Tableau de bord</RouterLink>
        <RouterLink to="/accounts">Comptes</RouterLink>
        <RouterLink to="/budgets">Budgets</RouterLink>
        <RouterLink to="/categories">Catégories</RouterLink>
      </nav>
      <div class="user-badge" v-if="currentUser">
        <span class="user-name">{{ currentUser.fullName ?? currentUser.email }}</span>
        <button class="logout" type="button" @click="handleLogout">Déconnexion</button>
      </div>
      <RouterLink v-else class="login-link" to="/">Connexion</RouterLink>
    </header>
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuth } from "./composables/auth";

const router = useRouter();
const { currentUser, logout } = useAuth();

const handleLogout = () => {
  logout();
  router.push("/");
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e2e8f0;
  gap: 1rem;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.app-content {
  flex: 1;
}

.app-nav {
  display: flex;
  gap: 0.75rem;
}

.app-nav a {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.app-nav .router-link-active {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
}

.user-name {
  font-size: 0.9rem;
}

.logout {
  border: none;
  background: transparent;
  color: #f87171;
  cursor: pointer;
  font-weight: 600;
}

.login-link {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #38bdf8;
  font-weight: 600;
  text-decoration: none;
}
</style>
