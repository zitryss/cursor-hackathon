import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("features/year-file/route.tsx"),
	route("salbot", "features/salbot/route.tsx"),
	route("counter", "features/counter/route.tsx"),
	route("api/counter/events", "features/counter/counter-events.route.ts"),
] satisfies RouteConfig;
