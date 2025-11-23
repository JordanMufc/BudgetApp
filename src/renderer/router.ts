import { createMemoryHistory, createRouter } from "vue-router";
import AuthLanding from "./pages/AuthLanding.vue";
import AccountsManager from "./pages/AccountsManager.vue";
import BudgetsDashboard from "./pages/BudgetsDashboard.vue";
import NewBudgetForm from "./pages/NewBudgetForm.vue";
import CategoriesManager from "./pages/CategoriesManager.vue";
import Dashboard from "./pages/Dashboard.vue";

const routes = [
  { path: "/", component: AuthLanding },
  { path: "/dashboard", component: Dashboard },
  { path: "/accounts", component: AccountsManager },
  { path: "/budgets", component: BudgetsDashboard },
  { path: "/budgets/new", component: NewBudgetForm },
  { path: "/categories", component: CategoriesManager },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
