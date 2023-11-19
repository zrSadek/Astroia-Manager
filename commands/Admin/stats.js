const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: "stats",
    description: "Afficher les statistiques du bot",
    run: async (client, message, args, prefix) => {
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
            return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
        }

        client.db.get(`
      SELECT
        COUNT(DISTINCT owner) AS ownerCount,
        SUM(CASE WHEN bot_id NOT NULL THEN 1 ELSE 0 END) AS onlineCount,
        COUNT(*) AS totalBots,
        (SELECT COUNT(*) FROM GBL) AS blacklistCount
      FROM
        Astroia
    `, async (err, row) => {
            if (err) {
                console.error('Erreur lors de la récupération des statistiques :', err);
                return message.reply('Une erreur est survenue.');
            }

            const { ownerCount, totalBots, blacklistCount } = row;
            const response = await axios.get(`http://${client.config.api}/pseudonymCount`);
            const pseudonymCount = response.data.pseudonymCount;

            const embed = new EmbedBuilder()
                .setTitle("Statistiques des bots")
                .setColor(client.color)
                .addFields({ name: "Total de Propriétaires de bots", value: `\`\`\`yml\n${ownerCount} buyers\`\`\`` })
                .addFields({ name: "Total des Membres Prevname(s)", value: `\`\`\`yml\n${pseudonymCount.toString()} membres\`\`\`` })
                .addFields({ name: "Total de bots :", value: `\`\`\`yml\n${totalBots} bots en ligne\`\`\`` })
                .addFields({ name: "Total de personnes blacklistées :", value: `\`\`\`yml\n${blacklistCount} personnes\`\`\`` })
                .setFooter({ text: client.config.footer, iconURL: message.author.avatarURL() });

            message.channel.send({ embeds: [embed] });
        });
    },
};
