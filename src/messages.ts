import * as Discord from "discord.js";
import * as Untis from "./untis";

let BotPrefix: string = '\\';

export function init(password: string, botPrefix: string) {
    Untis.init(password);
    BotPrefix = botPrefix;
}

export function handle(message: Discord.Message) {
    if (message.content.startsWith(BotPrefix)) {
        logMessage(message);
        handleCommands(message);
    }
}

function handleCommands(message: Discord.Message) {
    const cmdArgs = message.content.substr(BotPrefix.length).split(' ');
    switch (cmdArgs[0].toLowerCase()) {
        case "tt":
            Untis.sendTimeTable(message, new Date());
            break;
        case "help":
            sendHelp(message);
            break;
        default:
            sendHelp(message);
            break;
    }
}

function logMessage(message: Discord.Message) {
    console.log(message.author.username+'#'+message.author.discriminator+':', message.content);

}

function sendHelp(message: Discord.Message) {
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#00B3F0')
        .setTitle('Mimimi Help')
        .addFields(
            { name: BotPrefix + 'help', value: 'Shows this help.' },
            { name: BotPrefix + 'tt', value: 'Shows todays timetable.' },
        )
    message.channel.send(exampleEmbed);
}