module.exports = {
    name: 'setwelcomechannel',
    alias: ['setwc'],
    args: false,
    description: 'Sets where the channel that the bot sends welcome messages to',
    usage: '',
    cooldown: 1500,
    execute(message, args, bot){
        var guildName = message.member.guild.id;
        bot.myGuilds[guildName].welcomeChannel = message.channel;
        message.channel.send(`Welcome messages will now be sent to ${message.channel.name}`)
            .then(message => message.delete(5000));
        });
    }
}