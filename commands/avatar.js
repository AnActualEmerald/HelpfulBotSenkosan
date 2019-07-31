var Discord = require('discord.js');

module.exports = {
	name: 'avatar',
	alias:'pfp',
	args:true,
	usage:'<user>',
	description:'Returns a user\'s profile picture',
	execute(message, args, bot){
		var user = message.mentions.users.first();
		var url = user.avatarURL;
		var embed = new Discord.RichEmbed()
			.setTitle(user.username + "'s avatar")
			.setImage(url);
		
		message.channel.send(embed);
		
	}
}