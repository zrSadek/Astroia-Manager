const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require('discord.js')
const { readdirSync } = require('fs')
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
require('colors')
const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.GuildMember,
      Partials.User,
      Partials.Reaction,
      Partials.ThreadMember,
    ],
})
let DATABASE = 'Astroia.db'
const db = new sqlite3.Database(DATABASE);

db.run(
  'CREATE TABLE IF NOT EXISTS Astroia (owner TEXT, bot_id TEXT, temps TEXT)',
  function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Table".blue + " >> " + `Astroia`.red + ` bdd chargée avec succès`.green)
    }
  }
);

db.run(
  'CREATE TABLE IF NOT EXISTS clee (clee TEXT, bot_id TEXT, author TEXT, timetamps TEXT)',
  function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Table".blue + " >> " + `Clée`.red + ` bdd chargée avec succès`.green)
    }
  }
);

db.run(
  'CREATE TABLE IF NOT EXISTS GBL (gbl TEXT, raison TEXT, author TEXT)',
  function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Table".blue + " >> " + `GBL`.red + ` bdd chargée avec succès`.green)
    }
  }
);

client.config = require("./config.json")
client.commands = new Collection()
client.aliases = new Collection()
client.db = db
client.color = 0xFFFFFF
client.login(client.config.token || process.env.token)
const loadCommands = (dir = "./commands/") => {
    readdirSync(dir).forEach(dirs => {
      const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
  
      for (const file of commands) {
        const getFileName = require(`${dir}/${dirs}/${file}`);
        client.commands.set(getFileName.name, getFileName);
     console.log("System".blue + " >> " + `commande `.green + `${getFileName.name}`.red+ ` chargé `.green)
  };
    });
  };
  const loadEvents = (dir = "./events/") => {
    readdirSync(dir).forEach(dirs => {
      const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
  
      for (const event of events) {
        const evt = require(`${dir}/${dirs}/${event}`);
        const evtName = event.split(".")[0];
        client.on(evtName, evt.bind(null, client));
        console.log("System".blue + " >> " + `event `.green +  evtName.red + ` chargé`.green)
      };
    });
  };

loadEvents();
loadCommands();


app.use(express.json());

app.listen(3000, () => {
});
app.post("/api/start", async (req, res) => {
  try {
      const botId = req.body.bot;
      const connectionChannel = client.channels.cache.get(client.config.connection);
      if (connectionChannel) {
          const botUser = await client.users.fetch(botId);
          
          const embed1 = new EmbedBuilder()
              .setColor(client.color)
              .setTitle("**Connection au Astroia Gateway**")
              .setTimestamp();
              
          const embed2 = new EmbedBuilder()
              .setColor(client.color)
              .setTitle("**Connection d'un bot**")
              .setDescription(`\`${botUser.tag}\` (ID: \`${botUser.id}\`) vient de se connecter au système.`)
              .setTimestamp();
          
          connectionChannel.send({ embeds: [embed1] });
          connectionChannel.send({ embeds: [embed2] });
      }

      res.status(200).send("Accès au serveur autorisé.");
  } catch (error) {
      console.error("API Error:", error);
      res.status(500).send("Une erreur vient de se produire...");
  }
});

app.post("/api/gbl", async (req, res) => {
  try {
      const query = 'SELECT * FROM gbl';
      db.all(query, [], async (err, rows) => {
          if (err) {
              console.error('Erreur lors de la récupération des données :', err);
              res.status(500).send('Erreur lors de la récupération des données');
              return;
          }

          if (rows.length === 0) {
              res.status(404).send('Aucune donnée');
              return;
          }
          res.json({ gbl: rows });
      });
  } catch (error) {
      console.error('Erreur lors du traitement de la requête :', error);
      res.status(400).send('Requête incorrecte');
  }
});
app.post("/api/expire", async (req, res) => {
  try {
    const bot = req.body.bot;
    console.log(bot);

    const query = 'SELECT * FROM Astroia WHERE bot_id = ?';
    db.all(query, [bot], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des données :', err);
        res.status(500).send('Erreur lors de la récupération des données');
        return;
      }

      if (rows.length === 0) {
        res.status(404).send('Bot inconnu');
        return;
      }
      res.json(rows[0].temps);
    });
  } catch (error) {
    console.error('Erreur lors du traitement de la requête :', error);
    res.status(400).send('Requête incorrecte');
  }
});




app.get('/api/bots/:owner_id', (req, res) => {
  const { owner_id } = req.params
  db.all('SELECT * FROM Astroia WHERE owner = ?', [owner_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
    }

    if (!rows || rows.length === 0) {
      return res.json('aucun bot');
    }

    return res.json(rows);
  });
});

/*
process.on("unhandledRejection", (reason, p) => {

});
process.on("uncaughtException", (err, origin) => {

});
process.on("uncaughtExceptionMonitor", (err, origin) => {
 
});
process.on("multipleResolves", (type, promise, reason) => {
 
});
*/