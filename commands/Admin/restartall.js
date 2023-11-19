const { exec } = require('child_process');

module.exports = {
    name: "restartall",
    description: "Restart tous les bots",
    run: async (client, message, args, prefix) => {
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
          return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
        }
    
        try { 
        message.reply("J'ai bien redémarre tous les bots")
        exec(`pm2 restart all`, async (err, stdout, stderr) => {
            if (err) {
                console.error('Erreur lors du démarrage du bot :', err);
                return message.reply('Une erreur est survenue.');
            }

        });
    } catch (error) {
    console.log(error)    
    return message.reply('Une erreur est survenue.'); 
    }
    }
}
