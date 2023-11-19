const { MessageEmbed, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "botlist",
  description: "Afficher les tags des bots dans la base de données avec leurs acheteurs",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    client.db.all('SELECT DISTINCT bot_id, owner FROM Astroia', async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        return message.reply('Une erreur est survenue.');
      }

      const botTagsAndBuyers = [];

      for (const row of rows) {
        const botUser = await client.users.fetch(row.bot_id).catch(() => null);

        if (botUser && buyerUser) {
          botTagsAndBuyers.push({ botTag: botUser.tag, botid: botUser.id });
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('Liste des bots')
        .setColor(client.color);

      if (botTagsAndBuyers.length > 0) {
        const botListWithBuyers = botTagsAndBuyers.map((info, index) => `${index + 1} - Bot : ${info.botid}`).join('\n');
        embed.setDescription(`\`\`\`yml\n${botListWithBuyers}\`\`\``);
      } else {
        embed.setDescription('Aucun bot trouvé');
      }

      message.channel.send({ embeds: [embed] });
    });
  },
};
