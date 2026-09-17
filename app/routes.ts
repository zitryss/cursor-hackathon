import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("features/taxfix-pitch/route.tsx"),
	route("pulse", "features/year-file/route.tsx"),
] satisfies RouteConfig;
