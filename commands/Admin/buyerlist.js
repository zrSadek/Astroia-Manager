const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "buyerlist",
  description: "Afficher la liste les tags des acheteurs de bots",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }
    client.db.all('SELECT DISTINCT owner FROM Astroia', async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        return message.reply('Une erreur est survenue.');
      }

      const buyersTags = await Promise.all(rows.map(async (row, index) => `${index + 1} - TAG : ${await client.users.fetch(row.owner).then(user => user.tag).catch(() => 'Utilisateur introuvable')} (Id: ${row.owner})`));

      const embed = new EmbedBuilder()
        .setTitle('Tous les buyers')
        .setColor(client.color)
        .setDescription(`\`\`\`yml\n${buyersTags.join('\n')}\`\`\``)
      message.channel.send({ embeds: [embed] });
    });
  },
};
