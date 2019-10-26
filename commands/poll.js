const {RichEmbed}= require("discord.js")
const counters = ['1⃣', "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"]


module.exports = {
    name:'poll',
    alias:['ask', 'p'],
    description: 'Runs a poll with up to 10 options',
    args:true,
    usage:'<question>; <option 1>; <option 2>; ... <option 10>;',
    cooldown:5000,
    execute(message, args, bot){
        var options = args.join(" ").split(';');
        var question = new RichEmbed().setTitle(`${message.member.displayName} asks: ${options.shift().replace(/,/g, ' ')}`).setColor(message.member.displayColor);


        var i = 0;
        options.forEach(o => {
            if(o != "" && o != " "){
                i++;
                bot.logger.debug(`o was ${o}`);
                question.addField(`${i})`, `${o.replace(/,/g, ' ').replace(/\n/g, '')}`);
            }
        });

        if(i > 10){
            message.channel.send("Too many options, sorry");
            return;
        }

        //set up filter for reactions
        //const filter = (emoji, user) => 1 == 1;//options.includes(emoji); //disabled because we aren't filtering for reactions any more

        //debug logging
        bot.logger.debug(`question was "${options}"`);

        message.channel.send(question).then(msg => {
            for(var c = 0; c < i; c++) {
                msg.react(counters[c]).catch(bot.logger.error);
            }
        }).catch(bot.logger.error);
        message.delete();



    },


}
