<template>
  <section class="dashboard-page">
    <div v-if="!currentUser" class="auth-wall">
      <h2>Authentification requise</h2>
      <p>Connectez-vous pour accéder à votre tableau de bord.</p>
      <RouterLink class="primary-link" to="/">Aller à la connexion</RouterLink>
    </div>

    <div v-else class="dashboard-content">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Tableau de bord</p>
          <h2>Bonjour {{ currentUser.fullName ?? currentUser.email }}</h2>
          <p class="description">
            Choisissez ce que vous souhaitez gérer aujourd'hui : comptes bancaires, budgets ou catégories.
          </p>
        </div>
        <div class="user-meta">
          <span class="badge">Devise par défaut: {{ currentUser.defaultCurrency ?? "EUR" }}</span>
          <span class="badge">Rôle: {{ currentUser.role }}</span>
        </div>
      </header>

      <div class="quick-actions">
        <article v-for="action in actions" :key="action.path" class="action-card">
          <div class="action-content">
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </div>
          <RouterLink class="action-link" :to="action.path">{{ action.cta }}</RouterLink>
        </article>
      </div>

      <section class="tips">
        <h4>Conseils rapides</h4>
        <ul>
          <li>Commencez par créer vos comptes pour suivre vos soldes.</li>
          <li>Définissez vos catégories avant d'ajouter des transactions pour mieux les classer.</li>
          <li>Créer des budgets mensuels pour garder le cap sur vos objectifs.</li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import { useAuth } from "../composables/auth";

const { currentUser } = useAuth();

const actions = computed(() => [
  {
    title: "Comptes",
    description: "Ajoutez vos comptes bancaires, cash ou épargne et suivez vos soldes.",
    cta: "Gérer mes comptes",
    path: "/accounts",
  },
  {
    title: "Budgets",
    description: "Créez vos budgets mensuels et suivez vos dépenses prévues.",
    cta: "Explorer les budgets",
    path: "/budgets",
  },
  {
    title: "Catégories",
    description: "Organisez vos transactions avec des catégories de dépenses ou revenus.",
    cta: "Configurer les catégories",
    path: "/categories",
  },
]);
</script>

<style scoped>
.dashboard-page {
  width: 100%;
}

.auth-wall {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: white;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 24px;
  background: rgba(37, 99, 235, 0.1);
  color: #e2e8f0;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.description {
  color: rgba(226, 232, 240, 0.75);
  margin-top: 0.35rem;
  max-width: 520px;
}

.user-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: rgba(226, 232, 240, 0.9);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.action-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.45);
  padding: 1.25rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
}

.action-content h3 {
  margin: 0 0 0.25rem;
}

.action-content p {
  color: rgba(226, 232, 240, 0.75);
  font-size: 0.95rem;
}

.action-link {
  align-self: flex-start;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(59, 130, 246, 0.6);
  color: #93c5fd;
  text-decoration: none;
  font-weight: 600;
}

.tips {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.35);
  color: #e2e8f0;
}

.tips h4 {
  margin-top: 0;
}

.tips ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  color: rgba(226, 232, 240, 0.8);
}

@media (max-width: 960px) {
  .dashboard-header {
    flex-direction: column;
  }
}
</style>
