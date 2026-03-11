<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import HeroDemo from "../components/HeroDemo.vue";

const { Layout } = DefaultTheme;
const { frontmatter } = useData();
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <HeroDemo v-if="frontmatter.layout === 'home'" />
    </template>
  </Layout>
</template>

<style>
/* Hero text sizing — tighter, more modern */
.VPHero .name {
  font-size: 36px !important;
  line-height: 1.1 !important;
}

.VPHero .text {
  font-size: 20px !important;
  line-height: 1.4 !important;
  font-weight: 500 !important;
  letter-spacing: -0.01em;
}

.VPHero .tagline {
  font-size: 15px !important;
  line-height: 1.5 !important;
  color: var(--vp-c-text-2);
}

/* Tighten hero vertical spacing */
.VPHero .main {
  padding: 48px 0 32px !important;
}

.VPHero .main .name + .text {
  margin-top: 8px;
}

.VPHero .main .text + .tagline {
  margin-top: 8px;
}

/* Better balance between text and demo on desktop */
@media (min-width: 960px) {
  .VPHero .name {
    font-size: 40px !important;
  }

  .VPHero .text {
    font-size: 22px !important;
  }

  .VPHero .tagline {
    font-size: 16px !important;
  }

  /* Text takes less space, demo takes more */
  .VPHero .container {
    gap: 48px;
  }

  .VPHero .main {
    max-width: 380px;
    flex-shrink: 0;
  }

  .VPHero .image {
    flex: 1;
    min-width: 0;
    max-width: 640px;
  }
}

/* Action buttons — smaller, tighter */
.VPHero .actions {
  margin-top: 20px !important;
  gap: 12px !important;
}

.VPHero .actions .VPButton {
  padding: 8px 20px !important;
  font-size: 14px !important;
  border-radius: 8px !important;
}
</style>
