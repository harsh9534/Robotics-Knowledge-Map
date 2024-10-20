import { createRouter, createWebHistory } from "vue-router";

import Knowledge from "../components/KnowledgeMap.vue";
import ParticlesComponent from "../components/ParticlesComponent.vue";

const routes = [
  { path: "/", component: ParticlesComponent },
  { path: "/knowledge", component: Knowledge },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
