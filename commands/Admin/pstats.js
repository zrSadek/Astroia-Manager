const axios = require('axios')
module.exports = {
    name: "pstats",
    description: "Affiche les stats des prevnames",
    usage: "pstats",
    category: "Admin",
    userPerms: [],
    botPerms: [],
    cooldown: 0,
    guildOnly: false,
    maintenance: false,
    run: async (client, message, args, prefix) => {
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
          return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
        }
        try {
            const response = await axios.get(`http://${client.config.api}/pseudonymCount`);
            const pseudonymCount = response.data.pseudonymCount;
            message.reply({content: `J'ai enregistré \`${pseudonymCount.toString()}\` membres dans les prevnames !`, ephemeral: true})
          
          } catch (error) {
            console.error('Erreur lors de la récupération des statistiques des pseudonymes :', error);
            message.reply('Une erreur s\'est produite.');
          }

    }
}
