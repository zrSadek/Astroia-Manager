const ms = require('ms');

module.exports = async (client) => {
  const buyerRoleId = client.config.roleclient;
  const interval = ms('1s');
  const guildId = '1091767887766757426';
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.error(`Le serveur avec l'ID ${guildId} n'a pas été trouvé.`);
    return;
  }

  setInterval(async () => {
    try {
      const membersWithBuyerRole = await guild.members.fetch();
      const rows = client.db.all('SELECT DISTINCT owner FROM Astroia', async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques :', err);
        return message.reply('Une erreur est survenue.');
      }


      for (const row of rows) {
        const ownerId = row.owner;
        const member = membersWithBuyerRole.get(ownerId);

        if (member) {
  
          const buyerRole = guild.roles.cache.get(buyerRoleId);

          if (buyerRole) {
            if (!member.roles.cache.has(buyerRoleId)) {
              await member.roles.add(buyerRole);
              console.log(`Rôle client ajouté à ${member.user.tag}`);
            }
          }
        }
      }})
    } catch (error) {
      console.error('Une erreur s\'est produite :', error);
    }
  }, interval);
};
