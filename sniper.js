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
  	const token = await askQuestion("Enter your token: "); 
    account_token = token;
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
	const token = await getFirstLine("./token.txt");
    account_token = token;
	client.login(account_token).catch((error) => {
            console.log("Invalid token supplied")
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
})

async function checkMessage(message, text){
    if(text.includes('discord.gift') || text.includes('discordapp.com/gifts/')) {

        var Nitro = /(discord\.(gift)|discordapp\.com\/gift)\/.+[a-z]/

        var NitroUrl = Nitro.exec(text);
        var NitroCode = NitroUrl[0].split('/')[1];

        console.log("\x1b[0m", `Found Nitro sent by ${message.author.username}`);
        checkCode(NitroCode, account_token);
    }
}
async function check() {
    NitroCode = randgen(16);
    checkCode(NitroCode, account_token);
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

function randgen(length){
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    let chanceNum = 10;
    for(let i = 0; i < length; i++){
        if(Math.random() < 0.1)
            result += Math.floor(Math.random() * 10);
        else
            result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}



