'use strict';

/* League-command plugin by rambo*/

const crypto = require('crypto');
const fs = require('fs');

exports.commands = {

rule: 'leaguerule',
	leaguerule: function (target, room, user, connection, cmd) {
		if (!target) {
			if (!this.runBroadcast()) return;
			if (!room.leagueMessage) return this.sendReply("This leagueroom does not have any rules set.");
			this.sendReply('|raw|<div class="infobox infobox-limited">' + room.leagueMessage.replace(/\n/g, '') + '</div>');
			if (!this.broadcasting && user.can('declare', null, room) && cmd !== 'rule') {
				this.sendReply('Source:');
				this.sendReplyBox(
					'<code>/leaguerule ' + Chat.escapeHTML(room.leagueMessage).split('\n').map(line => {
						return line.replace(/^(\t+)/, (match, $1) => '&nbsp;'.repeat(4 * $1.length)).replace(/^(\s+)/, (match, $1) => '&nbsp;'.repeat($1.length));
					}).join('<br />') + '</code>'
				);
			}
			return;
		}
		if (!this.can('declare', null, room)) return false;
		target = this.canHTML(target);
		if (!target) return;
		if (!/</.test(target)) {
			// not HTML, do some simple URL linking
			let re = /(https?:\/\/(([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?))/g;
			target = target.replace(re, '<a href="$1">$1</a>');
		}
		if (target.substr(0, 11) === '/leaguerule ') target = target.substr(11);

		room.leagueMessage = target.replace(/\r/g, '');
		this.sendReply("(The League rule has been changed to:)");
		this.sendReply('|raw|<div class="infobox infobox-limited">' + room.leagueMessage.replace(/\n/g, '') + '</div>');

		this.privateModCommand(`(${user.name} changed the leaguerule.)`);
		this.logEntry(room.leagueMessage.replace(/\n/g, ''));
        
        if (room.chatRoomData) {
			room.chatRoomData.leagueMessage = room.leagueMessage;
			Rooms.global.writeChatRoomData();
		}
		
	},
	deleterule: 'deleteleaguerule',
	deleteleaguerule: function (target, room, user) {
		if (!this.can('declare', null, room)) return false;
		if (!room.leagueMessage) return this.errorReply("This leagueroom does not have any rules set.");

		this.privateModCommand(`(${user.name} deleted the leaguerule.)`);
		this.logEntry(target);

		delete room.leagueMessage;
		if (room.chatRoomData) {
			delete room.chatRoomData.leagueMessage;
			Rooms.global.writeChatRoomData();
		}
	},
};