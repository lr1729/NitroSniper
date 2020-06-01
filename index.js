const Discord = require("discord.js");
const request = require('request');

const client = new Discord.Client();
const {
    account_token
} = require("./config.json");

client.login(account_token)

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

        console.log("\x1b[0m", `Nitro found in ${message.guild.name}`);

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



