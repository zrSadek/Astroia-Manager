const axios = require('axios');

module.exports = {
    name: "gbl",
    description: "Permet de global blacklist de tous les bots",

    run: async (client, message, args, prefix) => {
        const isDeveloper =  client.config.developpeurs.includes(message.author.id);
        if (!isDeveloper) {
            return message.reply("Tu ne fais pas partie des développeurs !");
        }

        if (args.length < 2) {
            return message.reply("Utilisation : " + prefix + "gbl <user> <raison>");
        }

        const userToBlacklist = message.mentions.users.first() || await client.users.fetch(args[0]);
        if (!userToBlacklist) {
            return message.reply("Utilisation : " + prefix + "gbl <utilisateur> <raison>");
        }

        const author = message.author.id || "Aucune raison";
        const raison = args.slice(1).join(" ");
        
        try {
            client.db.run(
                'INSERT INTO GBL (gbl, raison, author) VALUES (?, ?, ?)',
                [userToBlacklist.id, raison, author]
            );
            
            message.reply(`${userToBlacklist.tag} a été global blacklist.`);
        } catch (error) {
            console.error("Erreur lors de l'ajout à la liste de blocage globale :", error.message);
            message.reply("Une erreur s'est produite.");
        }
    }
};
