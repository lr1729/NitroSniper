const Eris = require("eris");
const request = require('request');
const readline = require('readline');
const fs = require('fs');
const file = "tokens.txt";
const checkMain = true; // whether or not to check messages for nitro on your main account

var clients = []; // stores all the clients for each token
var tokens = []; // stores the tokens
var channels = new Map(); // stores all the channels to avoid claiming on same channel on multiple accounts
var codes = new Map(); // stores all the codes to avoid claiming the same code multiple times
var mainToken; // the token you want to claim nitro on

(async () => {

  // read tokens from file
  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    clients.push(new Eris(line, {messageLimit: 0}));
    tokens.push(line);
  }

  mainToken = tokens[0]; // main token is the first token

  // Set behaviour for each client
  for(let i = checkMain ? 0 : 1; i < clients.length; i++){
    clients[i].on('error', (err) => { 
      if (err.code === 1006 || err.code === 1001)
        console.log("\x1b[0m", "Reconnecting...");
      else
        console.log(err);
    }); 

    clients[i].on('ready', () => {
      console.log("\x1b[0m", `Connected to account: ` + clients[i].user.username + (i == 0 ? " (main) " : ""));
    });

    // prevent checking a message more than once
    clients[i].on('messageCreate', message => {
      if(channels.has(message.channel.id)){
        if(channels.get(message.channel.id) == clients[i].user.username){
          try {
            parseMessage(message, message.content, clients[i].user.username);
          } catch (error) {
            null;
          }
        }
      } else {
        channels.set(message.channel.id, clients[i].user.username);
        try {
          parseMessage(message, message.content, clients[i].user.username);
        } catch (error) {
          null;
        }
      }
    })

    clients[i].connect();
  }
})();

// searches for a nitro code in the message using regex
async function parseMessage(message, text, username){
  if(text.includes('discord.gift/') || text.includes('discordapp.com/gifts/')) {
    var code = /discord(app\.com){0,1}(\.|\/)gift\/[^\s.,!?/]+/.exec(text)[0].split('/')[1];
    let channel = message.channel?.guild?.name ?? "Direct Messages";
    if(codes.get(code) == true){
      console.log("\x1b[0m", "Found duplicate code " + code);
    } else {
      try {
        checkCode(code, mainToken, `Nitro found in ${channel} by ${username}`);
      } catch (error) {
        console.log("\x1b[0m", "Error parsing text: " + text);
      }
      codes.set(code, true);
    }
  }
}

// checks the code with the api via http request
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
