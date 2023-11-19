const { EmbedBuilder } = require("discord.js");
const config = require('../../config.json');
module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (message.channel.type === 0 || message.channel.type === 1) {
        let prefix = config.prefix;
        if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`)) !== null) {
            return message.channel.send({ content: `Mon prefix sur ce serveur est : \`${prefix}\`` })
        }

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        const [, matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();


        let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return undefined
        if (command) command.run(client, message, args, prefix);
    }
}