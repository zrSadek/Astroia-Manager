const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "gblist",
    description: "Affiche les globale blacklist",

    run: async (client, message, args, prefix) => {
        const isDeveloper = client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
            return message.reply({ content: "Tu ne fais pas partie des d�veloppeurs !", ephemeral: true });
        }
        const query = 'SELECT gbl, raison, author FROM GBL';
        client.db.all(query, [], async (err, rows) => {
            if (err) {
                console.error("Erreur lors de la r�cup�ration de la liste noire :", err.message);
                return message.reply("Une erreur s'est produite.");
            } else {
                if (rows.length === 0) {
                    return message.reply("Aucun Global BlackList...");
                } else {
                    const promises = rows.map(async (row, index) => {
                        const user = await client.users.fetch(row.gbl);
                        return `[ ${index + 1} ] ${user.username} - (${row.raison})`;
                    });

                    const results = await Promise.all(promises);

                    const embed = new EmbedBuilder()
                        .setTitle("Liste blacklist globale")
                        .setColor(client.color)
                        .setDescription(`\`\`\`yml\n${results.join('\n')}\`\`\``);

                    message.channel.send({ embeds: [embed] });
                }
            }
        });
    }
};
