const { exec } = require('child_process');

module.exports = {
    name: "startall",
    description: "Démarrer tous les bots",
    run: async (client, message, args, prefix) => {
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
          return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
        }
    
        exec(`pm2 start all`, async (err, stdout, stderr) => {
            message.reply("J'ai bien démarre tous les bots")
            if (err) {
                console.error('Erreur lors du démarrage du bot :', err);
                return message.reply('Une erreur est survenue.');
            }

        });
    }
}
