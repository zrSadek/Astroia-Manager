const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const { Readable } = require('stream');
const { exec } = require('child_process');
const ms = require('ms');
module.exports = {
  name: "botdossier",
  description: "Affiche le contenu du dossier du bot en fonction de l'ID",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    const botId = args[0];
    if (!botId) {
      return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}botdossier <id du bot>\``);
    }

    const botFolder = path.join('/home/bot', botId);
    
    try {

      const filesInFolder = await readdir(botFolder);

      if (filesInFolder.length === 0) {
        return message.reply("Le dossier du bot est vide.");
      }

      const fileCategories = {
        dossiers: [],
        fichiers: []
      };

      for (const fileName of filesInFolder) {
        const filePath = path.join(botFolder, fileName);
        const fileStats = await promisify(require('fs').stat)(filePath);
        
        if (fileStats.isDirectory()) {
          fileCategories.dossiers.push(`📁 ${fileName}`);
        } else {
          fileCategories.fichiers.push(`📄 ${fileName}`);
        }
      }
      const ui = await client.users.fetch(botId);
      const embed = new EmbedBuilder()
        .setTitle(`Dossier de ${ui.tag}`)
        .setDescription(`\`\`\`yml\n${fileCategories.dossiers.join('\n') || 'Aucun dossier trouvé.'}\n${fileCategories.fichiers.join('\n') || 'Aucun fichier trouvé.'}\`\`\``)
        .setColor(client.color);

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('botdossier_' + message.id)
        .setMaxValues(1)
        .setPlaceholder('Sélectionnez une action')
        .addOptions([
          {
            label: 'Console',
            value: 'console_' + message.id
          }
        ])
      );

      message.channel.send({ embeds: [embed], components: [row] });

      const collector = message.channel.createMessageComponentCollector({ filter: m => m.user.id === message.author.id, time: ms("2m") });
      
      collector.on('collect', async interaction => {
        if (interaction.customId === 'botdossier_' + message.id && interaction.isSelectMenu()) {
          const selectedValue = interaction.values[0];
          if (selectedValue.startsWith('console_')) {
            try {
              const childProcess = await exec('pm2 logs ' + botId);
              const stdoutStream = childProcess.stdout;
                    const consoleLines = [];
                    const readableStream = new Readable({
                read(size) {
                  const chunk = stdoutStream.read(size);
                  if (chunk !== null) {
                    consoleLines.push(chunk.toString());
                  }
                },
              });
      
              await new Promise(resolve => {
                readableStream.on('end', resolve);
                readableStream.resume();
              });
      
                const consoleOutput = consoleLines.join('\n');
      
              const consoleEmbed = new EmbedBuilder()
                .setTitle('Console en Direct')
                .setColor(client.color)
                .setDescription('```\n' + consoleOutput + '\n```');
      
              await interaction.reply({ embeds: [consoleEmbed] });
            } catch (error) {
              console.error('Erreur lors de la récupération des logs de la console :', error);
              await interaction.reply('Une erreur est survenue lors de la récupération des logs de la console.');
            }
          }
        }
      });
      
      
      collector.on('end', collected => {
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du dossier du bot :', error);
      return message.reply("Une erreur est survenue.");
    }
  },
};