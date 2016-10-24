'use strict';
/**********************
 * Badges by a weeb for weebs *
 **********************/

let color = require('../config/color');

module.exports.badgeIcons = {
	'staff': 'http://i.imgur.com/EqwEcfD.gif',
	'Mono Pro': 'http://i.imgur.com/R0VISSU.png',
	'Big Brother Badge': 'http://i.imgur.com/qcOQDhT.png',
	'weeb': 'http://i.imgur.com/5FzJ4Tt.png',
	'rpsmaster': 'http://i.imgur.com/xpRhWgI.png',
	'Nolife Master': 'http://i.imgur.com/pKxK9pv.pngx',
	'Collector': 'http://i.imgur.com/a26Qbmi.png',
	'Persistent!': 'http://i.imgur.com/C6gknys.png',
};

let badgeDescriptions = {
	'staff': 'Be a global staff member.',
	'Mono Pro': 'Win in all 3 formats of Monotype Series.',
	'Big Brother Badge': 'Send Nii Sama a gif or vine that makes him laugh.',
	'weeb': '10 posts in Anime subforum.',
	'rpsmaster': 'Reach 1500 on the RPS ladder.',
	'Nolife Master': 'Accumulate an ontime of 300 hours.',
	'Collector': 'Earn 750 card points.',
	'Persistent!': '1000 wins on the dice ladder.',
};

function badgeImg(link, name) {
	return '<img src="' + link + '" height="16" width="16" alt="' + name + '" title="' + name + '" >';
}

exports.commands = {
	badge: 'badges',
	badges: function (target, room, user) {
		let parts = target.split(',');
		let cmd = parts[0].trim().toLowerCase();
		let userid, targetUser;
		let badges;
		let badge;
		let output = '<table> <tr>';
		let badgeIcons = module.exports.badgeIcons;
		switch (cmd) {
		case 'set':
			if (!this.can('lock')) return false;
			if (parts.length !== 3) return this.errorReply("Correct command: `/badges set, user, badgeName`");
			userid = toId(parts[1].trim());
			targetUser = Users.getExact(userid);
			badges = Db('badgesDB').get(userid);
			badge = parts[2].trim();
			if (!badgeIcons[badge]) return this.errorReply("This badge does not exist, please check /badges list");
			if (!Db('badgesDB').has(userid)) badges = [];
			badges = badges.filter(b => b !== badge);
			badges.push(badge);
			Db('badgesDB').set(toId(userid), badges);
			if (Users.get(targetUser)) Users.get(userid).popup('|modal||html|<font color="red"><strong>ATTENTION!</strong></font><br /> You have received a badge from <b><font color="' + color(user.userid) + '">' + Tools.escapeHTML(user.name) + '</font></b>: <img src="' + badgeIcons[badge] + '" width="16" height="16">');
			this.logModCommand(user.name + " gave the badge '" + badge + "' badge to " + userid + ".");
			this.sendReply("The '" + badge + "' was given to '" + userid + "'.");
			break;
		case 'list':
			if (!this.runBroadcast()) return;
			badges = Object.keys(badgeIcons);
			output = '<table> <tr>';
			for (let i = 0; i < badges.length; i++) {
				output += '<td>' + badgeImg(badgeIcons[badges[i]], badges[i]) + '</td> <td>' + badges[i] + '</td> <td>' + badgeDescriptions[badges[i]] + '</td>';
				if (i % 2 === 1) output += '</tr> <tr>';
			}
			output += '</tr> <table>';
			this.sendReplyBox(output);
			break;
		case 'info':
			if (!this.runBroadcast()) return;
			if (!parts[1]) return this.errorReply("Invalid command. Valid commands are `/badges list`, `/badges info, badgeName`, `/badges set, user, badgeName` and `/badges take, user, badgeName`.");
			badge = parts[1].trim();
			if (!badgeDescriptions[badge]) return this.errorReply("This badge does not exist, please check /badges list");
			this.sendReplyBox('<img src="' + badgeIcons[badge] + '" width="16" height="16">' + badge + ': ' + badgeDescriptions[badge]);
			break;
		case 'take':
			if (!this.can('lock')) return false;
			if (parts.length !== 3) return this.errorReply("Correct command: `/badges take, user, badgeName`");
			userid = toId(parts[1].trim());
			targetUser = Users.getExact(userid);
			if (!Db('badgesDB').has(userid)) return this.errorReply("This user doesn't have any badges.");
			badges = Db('badgesDB').get(userid);
			badge = parts[2].trim();
			if (!badgeIcons[badge]) return this.errorReply("This badge does not exist, please check /badges list");
			badges = badges.filter(b => b !== badge);
			Db('badgesDB').set(toId(userid), badges);
			this.logModCommand(user.name + " took the badge '" + badge + "' badge from " + userid + ".");
			this.sendReply("The '" + badge + "' was taken from '" + userid + "'.");
			break;
		case 'deleteall':
			if (!~developers.indexOf(user.userid)) return this.errorReply("/badges deleteall - Access denied.");
			if (parts.length !== 2) return this.errorReply("Correct command: `/badges deleteall, badgeName`");
			badge = parts[1].trim();
			if (!badgeIcons[badge]) return this.errorReply("This badge does not exist, please check /badges list");
			let badgeObject = Db('badgesDB').object();
			let users = Object.keys(badgeObject);
			users.forEach(u => Db('badgesDB').set(u, (badgeObject[u].filter(b => b !== badge))));
			this.sendReply("All badges with the name '" + badge + "' deleted.");
			break;
		default:
			return this.errorReply("Invalid command. Valid commands are `/badges list`, `/badges info, badgeName`, `/badges set, user, badgeName` and `/badges take, user, badgeName`.");
		}
	},
	badgeshelp: ["Valid commands are `/badges list`, `/badges info, badgeName`, `/badges set, user, badgeName` and `/badges take, user, badgeName`."],
};
