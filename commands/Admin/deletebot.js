const { MessageEmbed } = require('discord.js');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  name: "deletebot",
  description: "Supprime un bot de la base de données et son dossier",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    const botId = args[0];
    if (!botId) {
      return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}deletebot <id du bot>\``);
    }

    try {
      await client.db.run('DELETE FROM Astroia WHERE bot_id = ?', [botId]);

      const botFolder = path.join('/home/bot', botId);

      exec(`pm2 delete ${botId} && rm -r ${botFolder}`, async (err, stdout, stderr) => {
        if (err) {
          console.error('Erreur lors du redémarrage du bot :', err);
          return message.reply("Une erreur est survenue.");
        }
        const botUser = await client.users.fetch(botId);
        message.reply(`Le bot ${botUser.tag} a été supprimé.`);
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du bot :', error);
      return message.reply("Une erreur est survenue.");
    }
  },
};
