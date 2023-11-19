const os = require('os');
const pidusage = require('pidusage');
const Discord = require('discord.js')
module.exports = {
  name: "vps",
  description: "Affiche les inforamation du vps",
  run: async (client, message, args, prefix) => {
    const isDeveloper =  client.config.developpeurs.includes(message.author.id);
    if (!isDeveloper) {
      return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }

    const totalMemory = formatBytes(os.totalmem());
    const freeMemory = formatBytes(os.freemem());
    const usedMemory = formatBytes(os.totalmem() - os.freemem());
    const memoryPercent = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2);
    const cpuInfo = os.cpus();
    const cpuUsage = await pidusage(process.pid);
    const cpuPercent = cpuUsage.cpu.toFixed(2);

    const uptime = formatUptime(os.uptime());
    const hostName = os.hostname();
    const platformVersion = os.release();
    const embed = new Discord.EmbedBuilder()
      .setTitle(`Information du vps`)
      .setColor(client.color)
      .setDescription(`
┖ **Plateforme :** \`${os.platform()}\` 
┖ **Architecture :** \`${os.arch()}\`
┖ **Os Version :** \`${platformVersion}\`
┖ **CPU :** \`${os.cpus()[0].model}\`
┖ **Utilisation du CPU :** \`${cpuPercent}%\` / \`100%\`
┖ **Nombre de cœurs :** \`${cpuInfo.length}\`
┖ **Mémoire :** \`${usedMemory}\` / \`${totalMemory}\`
┖ **Mémoire Totale :** \`${totalMemory}\`
┖ **Mémoire Libre :** \`${freeMemory}\`
┖ **Pourcentage de mémoire utilisée :** \`${memoryPercent}%\`
┖ **Nom d'hôte :** \`${hostName}\`
┖ **Uptime :** \`${uptime}\`
`)
      .setFooter({ text: client.config.footer, iconURL: message.author.avatarURL() })

    return message.channel.send({ embeds: [embed] })
  }
}

function formatBytes(bytes) {
  const units = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / (60 * 60)) % 24);
  const days = Math.floor(uptime / (60 * 60 * 24));

  let formattedUptime = '';
  if (days > 0) formattedUptime += `${days} jour(s), `;
  if (hours > 0) formattedUptime += `${hours} heure(s), `;
  if (minutes > 0) formattedUptime += `${minutes} minute(s)`;
  if (seconds > 0) formattedUptime += `${seconds} seconde(s)`;

  return formattedUptime;
}