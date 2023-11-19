const { exec } = require('child_process');
const Discord = require('discord.js');
const fs = require('fs-extra');

module.exports = {
  name: "create",
  description: "Crée un bot perso",
  run: async (client, message, args, prefix) => {
    const token = args[0];
    const cle = args[1];
    try {
      if (!token || !cle) {
        return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}create <token> <clé>\``);
      }

      const bot = new Discord.Client({ intents: [377744] });

      await bot.login(token).catch((err) => {
        console.error(`Création du bot de ${message.author.username}, Erreur: Token invalide !`);
          message.channel.send('`❌` Votre token est invalide !')
          return;
      });

        const botId = bot.user.id;
        const botTag =  bot.user.tag
      const owner = message.author;
      const temps = '30d';
      const parsedTime = parseTime(temps);
      if (!parsedTime) {
        console.log('Format incorrecte');
        return;
      }
      const expirationDate = Date.now() + parsedTime;

      let storedCles;
      try {
        storedCles = fs.readFileSync('Clée.txt', 'utf8').trim().split("\n").map((line) => line.trim());
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier Clees.txt :", error);
        return message.channel.send("Une erreur s'est produite.");
      }

      if (!storedCles || storedCles.length === 0) {
        return message.channel.send("Aucune clé n'a été trouvée.");
      }

      if (!storedCles.includes(cle)) {
        return message.channel.send("`❌` Clé invalide.");
      }
      const index = storedCles.indexOf(cle);
      if (index > -1) {
        storedCles.splice(index, 1);
      }

        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);


        await client.channels.cache.get(client.config.clee).send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle('Activation d\'une clée')
                    .setTimestamp()
                    .setThumbnail(message.author.avatarURL())
                    .setColor(client.color)
                    .addFields({ name: 'Action', value: `\`Création d'un bot\``, inline: false })
                    .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
                    .addFields({ name: 'Activeur', value: `[\`${message.author.username}\`](https://discord.com/users/${message.author.id}) - ([\`${message.author.id}\`](https://discord.com/users/${message.author.id}))`, inline: false })
                    .addFields({ name: 'Clée', value: `\`${cle}\`` })
                    .addFields({ name: 'Bot Name', value: `[\`${botTag}\`](${await bot.generateInvite({ scopes: ['applications.commands', 'bot'] }) }) - [\`Invite Bot\`](${await bot.generateInvite({ scopes: ['applications.commands', 'bot'] })})` })
                    .addFields({ name: 'Date', value: `<t:${timestamp}:R>`, inline: false })
            ]
        })

      fs.writeFileSync('Clée.txt', storedCles.join('\n'), 'utf8');
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

          exec(`cd ${folderPath} && npm i && pm2 start index.js --name ${botId}`, async (err, stdout, stderr) => {
            if (err) {
              console.error('Erreur lors de l\'installation des dépendances :', err);
               message.reply('Une erreur est survenue lors de l\'installation des dépendances.');
            }

            console.log('Dépendances installées avec succès.');
            console.log('Bot démarré avec succès.');

            message.channel.send("Configuration et installation terminé, lancement du bot...");
            message.channel.send("Le bot va démarrer dans quelques secondes...");

            client.db.run(
              'INSERT INTO Astroia (bot_id, owner, temps) VALUES (?, ?, ?)',
              [botId, owner.id, expirationDate]
            );

            client.db.run(
              'INSERT INTO clee (clee, bot_id, author, timetamps) VALUES (?, ?, ?, ?)',
              [cle, botId, message.author.id, Date.now()]
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
