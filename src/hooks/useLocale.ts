import { useEffect, useState } from "react";
import {
	getLocaleMessages,
	getStoredLocale,
	setStoredLocale,
} from "@/lib/locale";

export const useLocale = () => {
	const [locale, setLocale] = useState("en");
	const [messages, setMessages] = useState<any>({});

	useEffect(() => {
		const loadLocale = async () => {
			const storedLocale = getStoredLocale();
			setLocale(storedLocale);
			const localeMessages = await getLocaleMessages(storedLocale);
			setMessages(localeMessages);
		};

		loadLocale();
	}, []);

	const changeLocale = async (newLocale: string) => {
		setStoredLocale(newLocale);
		setLocale(newLocale);
		const newMessages = await getLocaleMessages(newLocale);
		setMessages(newMessages);
	};

	const t = (key: string) => {
		const keys = key.split(".");
		let value = messages;
		for (const k of keys) {
			value = value?.[k];
		}
		return value || key;
	};

	return {
		locale,
		changeLocale,
		t,
	};
};
