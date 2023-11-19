const { EmbedBuilder } = require('discord.js');
const fs = require('fs')
module.exports = {
  name: "addtime",
  aliases: ['add'],
  description: "Ajouter du temps d'un bot",
  run: async (client, message, args, prefix) => {
    if (!args[0]) {
        return message.reply("Merci de fournir l'id du bot auquel vous souhaitez ajouter du temps.");
    }
    const temps = '30d';
    const cle = args[1];
    const parsedTime = parseTime(temps);
    const botId = args[0];
    client.db.get('SELECT * FROM Astroia WHERE bot_id = ?', [botId], async (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération du bot :', err);
        return message.reply('Une erreur est survenue.');
      }

      if (!row) {
        return message.reply("Ce bot n'existe pas sur la Astroia API.");
      }
 

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

  fs.writeFileSync('Clée.txt', storedCles.join('\n'), 'utf8');

      const currentExpirationTime = parseInt(row.temps);

      if (isNaN(currentExpirationTime)) {
        return message.reply("Une erreur avec le temps vient d'arriver...");
      }

      const newExpirationTime = currentExpirationTime + parsedTime;

      client.db.run('UPDATE Astroia SET temps = ? WHERE bot_id = ?', [newExpirationTime, botId], (updateErr) => {
        if (updateErr) {
          console.error('Erreur lors de la mise à jour du temps du bot :', updateErr);
          return message.reply('Une erreur est survenue.');
        }

        message.reply(`Temps ajouté.`);
        client.db.run(
          'INSERT INTO clee (clee, bot_id, author, timetamps) VALUES (?, ?, ?, ?)',
          [cle, botId, message.author.id, Date.now()]
          );
      });
    });
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
  