import type { Props } from "@/types/common";

export function ServerProviders({ children }: Props) {
	// Server-safe providers (none for now, add theme or other SSR-safe providers here)
	return <>{children}</>;
}

export default ServerProviders;
