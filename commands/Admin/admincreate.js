const { exec } = require('child_process');
const Discord = require('discord.js');
const fs = require('fs-extra');

module.exports = {
  name: "admincreate",
  description: "Crée un bot perso",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }
    const token = args[0];
    const owners = message.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]) : null) || message.author;
    if (!owners) {
      return message.channel.send('Utilisateur inconnu !');
    }
    
     try {
      if (!token || !owners) {
        return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}create <token> <owner>\``);
      }

      const bot = new Discord.Client({ intents: [377744] });

      await bot.login(token).catch((err) => {
        console.error(`Création du bot de ${message.author.username}, Erreur: Token invalide !`);
        message.channel.send('`❌` Votre token est invalide !');
        return;
      });



      const botId = bot.user.id;
      const owner = owners;
      const temps = '30d';
      const parsedTime = parseTime(temps);
      if (!parsedTime) {
        console.log('Format incorrecte');
        return;
      }
      const expirationDate = Date.now() + parsedTime;

   
      message.channel.send("Création du bot en cours...");

      const folderPath = `/home/bot/${botId}`;

      exec(`mkdir ${folderPath}`, async (error, stdout, stderr) => {
        if (error) {
          console.error('Erreur lors de la création du dossier :', error);
          return message.reply('Une erreur est survenue lors de la création du dossier.');
        }

        message.channel.send("Mise en place des dossiers...");

        fs.copy('/home/Update', folderPath, async (err) => {
          if (err) {
            console.error('Erreur lors de la copie des fichiers :', err);
            return message.reply('Une erreur est survenue lors de la copie des fichiers.');
          }

          message.channel.send("Décompression des fichiers...");

          const configFolderPath = `${folderPath}/config`;
          fs.mkdirSync(configFolderPath);

          const botData = {
            token: token,
            bot_id: botId,
            buyers: [owner.id],
            prefix: "+",
            panel: client.config.api,
            default_color: "#5a65ff",
          };

          const botDataFilePath = `${configFolderPath}/config.js`;
          fs.writeFileSync(botDataFilePath, `module.exports = ${JSON.stringify(botData, null, 2)};`);

          exec(`cd ${folderPath} && npm i && npm rebuild better-sqlite3 && pm2 start index.js --name ${botId}`, async (err, stdout, stderr) => {
            if (err) {
              console.error('Erreur lors de l\'installation des dépendances :', err);
               message.reply('Une erreur est survenue lors de l\'installation des dépendances.');
            }

            message.channel.send('Dépendances installées avec succès.');
            console.log('Bot démarré avec succès.');
            message.channel.send("Le bot va démarrer dans quelques secondes...");

            client.db.run(
              'INSERT INTO Astroia (bot_id, owner, temps) VALUES (?, ?, ?)',
              [botId, owner.id, expirationDate]
            );
          });
        });
      });
    } catch (error) {
      console.error("Erreur lors de la création du bot :", error);
      console.log('Une erreur est survenue lors de la création du bot.');
    }
  },
};
function parseTime(timeString) {
  const regex = /(\d+)([smhdwy])/;
  const match = timeString.match(regex);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000;
    case 'y':
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}
