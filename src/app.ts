import * as Discord from "discord.js";
import config from "./config";
import * as Messages from "./messages";

const client = new Discord.Client();

client.on('ready', () => {
    const user: Discord.ClientUser = client.user!;

    console.log(`Logged in as ${user.tag}!`);

    client.users.fetch(config.user, false, true).then(user => {
        user.send('Rebooted!');
    });

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

client.login(config.token);
Messages.init(config);