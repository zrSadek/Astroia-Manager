const fs = require('fs-extra');

module.exports = {
  name: "drop",
  description: "Drop une clée",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    try {
        let storedKeys;
        try {
          storedKeys = fs.readFileSync('Clée.txt', 'utf8').trim().split("\n").map((line) => line.trim());
        } catch (error) {
          console.error("Erreur lors de la lecture du fichier Cles.txt :", error);
          return message.channel.send("Une erreur s'est produite.");
        }
  
        if (!storedKeys || storedKeys.length === 0) {
          return message.channel.send("Aucune clé n'a été trouvée.");
        }
        const lastKey = storedKeys[storedKeys.length - 1];
  
        message.reply(`Voici une clée : \`${lastKey}\`.`);
      } catch (error) {
        console.error("Erreur lors de la récupération de la dernière clé :", error);
        message.channel.send("Une erreur est survenue.");
      }
    },
  };
