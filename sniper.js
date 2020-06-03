const Discord = require("discord.js");
const request = require('request');
const readline = require('readline');
const fs = require('fs');

var account_token;

const client = new Discord.Client();
async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  readable.on('error', async function(){
  	console.log("No token file found");
  	account_token = await askQuestion("Enter your token: ");
  	client.login(account_token)
    .catch((error) => {
            console.log("Invalid token supplied")
            sleep(10000);
        });
  });
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

(async () => {
	account_token = await getFirstLine("./token.txt");
	client.login(account_token).catch((error) => {
            console.log("Invalid token supplied, check token.txt")
            sleep(10000);
        });
})();

client.on('ready', () => {
    console.log(`Sniper started...`);
});

client.on('message', message => {
    checkMessage(message, message.content)
        .catch((error) => {
            null
        })
})

async function checkMessage(message, text){
    if(text.includes('discord.gift') || text.includes('discordapp.com/gifts/')) {

        var Nitro = /(discord\.(gift)|discordapp\.com\/gift)\/.+[A-Za-z0-9]/

        var NitroUrl = Nitro.exec(text);
        var NitroCode = NitroUrl[0].split('/')[1];

        console.log("\x1b[0m", `Found Nitro sent by ${message.author.username}`);
        checkCode(NitroCode, account_token);
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

