"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { getLocaleMessages, getStoredLocale } from "@/lib/locale";
import { store } from "@/lib/store";
import type { Props } from "@/types/common";
import { MantineProviderWrapper } from "./mantine/mantine";

export function ClientProviders({
	children,
	messages: initialMessages,
	locale: initialLocale,
}: Props & { messages: any; locale: string }) {
	const [messages, setMessages] = useState(initialMessages);
	const [locale, setLocale] = useState(initialLocale);

	useEffect(() => {
		const loadLocale = () => {
			const storedLocale = getStoredLocale();
			setLocale(storedLocale);

			if (storedLocale !== initialLocale) {
				const localeMessages = getLocaleMessages(storedLocale);
				setMessages(localeMessages);
			}
		};

		loadLocale();
	}, [initialLocale]);

	return (
		<NextIntlClientProvider
			locale={locale}
			messages={messages}
			timeZone="Europe/Budapest"
			now={new Date()}
		>
			<ReduxProvider store={store}>
				<MantineProviderWrapper>{children}</MantineProviderWrapper>
			</ReduxProvider>
		</NextIntlClientProvider>
	);
}

export default ClientProviders;
