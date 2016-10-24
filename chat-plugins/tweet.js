/* Emoticons Plugin
 * This is a chat-plugin for an Emoticons system on PS
 * You will need a line in command-parser.js to actually
 * parse this so that it works.  Also, you will need to
 * add a few lines to the PM command (commands.js).
 * Credits: panpawn, jd
 */
'use strict';

const fs = require('fs');
const serialize = require('node-serialize');
let emotes = {};


Destiny.tweet = {
	maxChatEmotes: 4, // the default maximum number of emoticons in one chat message that gets parsed
	adminBypassMaxChatEmotes: true, // can administrators use as many emoticons as they wish?
	chatEmotes: {}, // holds the emoticons, to be merged with json later on

	processEmoticons: function (text) {
		let patterns = [], metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

		for (let i in this.chatEmotes) {
			if (this.chatEmotes[i]) {
				patterns.push(`(${i.replace(metachars, "\\$&")})`);
			}
		}

		let message = text.replace(new RegExp(patterns.join('|'), 'g'), match => {
			return typeof this.chatEmotes[match] !== 'undefined' ?
				`<img src="${this.chatEmotes[match]}" title="${match}"/>` :
				match;
		});
		if (message === text) return text;

		message = Destiny.formatMessage(message); // PS formatting

		if (message.substr(0, 4) === '&gt;' || message.substr(0, 1) === '>') message = `<span class="greentext">${message}</span>`; // greentext
		return message;
	},

checkEmoteModchat: function (user, room) {
		let rank = (user.group !== ' ' ? user.group : (room.auth ? room.auth[user.userid] : user.group));
		switch (room.emoteModChat) {
		case undefined:
		case false:
			return true;
		case 'ac':
		case 'autoconfirmed':
			return user.autoconfirmed;
		default:
			let groups = Config.groupsranking;
			let i = groups.indexOf(rank); // rank # of user
			let u = groups.indexOf(room.emoteModChat); // rank # of emote modchat
			if (i >= u) return true;
		}
		return false;
	},

	// handles if/when to put an emoticon message to a chat
	processChatData: function (user, room, connection, message) {
		let match = false;
		let parsed_message = this.processEmoticons(message);
		for (let i in this.chatEmotes) {
			if (~message.indexOf(i)) {
				if ((parsed_message.match(/<img/g) || []).length <= this.maxChatEmotes || (this.adminBypassMaxChatEmotes && user.can('hotpatch'))) {
					match = true;
				} else {
					match = false;
				}
			}
		}
		if (Users.ShadowBan.checkBanned(user) && match) {
			let origmsg = message;
			message = Chat.escapeHTML(message);
			message = this.processEmoticons(message);
			user.sendTo(room, `${(room.type === 'chat' ? '|c:|' + ~~(Date.now() / 1000) + '|' : '|c|') + user.getIdentity(room).substr(0, 1) + user.name}|/html ${message}`);
			Users.ShadowBan.addMessage(user, `To ${room}`, origmsg);
		} else {
			if (!this.checkEmoteModchat(user, room)) {
				let kitty = message = this.processEmoticons(message);
				message = Chat.escapeHTML(kitty);
				return message;
			} else if (this.checkEmoteModchat(user, room)) {
				if (!match || message.charAt(0) === '!') return true;
				message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
				message = this.processEmoticons(message);
				let name = user.getIdentity(room).substr(0, 1) + user.name;
				room.add(`${(room.type === 'chat' ? '|c:|' + ~~(Date.now() / 1000) + '|' : '|c|') + name}|/html ${message}`).update();
				room.messageCount++;
				return false;
			}
		}
	},
};


// commands
