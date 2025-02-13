import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { z } from "zod"
import { SubCommand } from "../../base/Commands.js"
import { BotConfigType } from "../../base/database.js"

const Setaction: SubCommand = {
	data: new SlashCommandSubcommandBuilder()
		.setName("setaction")
		.setDescription("Set an action which happens on report or revocation creation")
		.addStringOption(option => 
			option
				.setName("report")
				.setDescription("Action to perform on report creation")
				.setRequired(false)
				.addChoice("ban", "ban")
				.addChoice("custom", "custom")
				.addChoice("none", "none")
		)
		.addStringOption(option => 
			option
				.setName("revocation")
				.setDescription("Action to perform on revocation creation")
				.setRequired(false)
				.addChoice("unban", "unban")
				.addChoice("custom", "custom")
				.addChoice("none", "none")
		)
	,
	execute: async ({ client, interaction }) => {
		const revocation = z.enum([ "unban", "custom", "none" ]).nullable().parse(interaction.options.getString("revocation"))
		const report = z.enum([ "ban", "custom", "none" ]).nullable().parse(interaction.options.getString("report"))
		
		const config: Partial<BotConfigType> & Pick<BotConfigType, "guildID"> = {
			guildID: interaction.guildId,
		} as const
		if (report) config.reportAction = report
		if (revocation) config.revocationAction = revocation
		await client.setBotConfig(config)

		const botConfig = await client.getBotConfig(interaction.guildId)
		if (!botConfig) return interaction.reply("An error occured")
		return interaction.reply({
			content: `Report action is ${botConfig.reportAction}. Revocation action is ${botConfig.revocationAction}`
		})
	}
}
export default Setaction