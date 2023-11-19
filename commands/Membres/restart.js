const { exec } = require('child_process');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "restart",
  description: "Redémarrer un bot",
  run: async (client, message, args, prefix) => {
    const botId = args[0];
    if (!botId) {
      return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}restart <id du bot>\``);
    }
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      client.db.get(
        'SELECT * FROM Astroia WHERE owner = ? AND bot_id = ?',
        [message.author.id, botId],
        (err, row) => {
          if (err) {
            console.error('Erreur lors de la vérification de la base de données :', err);
            return message.reply("Une erreur est survenue.");
        }

          if (!row) {
            return message.reply("Vous n'êtes pas autorisé à redémarrer ce bot.");
          }
          restartBot(client, botId, message);
        }
      );
    } else {
      restartBot(client, botId, message);
    }
  },
};

function restartBot(client, botId, message) {
  exec(`pm2 restart ${botId}`, async (err, stdout, stderr) => {
    if (err) {
      console.error('Erreur lors du redémarrage du bot :', err);
      return message.reply("Une erreur est survenue.");
    }
    try {
      const userbot = await client.users.fetch(botId);
      const tag = userbot.tag;
      message.channel.send(`Le bot \`${tag}\` a été redémarré avec succès.`);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du bot :", error);
      return message.reply("Une erreur est survenue.");
    }
  });
}
