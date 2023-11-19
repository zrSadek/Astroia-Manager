const { exec } = require('child_process');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "repare",
  aliases: ['corrige'],
  description: "Répare le bot en installant les dépendances et en le redémarrant",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Vous n'êtes pas autorisé à réparer les bots", ephemeral: true });
    }  
    const botId = args[0];
    if (!botId) {
      return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}repare <id du bot>\``);
    }

    const botFolder = path.join('/home/bot', botId);
    if(!botFolder)return message.reply('Aucun bot trouver...')
    try {    

      const filesInFolder = await readdir(botFolder);
      if (!filesInFolder.includes('package.json')) {
        return message.reply("Le bot n'a pas de fichier package.json.");
      }

      await message.channel.send(`Réparation en cours pour le bot avec l'ID : \`${botId}\`...`);
      
      exec(`cd ${botFolder} && npm rebuild better-sqlite3 && npm i && pm2 restart ${botId}`, async (err, stdout, stderr) => {
        if (err) {
          console.error('Erreur lors de la réparation du bot :', err);
          return message.reply("Une erreur est survenue pendant la réparation.");
        }
        
        try {
          const userbot = await client.users.fetch(botId);
          const tag = userbot.tag;
          message.channel.send(`Le bot \`${tag}\` a été réparé et redémarré avec succès.`);
        } catch (error) {
          console.error("Erreur lors de la récupération des informations du bot :", error);
          return message.reply("Une erreur est survenue.");
        }
      });
    } catch (error) {
      console.error('Erreur lors de la vérification de la base de données :', error);
      return message.reply("Une erreur est survenue.");
    }
  },
};
