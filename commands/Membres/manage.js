const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { exec } = require('child_process');
const ms = require('ms')
module.exports = {
  name: "manage",
  description: "Gérer vos bots",
  run: async (client, message, args, prefix) => {
    const userId = message.author.id;
    client.db.all('SELECT * FROM Astroia WHERE owner = ?', [userId], async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des bots de l\'utilisateur :', err);
        return message.reply('Une erreur est survenue.');
      }

      if (rows.length === 0) {
        return message.reply("Vous n'avez aucun bot.");
      }

      const bots = [];
      for (const row of rows) {
        const botId = row.bot_id;
        const botUser = await client.users.fetch(botId);
        bots.push({
          label: botUser.tag,
          value: botId
        });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('bot_select_' + message.id)
        .setPlaceholder('Sélectionnez un bot')
        .addOptions(bots);

      const row = new ActionRowBuilder()
        .addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setTitle('Manage')
        .setColor(client.color)
        .setDescription('Choisissez un bot.');


      let description = "";
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const bot = row.bot_id;
        const botUser = await client.users.fetch(bot);
        const tag = botUser.tag;
        const timestamp = Math.floor(row.temps / 1000);
        const timeRemaining = row.temps - Date.now();
        const seuilExpiration = 1000;
        const isExpired = timeRemaining < seuilExpiration;
        const expirationText = isExpired ? ` expiré <t:${timestamp}:R>` : `expire <t:${timestamp}:R>`;
        description += `**${i + 1} -** [\`${tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot}&permissions=8&scope=bot%20applications.commands) | ${expirationText}\n`;
      }
      embed.setDescription(description);
      message.channel.send({ embeds: [embed], components: [row] });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({ filter, time: ms('2m') });

      collector.on('collect', async (interaction) => {
        const selectedBot = interaction.values[0];
        exec('pm2 jlist', async (error, stdout) => {
          if (error) {
            console.error('Erreur lors de l\'exécution de la commande PM2 :', error);
            return interaction.reply({content: 'Une erreur est survenue.', ephemeral: true});
          }
          try {
            const pm2List = JSON.parse(stdout);
            const selectedBotProcess = pm2List.find((process) => process.name === selectedBot);

            if (selectedBotProcess) {
              const status = selectedBotProcess.pm2_env.status === 'online' ? '🟢 En ligne' : '🔴 Éteint';
        const isRunning = selectedBotProcess.pm2_env.status === 'online';
              const botid = await client.users.fetch(selectedBot);
              const botEmbed = new EmbedBuilder()
                .setTitle(`Manage de ${botid.username}`)
                .setColor(client.color)
                .setDescription(`État du bot : \`${status}\``)
              const actionRow = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                  .setCustomId('start_button_'+ message.id +'_'+ selectedBot)
                  .setLabel('Démarrer')
                  .setDisabled(isRunning ? true : false)
                  .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                  .setCustomId('restart_button_'+ message.id +'_' + selectedBot)
                  .setLabel('Redémarrer')
                  .setDisabled(isRunning ? false : true)
                  .setStyle(ButtonStyle.Danger),
                  new ButtonBuilder()
                    .setCustomId('stop_button_'+ message.id +'_' + selectedBot)
                    .setLabel('Stop')
                    .setDisabled(isRunning ? false : true)
                    .setStyle(ButtonStyle.Danger),
                  new ButtonBuilder()
                    .setCustomId('retour_button_'+ message.id)
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Secondary)
                );

              interaction.update({ embeds: [botEmbed], components: [actionRow] });
            } else {
              interaction.reply({content: `Erreur merci de contacter un administrateur !`, ephemeral: true});
            }

            const filter = (i) => (i.user.id === message.author.id) && (i.customId.startsWith(`start_button_${message.id}_`) || i.customId.startsWith(`restart_button_${message.id}_`) || i.customId.startsWith(`stop_button_${message.id}_`) ||  i.customId.startsWith(`retour_button_${message.id}`));
            const buttonCollector = interaction.channel.createMessageComponentCollector({ filter, time: ms('2m') });
    
            buttonCollector.on('collect', async (buttonInteraction) => {
              const customId = buttonInteraction.customId;
              const action = customId.split('_')[0];
              const botid = customId.split('_')[3]; 
              if (buttonInteraction.customId === `retour_button_${message.id}`) {
                buttonInteraction.update({ embeds: [embed], components: [row] });
              } 
              else if (action === 'start') {
                exec(`pm2 start ${botid}`, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Erreur lors du démarrage du Bot ${botid}`, error);
                  }
                })
                buttonInteraction.update({content: 'Le bot a été démarré avec succès.', components: [], embeds: []});
              } else if (action === 'restart') {
                exec(`pm2 restart ${botid}`, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Erreur lors du redémarrage du Bot ${botid}`, error);
                  }
                })
                buttonInteraction.update({content:'Le bot a été redémarré avec succès.', components: [], embeds: []});
              } else if (action === 'stop') {
                exec(`pm2 stop ${botid}`, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Erreur lors du stop du Bot ${botid}`, error);
                  }
                })
                buttonInteraction.update({content:'Le bot a été arrêté avec succès.', components: [], embeds: []});
              }
      
            
            });
          } catch (parseError) {
            console.error('Erreur lors du traitement de la réponse de PM2 :', parseError);
            interaction.reply({content: 'Une erreur est survenue.', ephemeral: true});
          }
        });
      });
    });
  },
};
