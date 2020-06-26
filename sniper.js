const Discord = require("discord.js");
const request = require('request');
const readline = require('readline');
const fs = require('fs');
const file = "tokens.txt";

const checkMain = true; //whether or not to check messages for nitro on your main account
const checkEmbeds = false; //whether to check for rich embeds from bots 

var clients = [];
var tokens = [];

var mainToken;

(async () => {
	const fileStream = fs.createReadStream(file);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl) {
		clients.push(new Discord.Client());
		tokens.push(line);
	}

	mainToken = tokens[0];

	for(let i = checkMain ? 0 : 1; i < clients.length; i++){
		clients[i].on('ready', () => {
			console.log("\x1b[0m", `Checking on account: ` + clients[i].user.username + (i == 0 ? " (main) " : ""));
		}); 

		clients[i].messageCacheMaxSize	= 0;
		clients[i].messageCacheLifetime = 0;
		clients[i].messageSweepInterval = 10;

		clients[i].on('message', message => {
			checkMessage(message, message.content, clients[i].user.username)
				.catch((error) => {
					null
				})

			if(checkEmbeds){
				message.embeds.forEach((embed) => {
					checkMessage(message, embed.description)
						.catch((error) => {
							null
						})
					checkMessage(message, embed.title)
						.catch((error) => {
							null
						})
					checkMessage(message, embed.url)
						.catch((error) => {
							null
						})
				});
			}
		})

		clients[i].login(tokens[i]);
	}
})();

async function checkMessage(message, text, username){
	if(text.includes('discord.gift') || text.includes('discordapp.com/gifts/')) {
		let Nitro = /discord(app\.com){0,1}(\.|\/)gift\/[^\s.,!?\/]+/
		let NitroUrl = Nitro.exec(text);
		let NitroCode = NitroUrl[0].split('/')[1];

		console.log("\x1b[0m", `Nitro found in ${message.guild.name} by ${username}`);

		checkCode(NitroCode, mainToken);
	}
}

async function checkCode(code, token) {
	const options = {
		url: 'https://discordapp.com/api/v6/entitlements/gift-codes/'+code+'/redeem',
		method: "POST",
		headers: {
			"Authorization": token,
		}
	};

	request(options, function(err, res, body) {
		if(/This gift has been redeemed already/.test(body)){
			console.log("\x1b[33m", "Code already redeemed: " + code);
		}
		if(/nitro/.test(body)){
			console.log("\x1b[32m", "Redeemed code: " + code);
		}
		if(/Unknown Gift Code/.test(body)){
			console.log("\x1b[31m", "Invalid Gift Code: " + code);
		}
		console.log(body);
	});
}
