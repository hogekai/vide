<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import LandingPage from "../components/LandingPage.vue";
import PlaygroundPage from "../components/PlaygroundPage.vue";

const { Layout } = DefaultTheme;
const { frontmatter } = useData();
</script>

<template>
  <LandingPage v-if="frontmatter.layout === 'home'" />
  <PlaygroundPage v-else-if="frontmatter.layout === 'playground'" />
  <Layout v-else />
</template>
