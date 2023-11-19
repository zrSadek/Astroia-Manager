const { exec } = require('child_process');

module.exports = {
    name: "start",
    description: "Démarrer un bot",
    run: async (client, message, args, prefix) => {
        const botId = args[0];
        if (!botId) {
            return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}start <id du bot>\``);
        }
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
            client.db.get(
                'SELECT * FROM Astroia WHERE owner = ? AND bot_id = ?',
                [message.author.id, botId],
                (err, row) => {
                    if (err) {
                        console.error('Erreur lors de la vérification de la base de données :', err);
                        return message.reply('Une erreur est survenue lors de la vérification de la base de données.');
                    }

                    if (!row) {
                        return message.reply("Vous n'êtes pas autorisé à démarrer ce bot.");
                    }
                    startBot(client, botId, message);

                }
            );
        } else {
            startBot(client, botId, message);

        }
    },
};

function startBot(client, botId, message) {
    exec(`pm2 start ${botId}`, async (err, stdout, stderr) => {
        if (err) {
            console.error('Erreur lors du démarrage du bot :', err);
            return message.reply('Une erreur est survenue.');
        }
        try {
            const userbot = await client.users.fetch(botId);
            const tag = userbot.tag;
            message.channel.send(`Le bot \`${tag}\` a été démarré avec succès.`);
        } catch (error) {
            console.error("Erreur lors de la récupération des informations du bot :", error);
            return message.reply("Une erreur est survenue.");
        }
    });
}
