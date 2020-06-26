const Eris = require("eris");
const request = require('request');
const readline = require('readline');
const fs = require('fs');
const file = "tokens.txt";

const checkMain = true; //whether or not to check messages for nitro on your main account

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
		clients.push(new Eris(line, {messageLimit: 0}));
		tokens.push(line);
	}

	mainToken = tokens[0];

	for(let i = checkMain ? 0 : 1; i < clients.length; i++){
		clients[i].on('error', (err) => { 
			if (err.code === 1006)
				console.log("\x1b[0m", "Reconnecting...");
			else
    			console.log(err);
		});	

		clients[i].on('ready', () => { 
    		console.log("\x1b[0m", `Connected to account: ` + clients[i].user.username + (i == 0 ? " (main) " : ""));
		});	

		clients[i].on('messageCreate', message => {
            checkMessage(message, message.content, clients[i].user.username)
				.catch((error) => {
					null
				})
		})

		clients[i].connect();
	}
})();

async function checkMessage(message, text, username){
	if(text.includes('discord.gift') || text.includes('discordapp.com/gifts/')) {
		checkCode(/discord(app\.com){0,1}(\.|\/)gift\/[^\s.,!?\/]+/.exec(text)[0].split('/')[1], mainToken, `Nitro found in ${message.channel.guild.name} by ${username}`);
	}
}

async function checkCode(code, token, message) {
	const options = {
		url: 'https://discordapp.com/api/v6/entitlements/gift-codes/'+code+'/redeem',
		method: "POST",
		headers: {
			"Authorization": token,
		}
	};

	request(options, function(err, res, body) {
		console.log("\x1b[0m", message);
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
