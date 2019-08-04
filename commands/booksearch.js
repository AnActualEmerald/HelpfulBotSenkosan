const goodreads = require('goodreads-api-node');
const util = require('util');
const Discord = require('discord.js');

module.exports = {
    name:"booksearch",
    alias:['title','book'],
    args:true,
    description:'Searches www.goodreads.com for a book by title',
    cooldown:1500,
    usage:'<title>',
    execute(message, args, bot){
        const credentials = {key:bot.gr_key,secret:bot.gr_secret};
        const gr_client = goodreads(credentials);

        var q_string = args.toString().replace(/,/g, ' ');

        if(!bot.globalVar.rate_ok){
            bot.logger.warn('goodreads rate limit');
            message.reply("I'm a little busy right now, try again in a bit");
            return;
        }

        bot.logger.info(`Sending goodreads request`);
        bot.globalVar.rate_ok = false;
        setTimeout(function(){bot.globalVar.rate_ok = true;bot.logger.info('reset goodreads ratelimit');}, 1200);
        gr_client.searchBooks( { q:q_string, page: 1, field: 'title' } ).then(res => { //here we go
            bot.logger.info(`Got result from Goodreads`);
            bot.logger.silly(util.inspect(res, false, null));

            var book = res.search.results.work[0].best_book;
            var img = book.image_url;
            var id = book.id._;
            var author_id = book.author.name;

            gr_client.showBook(id).then(b => {
                var url = b.book.link;
                var title = b.book.title;

                var embed = new Discord.RichEmbed();
                embed.setTitle(`Goodreads search result for '${q_string}'`);
                embed.setDescription(title);
                embed.setURL(url);
                embed.setImage(img);
                embed.setFooter(`By ${author_id}`);


                message.channel.send(embed).catch(bot.logger.error);
            });





        });





    },
}