import { createTheme, type MantineThemeOverride } from "@mantine/core";
import { lightTheme } from "./lightTheme";

export const darkTheme: MantineThemeOverride = createTheme({
	...lightTheme,
	components: {
		NavLink: {
			defaultProps: {
				c: "gray.4",
			},
		},
		Title: {
			defaultProps: {
				c: "gray.2",
			},
		},
		Text: {
			defaultProps: {
				c: "gray.2",
			},
		},
	},
});
