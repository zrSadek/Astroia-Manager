const fs = require('fs');
const { exec } = require('child_process');
module.exports = {
  name: "repareall",
  description: "Repare all",
  run: async (client, message, args, prefix) => {
    const isDeveloper = client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    console.log('Debut')
    const directoryPath = '/home/bot';

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Erreur :', err);
        return;
      }

      files.forEach((file) => {
        const filePath = `${directoryPath}/${file}`;

        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            console.error('Erreur :', statErr);
            return;
          }

          if (stats.isDirectory()) {
            exec(`pm2 delete ${file} && cd /home/Update && cp -r * /home/bot/${file} && cd /home/bot/${file} && npm i && pm2 start index.js --name ${file}`, (execErr, stdout, stderr) => {
              if (execErr) {
                console.error('Erreur lors de l\'exécution de la commande :', execErr);
              } else {
                console.log(`Bot répare dossier :` + stdout);
              }
            });
          }
        });
      });
    });


  }
}