import { MantineProvider } from '@mantine/core';
import type { Props } from '@/types/common';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export function MantineProviderWrapper({ children }: Props) {
	const isDarkMode = false; // Replace with your actual dark mode logic
	return (
		<MantineProvider theme={!isDarkMode ? lightTheme : darkTheme}>
			{children}
		</MantineProvider>
	);
}
