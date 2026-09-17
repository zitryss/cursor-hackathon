import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("features/year-file/route.tsx"),
	route("counter", "features/counter/route.tsx"),
	route("shop", "features/taxlens/shop.route.tsx"),
	route("tax-plan", "features/taxlens/tax-plan.route.tsx"),
	route("api/counter/events", "features/counter/counter-events.route.ts"),
] satisfies RouteConfig;
