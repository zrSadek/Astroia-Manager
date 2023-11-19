const { MessageEmbed, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "bot",
  description: "Afficher les bots d'un membre",
  run: async (client, message, args, prefix) => {
    let userId;
    if (message.mentions.users.size > 0) {
      userId = message.mentions.users.first().id;
    } else if (args[0]) {
      userId = args[0];
    } else {
      return message.reply("Veuillez mentionner un membre ou fournir un ID du membre.");
    }

    client.db.all('SELECT * FROM Astroia WHERE owner = ?', [userId], async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des bots de l\'utilisateur :', err);
        return message.reply('Une erreur est survenue.');
      }

      if (rows.length === 0) {
        return message.reply("Ce membre n'a aucun bot.");
      }
      const userss = await client.users.cache.get(userId)
      const embed = new EmbedBuilder()
        .setTitle(`Bots de ${userss.tag}`)
        .setColor(client.color);

        let description = "";
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const bot = row.bot_id;
          const botUser = await client.users.fetch(bot);
          const tag = botUser.tag;
          const timestamp = Math.floor(row.temps / 1000);
          const timeRemaining = row.temps - Date.now();
          const seuilExpiration = 1000;
          const isExpired = timeRemaining < seuilExpiration;
          const expirationText = isExpired ? `<t:${timestamp}:R>` : `<t:${timestamp}:R>`;
          const etats = isExpired ? `❌ expiré` : `✅ actif`;
          description += `**${i + 1} -** [\`${tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot}&permissions=8&scope=bot%20applications.commands)\n**┖ Etat :** \`${etats}\`\n**┖ Expiration :** ${expirationText}\n\n`;
        }

      embed.setDescription(description);
      message.channel.send({ embeds: [embed] });
    });
  },
};
