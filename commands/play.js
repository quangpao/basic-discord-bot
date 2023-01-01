const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song')
		.addSubcommand(subCommand => {
			return subCommand
				.setName('search')
				.setDescription('Searches for a song.')
				.addStringOption(option => {
					return option
						.setName('searchterms')
						.setDescription('search keywords')
						.setRequired(true);
				});
		})
		.addSubcommand(subCommand => {
			return subCommand
				.setName('playlist')
				.setDescription('Play a playlist from YT')
				.addStringOption(option => {
					return option
						.setName('url')
						.setDescription('playlist url')
						.setRequired(true);
				});
		})
		.addSubcommand(subCommand => {
			return subCommand
				.setName('song')
				.setDescription('Play a song from YT')
				.addStringOption(option => {
					return option
						.setName('url')
						.setDescription('url of the song')
						.setRequired(true);
				});
		}),
	execute: async ({ client, interaction }) => {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) {
			await interaction.editReply({ content: 'You must be in a voice channel to use this command.' });
			return;
		}

		const queue = await client.player.createQueue(interaction.guild);

		if (!queue.connection) await queue.connect(interaction.member.voice.channel);

		const embed = new EmbedBuilder();
		if (interaction.options.getSubcommand() === 'song') {
			const url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_VIDEO,
			});

			if (result.tracks.length === 0) {
				await interaction.editReply({ content : 'No result found!' });
				return;
			}

			const song = result.tracks[0];
			await queue.addTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}
		else if (interaction.options.getSubcommand() === 'playlist') {
			const url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_PLAYLIST,
			});

			if (result.tracks.length === 0) {
				await interaction.editReply({ content: 'No playlist found!' });
				return;
			}

			const playlist = result.playlist;
			await queue.addTracks(playlist);

			embed
				.setDescription(`Added **[${playlist.title}](${playlist.url})** to the queue`)
				.setThumbnail(playlist.thumbnail)
				.setFooter({ text: `Duration: ${playlist.duration}` });
		}
		else if (interaction.options.getSubcommand() === 'search') {
			const searchterms = interaction.options.getString('searchterms');

			const result = await client.player.search(searchterms, {
				requestedBy: interaction.user,
				searchEngine: QueryType.YOUTUBE_SEARCH,
			});

			if (result.tracks.length === 0) {
				await interaction.editReply({ content: 'No results found.' });
				return;
			}

			const song = result.tracks[0];
			queue.addTrack(song);

			embed
				.setDescription(`Added **[${song.title}](${song.url})** to the queue`)
				.setThumbnail(song.thumbnail)
				.setFooter({ text: `Duration: ${song.duration}` });
		}

		if (!queue.playing) await queue.play();

		await interaction.editReply({ embeds: [embed] });
	},
};