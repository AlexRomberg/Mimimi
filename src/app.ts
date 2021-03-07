const Secret = require("./secret");
import * as Discord from "discord.js";
import * as Messages from "./messages";

const client = new Discord.Client();
const BotPrefix = '!';

client.on('ready', () => {
    const user: Discord.ClientUser = client.user!;

    console.log(`Logged in as ${user.tag}!`);
    user.setPresence({
        status: "online",
        activity: {
            name: "humanity suffer",
            type: "WATCHING"
        }
    });
});

client.on('message', (msg: Discord.Message) => {
    if (msg.type == "PINS_ADD" && msg.author.id == client.user?.id) {
        msg.delete().catch();
    }
    Messages.handle(msg);
});

client.login(Secret.Token.Mimimi);
Messages.init(Secret.PW.WebUntis, BotPrefix);