const Discord = require('discord.js')
module.exports = {
    name: "cleeinfo",
    description: "Affiche les infos d'une clé selon si elle est déjà utilisée",
    run: async (client, message, args, prefix) => {
        const isDeveloper = client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
            return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
        }

        const cleeRecherchee = args[0]; 

        client.db.get('SELECT * FROM clee WHERE clee = ?', [cleeRecherchee], async (err, row) => {
            if (err) {
                console.error(err);
                return message.reply({ content: "Une erreur s'est produite.", ephemeral: true });
            }

            if (row) {
                const embed = {
                    color: client.color,
                    title: 'Informations sur la clé `2Sr6VwcyQcBkjevRNCFk5auP9IWGfm`',
                    fields: [
                      {
                        name: 'Bot ID',
                        value: `[\`${(await client.users.fetch(row.bot_id)).username}\`](https://discord.com/users/${row.bot_id}) (\`${row.bot_id}\`)`
                      },
                      {
                        name: 'Auteur',
                        value: `[\`${(await client.users.fetch(row.author)).username}\`](https://discord.com/users/${row.author}) (\`${row.author}\`)`
                      },
                      { name: 'Timestamps', value: `<t:${Math.floor(row.timetamps / 1000)}:R>` }
                    ]
                  }
            return message.reply({ embeds: [embed] });
            } else {
                return message.reply(`La clé \`${cleeRecherchee}\` n'a pas été trouvée ou elle n'est pas utilisée.`);
            }
        });
    }
}
