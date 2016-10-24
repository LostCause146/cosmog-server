

'use strict';

const fs = require('fs');
const moment = require('moment');
const Autolinker = require('autolinker');

Destiny.userData = Object.create(null);

function loadUserData() {
	fs.readFile('config/destinyusers.json', 'utf8', function (err, file) {
		if (err) return;
		Destiny.userData = JSON.parse(file);
	});
}
loadUserData();

try {
	Object.assign(Destiny, {
        
        /******************************
		 * Initialize User Functions  *
		 ******************************/
		
		
        saveAutoJoins: function () {
		fs.writeFileSync('config/autojoin.json', JSON.stringify(Wisp.autoJoinRooms));
	},


		/*******************
		 * Misc. Functions *
		 *******************/
		customColor: function (user, action, color) {
			let data = this.checkExisting(user);
			if (!data.color) data.color = '';

			if (action === 'GIVE') {
				data.color = color;
			} else if (action === 'REMOVE') {
				data.color = false;
			} else {
				return false;
			}

			this.saveData();
		},
		customIcon: function (user, action, icon) {
			let data = this.checkExisting(user);
			if (!data.icon) data.icon = '';

			if (action === 'GIVE') {
				data.icon = icon;
			} else if (action === 'REMOVE') {
				data.icon = false;
			} else {
				return false;
			}

			this.saveData();
		},
		addIp: function (user, ip) { // sub-function of initialize user
			if (toId(user).substr(0, 5) === 'guest') return false;

			let data = this.checkExisting(user);
			if (!data.ips) data.ips = [];

			if (!data.ips.includes(ip)) data.ips.push(ip);
		},
		updateFriends: function (user, friend, action) {
			friend = toId(friend);
			let data = this.checkExisting(user);
			if (!data.friends) data.friends = [];

			if (action === 'ADD') {
				if (!data.friends.includes(friend))data.friends.push(friend);
			} else if (action === 'DELETE') {
				if (data.friends.includes(friend)) data.friends.remove(friend);
			} else {
				return false;
			}

			this.saveData();
		},
	
		trustUser: function (user, action) {
			let data = this.checkExisting(user);
			if (!action) action = false;
			if (!data.proxywhitelist) data.proxywhitelist = false;

			data.proxywhitelist = action;

			this.saveData();
		},

generateNews: function () {
			let lobby = Rooms('lobby');
			if (!lobby) return false;
			if (!lobby.news || Object.keys(lobby.news).length < 0) return false;
			if (!lobby.news) lobby.news = {};
			let news = lobby.news, newsDisplay = [];
			Object.keys(news).forEach(announcement => {
				newsDisplay.push(`<h4>${announcement}</h4>${news[announcement].desc}<br /><br /><strong>—<font color="${Destiny.hashColor(news[announcement].by)}">${news[announcement].by}</font></strong> on ${moment(news[announcement].posted).format("MMM D, YYYY")}`);
			});
			return newsDisplay;
		},
		newsDisplay: function (user) {
			if (!Users(user)) return false;
			let newsDis = this.generateNews();
			if (newsDis.length === 0) return false;

			if (newsDis.length > 0) {
				newsDis = newsDis.join('<hr>');
				return Users(user).send(`|pm| Mist News|${Users(user).getIdentity()}|/raw ${newsDis}`);
			}
		},
        
   parseMessage: function (message) {
		if (message.substr(0, 5) === "/html") {
			message = message.substr(5);
			message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
			message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
			message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
			message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
			message = Autolinker.link(message.replace(/&#x2f;/g, '/'), {stripPrefix: false, phone: false, twitter: false});
			return message;
		}
		message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
		message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
		return message;
	},

		pmStaff: function (message, from) {
			from = from ? ' (PM from ' + from + ')' : '';
			Users.users.forEach(curUser => {
				if (curUser.isStaff) {
					curUser.send('|pm|~Staff PM|' + curUser.getIdentity() + '|' + message + from);
				}
			});
		},
		pmUpperStaff: function (message, pmName, from) {
			if (!pmName) pmName = '~Upper Staff PM';
			from = from ? ' (PM from ' + from + ')' : '';
			Users.users.forEach(curUser => {
				if (curUser.group === '~' || curUser.group === '&') {
					curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
				}
			});
		},
	});
} catch (e) {
	let staff = Rooms('staff');
	if (staff) staff.add(`|html|<div class="broadcast-red"><b>CUSTOM PS FUNCTIONALITY HAS CRASHED:</b><br />${e.stack}<br /><br /><b>Please report this to a developer.`).update();
}