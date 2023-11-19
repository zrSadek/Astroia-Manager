
module.exports = {
  name: "modifbot",
  aliases: ['modbot'],
  description: "Modif un bot",
  run: async (client, message, args, prefix) => {
    const isDeveloper = client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Vous n'êtes pas autorisé à réparer les bots", ephemeral: true });
    }

    if (!args[0]) {
      return message.reply("Utilisation incorrecte.");
    }

    const subCommand = args[0].toLowerCase();
    const botId = args[1];
    const params = args.slice(2).join(' ');

    switch (subCommand) {
      case 'temps':
        const newDuration = params

        const botData = client.db.get('SELECT * FROM Astroia WHERE bot_id = ?', [botId]);
        if (!botData) {
          return message.reply("Ce bot n'existe pas sur la Astroia API.");
        }
        const parsedDuration = parseTime(newDuration) + Date.now();

        if (!parsedDuration) {
          return message.reply("Durée invalide (exemple : 10s).");
        }

        client.db.run('UPDATE Astroia SET temps = ? WHERE bot_id = ?', [parsedDuration, botId]);
        const timestamp = Math.floor(parsedDuration / 1000);
        message.reply(`Le bot \`${(await client.users.fetch(botId)).username}\` ça date d'expirations sera donc : <t:${timestamp}:R>.`);
        break;
      default:
        return message.reply("Sub-commande invalide par exemple 'temps'.");
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
