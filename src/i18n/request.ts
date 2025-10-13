import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
	// Default messages for server-side rendering
	const messages = (await import(`../locales/en.json`)).default;

	return {
		locale: "en",
		messages,
		timeZone: "Europe/Budapest",
		now: new Date(),
	};
});
