import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import HomeLayout from "./HomeLayout.vue";

export default {
	extends: DefaultTheme,
	Layout: HomeLayout,
} satisfies Theme;
