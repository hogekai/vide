<script setup lang="ts">
import { useData } from "vitepress";
import Playground from "./Playground.vue";

const { site } = useData();
const base = site.value.base;
</script>

<template>
  <div class="pg-page">
    <nav class="pg-nav">
      <a :href="base" class="pg-logo">
        <div class="pg-logo-mark">&#9654;</div>
        vide <span class="pg-badge">/ playground</span>
      </a>
      <div class="pg-nav-links">
        <a :href="base" class="pg-nl">Home</a>
        <a :href="`${base}getting-started`" class="pg-nl">Guide</a>
        <a :href="`${base}plugins/hls`" class="pg-nl">Plugins</a>
        <a href="https://github.com/hogekai/vide" class="pg-nl">GitHub &#8599;</a>
      </div>
    </nav>
    <div class="pg-body">
      <ClientOnly>
        <Playground />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Nunito:wght@300;400;500;600&display=swap');

.pg-page {
  --t: #7EC8C8;
  --bg: #f5f3ef;
  --ink: #1a1916;
  --ink2: #5a5650;
  --ink3: #a09a92;

  font-family: 'Nunito', system-ui, sans-serif;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pg-nav {
  height: 48px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
  z-index: 100;
}

.pg-logo {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 16px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-logo-mark {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--t);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0e1c1a;
  font-size: 9px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
}

.pg-badge {
  font-family: 'Nunito', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.pg-nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pg-nl {
  font-size: 13px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 8px;
  transition: color 0.13s, background 0.13s;
}

.pg-nl:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}

.pg-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pg-body :deep(.playground) {
  height: 100%;
}
</style>
