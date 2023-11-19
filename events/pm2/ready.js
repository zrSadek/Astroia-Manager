const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('colors');
const ms = require('ms');

module.exports = async (client) => {
  /* 
  exec('pm2 resurrect', (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur lors de la restauration :'.red, error);
    } else {
      console.log('Sauvegarde PM2 restaurée avec succès'.cyan);
    }
  });

  exec(`pm2 save`);

  setInterval(() => {
    try {
      exec('pm2 jlist', async (error, stdout) => {
        if (error) {
          console.error('Erreur lors de la récupération de la liste PM2 :', error);
          return;
        }

        const pm2List = JSON.parse(stdout);

        client.db.all('SELECT * FROM Astroia', async (err, rows) => {
          if (err) {
            console.error('Erreur lors de la récupération des bots de l\'utilisateur :', err);
            return;
          }

          if (rows.length === 0) {
            return;
          }

          for (const row of rows) {
            const botId = row.bot_id;
            const timestamp = Math.floor(row.temps / 1000);
            const timeRemaining = row.temps - Date.now();
            const seuilExpiration = 1000;
            const isExpired = timeRemaining < seuilExpiration;

            if (isExpired) {
              const selectedBotProcess = pm2List.find((process) => process.name === botId);

              if (selectedBotProcess && selectedBotProcess.pm2_env.status === 'online') {
                exec('pm2 stop ' + botId, async (error, stdout) => {
                  if (error) {
                    console.error('Erreur :', error);
                    return;
                  }
                  const botusername = (await client.users.fetch(botId)).username
                  const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle('Bot Expiré')
                    .setDescription(`\`${botusername}\` vient d'expirer, la date d'expiration est <t:${timestamp}:R>`)
                    .setFooter({ text: client.config.footer })
                    console.log(`${botusername} vient d'expirer`)
                  client.channels.cache.get('1151919031020953614').send({ embeds: [embed] });
                })
              }
            }
          }
        });
      });
    } catch (err) {
      console.error('Erreur :', err);
    }
  }, ms('1s'))*/
}