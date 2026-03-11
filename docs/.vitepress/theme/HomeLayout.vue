<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import LandingPage from "../components/LandingPage.vue";

const { Layout } = DefaultTheme;
const { frontmatter } = useData();
</script>

<template>
  <LandingPage v-if="frontmatter.layout === 'home'" />
  <Layout v-else />
</template>
