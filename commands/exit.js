const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exit')
		.setDescription('Exit the voice channel.'),
	execute: async ({ client, interaction }) => {

		const queue = client.player.getQueue(interaction.guild);

		if (!queue) {
			await interaction.reply('There is no song playing.');
			return;
		}

		queue.destroy();

		await interaction.reply('(┬┬﹏┬┬).');
	},
};