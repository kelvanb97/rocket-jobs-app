import { DiscordIcon } from "#assets/icons/discord-icon"
import { Button } from "#library/button/button"

export function DiscordButton() {
	return (
		<a href="https://discord.gg/gfwrxnmyqU">
			<Button variant="outline" size="lg" className="w-full">
				<DiscordIcon />
				Join our Discord
			</Button>
		</a>
	)
}
