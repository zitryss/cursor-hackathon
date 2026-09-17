import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import babel from "vite-plugin-babel";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		babel({
			include: /\.[jt]sx?$/,
			exclude: /node_modules/,
			babelConfig: {
				presets: ["@babel/preset-typescript"],
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		watch: {
			ignored: ["**/*.db", "**/*.db-*"],
		},
	},
	test: {
		include: [
			"app/**/*.{test,spec}.{ts,tsx}",
			"packages/*/src/**/*.{test,spec}.{ts,tsx}",
		],
		restoreMocks: true,
	},
});
