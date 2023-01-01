const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show the first 10 songs in the queue.'),
	execute: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild);

		if (!queue || !queue.playing) {
			await interaction.reply('There is no song playing');
			return;
		}

		const queueString = queue.tracks.slice(0, 10).map((song, i) => {
			return `${i + 1}) [${song.duration}]\` ${song.title} - <@${song.requestBy.id}>`;
		}).join('\n');

		const currentSong = queue.current;

		await interaction.reply({
			embed: [
				new EmbedBuilder()
					.setDescription(`**Currently Playing: **\n\` ${currentSong.title} - <@${currentSong.requestBy.id}>\n\n**Queue:**\n${queueString}`)
					.setThumbnail(currentSong.thumbnail),
			],
		});
	},
};