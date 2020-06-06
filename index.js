'use strict';

const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const fs = require('fs');
const Random = require('random-js');
const engine = Random.engines.mt19937().autoSeed();
const distribution = Random.integer(1, 100);

const config = require('./config.json');
const bot = new TelegramBot(config.telegram_api_token, { polling: true });
const MessageType = {
    "Default": 1,
    "Markdown": 2
};

const locales = {};
let currentLocale;

loadLocales();
checkLocaleArgs();

console.log(moment().format('HH:mm:ss DD-MM-YYYY') + " - Staring Tiradaus bot...");

bot.onText(/^\/start/, function onPhotoText(msg) {
    sendMessage(msg.chat.id, currentLocale.start.join("\n"), MessageType.Markdown)
        .then(function () {
            return sendMessage(msg.chat.id, currentLocale.playCommands.join("\n"));
        })
        .catch(logError);
});


bot.onText(/^\/roll/, function onPhotoText(msg) {
    console.log(moment().format('HH:mm:ss DD-MM-YYYY') + " - /rollA command"+ " " + msg.from.id + " " + msg.from.username+ " " + msg.from.first_name);

    let author = msg.from.username === undefined ? msg.from.first_name : "@" + msg.from.username;

    sendMessage(msg.chat.id, "🎲🎲 *" + author + "*" + currentLocale.hasRolled + getRandomDiceRoll(), MessageType.Markdown)
        .catch(logError);
});

function checkLocaleArgs() {
    if (process.argv.length !== 4) {
        return;
    }

    if (process.argv[2] !== "--locale") {
        return;
    }

    if (locales[process.argv[3]] === undefined) {
        return;
    }

    currentLocale = locales[process.argv[3]];
}

function loadLocales() {
    fs.readdirSync(__dirname + '/locales').forEach((file) => {
        if (~file.indexOf('.json')) {
            let localeName = file.split(".")[0];
            locales[localeName] = require(__dirname + '/locales/' + file);

            if (localeName === config.default_locale) {
                currentLocale = locales[config.default_locale];
            }
        }
    });
}

function sendMessage(chatId, text, type) {
    let messageOptions = type === MessageType.Markdown ?  { "parse_mode": "Markdown" } : undefined;
    return bot.sendMessage(chatId, text, messageOptions);
}

function getRandomDiceRoll() {
    return distribution(engine);
}

function logError(error) {
    console.log(moment().format('HH:mm:ss DD-MM-YYYY') + " - Error: " + err);
}