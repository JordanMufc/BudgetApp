<template>
  <button class="fab" @click="goToForm">Nouveau budget</button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToForm = () => {
  router.push("/budgets/new");
};
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 999px;
  background: linear-gradient(120deg, #22d3ee, #0ea5e9);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 15px 25px rgba(15, 118, 230, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 35px rgba(15, 118, 230, 0.4);
}
</style>
