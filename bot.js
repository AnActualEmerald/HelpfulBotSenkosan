var Discord = require("discord.js");
var fs = require("fs");
var Winston = require("winston");

//file locations
const configFile = "./config.json";
const usersFile = "./users.json";

var config = require(configFile);
var ccF = require(ccFile);

//logging format
const myFormat = Winston.format.printf(
    ({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    }
);

//other variables
var starredMsgs = require(starFile);

//create bot
var bot = new Discord.Client();

//bot methods
bot.JSONtoCollection = JSONtoCollection;
bot.updateJSON = updateJSON;
bot.loadCmds = loadCmds;

//initialize bot
bot.prefix = config.prefix;
bot.auth = config.token;

//set up logging
bot.logger = Winston.createLogger({
    level: config.winston_lvl,
    format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.prettyPrint(),
        Winston.format.label({ label: "logging" }),
        myFormat
    ),
    transports: [
        new Winston.transports.Console(),
        new Winston.transports.File({ filename: "info.log" }),
        new Winston.transports.File({
            filename: "debug_garbage.log",
            level: "silly"
        })
    ]
});

var netLog = Winston.createLogger({
    format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.prettyPrint(),
        Winston.format.label({ label: "network" }),
        myFormat
    ),
    transports: [new Winston.transports.File({ filename: "network.log" })]
});

//a little snippet taken from stack exchange (thanks Mateusz Moska)
String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${this}\`;`)(...vals);
};

bot.on("ready", () => {
    loadCmds();

    bot.logger.info("Bot start");

    bot.user.setActivity(bot.globalVar.activity);
});

//emojis
var thumbsdown = "👎";
//end emojis

bot.on("message", message => {
    if (message.channel.type === "dm") {
        return handleDM(message);
    }

    if (message.author.bot) return;

    //listen for commands starting with the prefix
    if (message.content.startsWith(bot.prefix)) {
        bot.logger.info("Command string: " + message.content);

        const args = message.content.slice(bot.prefix.length).split(/ +/);
        const cmdName = args.shift().toLowerCase();

        bot.logger.debug(args);

        const com =
            bot.commands.get(cmdName) ||
            bot.commands.find(cmd => cmd.alias && cmd.alias.includes(cmdName));

        if (!com) {
            return bot.logger.debug(`No command ${cmdName} found`);
        }
        if (com.cooldown) {
            if (bot.coolDowns.get(message.member.id) == com.name) {
                message.reply("You're doing that too much");
                return;
            } else {
                bot.coolDowns.set(message.member.id, com.name);
                setTimeout(function() {
                    bot.coolDowns.delete(message.member.id);
                }, com.cooldown);
            }
        }

        //check perms
        var perms = [true];
        if (com.perms) {
            perms = com.perms.map(val => {
                console.log(val);
                if (val === "OWNER") {
                    if (message.author.id != 198606745034031104) {
                        //change this if you cloned this bot
                        message.reply(
                            "You don't have permission to use this command"
                        );
                        return false;
                    } else return true;
                } else {
                    return message.member.hasPermission(val, false, true, true);
                }
            });
        }

        try {
            if (perms.includes(true)) {
                com.execute(message, args, bot);
            } else {
                message.reply("You don't have permission to use that command");
            }
        } catch (e) {
            bot.logger.error(e);
            if (config.debug)
                message.channel.send("Had trouble with that command");
        }
    }
});

bot.on("disconnect", event => {
    bot.logger.error("Websocket disconnected, code: " + event.code);
    bot.logger.error(event.reason);
    //bot.destroy();
    //bot.login(config.token);
});

bot.on("resume", replayed => {
    //may not be necessary but I'm going to do this anyways
    bot.logger.warn("Resuming bot");
    bot.user.setActivity(bot.globalVar.activity);
});

//logging stuff
bot.on("debug", info => {
    netLog.info(info); //only logs to the network.log file
    bot.logger.verbose(info);
});

bot.on("warn", info => {
    bot.logger.warn(info);
});

bot.on("error", info => {
    bot.logger.error(info);
});

//functions

function updateJSON(fileName, data, cooked) {
    if (!cooked) {
        data = JSON.stringify(data);
    }

    fs.writeFile(fileName, data, function(err) {
        if (err) {
            bot.logger.error("Error saving to JSON file");
            bot.logger.error(fileName);
            bot.logger.error(err);
        }
    });
}

function loadCmds(message) {
    const commandFiles = fs
        .readdirSync("./commands")
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        try {
            delete require.cache[require.resolve(`./commands/${file}`)];
            const command = require(`./commands/${file}`);
            bot.commands.set(command.name, command);
        } catch (e) {
            bot.logger.error(e);
            if (message)
                message.channel.send(`There was an error with loading ${file}`);
        }
    }

    delete require.cache[require.resolve(ccFile)];
    ccF = require(ccFile);

    bot.customComs = bot.JSONtoCollection(ccF);
}

function handleDM(message) {
    //do something here
}

bot.login(config.token);
