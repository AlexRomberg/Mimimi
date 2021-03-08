import * as Discord from "discord.js";
import * as Untis from "./untis";
import * as Summary from './summaries';

let BotPrefix: string = '!';

export function init(config: any) {
    Untis.init(config.webuntis.pw, config.webuntis.user);
    Summary.init(config.botPrefix);
    BotPrefix = config.botPrefix;
}

export function handle(message: Discord.Message) {
    if (message.content.startsWith(BotPrefix) && !message.author.bot) {
        logMessage(message);
        handleCommands(message);
    } else if (message.channel.type == "dm") {
        Summary.update(message);
    }
}

function handleCommands(message: Discord.Message) {
    const cmdArgs = message.content.substr(BotPrefix.length).split(' ');
    switch (cmdArgs[0].toLowerCase()) {
        case "tt":
            Untis.sendTimeTable(message, new Date());
            break;
        case "new":
            Summary.create(message);
            break;
        case "delete":
            if (cmdArgs.length == 2) { Summary.remove(Number(cmdArgs[1]), message); }
            else { message.reply('delete needs a id parameter.') }
            break;
        case "edit":
            if (cmdArgs.length == 2) { Summary.edit(Number(cmdArgs[1]), message); }
            else { message.reply('edit needs a id parameter.') }
            break;
        case "drop":
            Summary.drop(message);
            break;
        case "apply":
            Summary.apply(message);
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
    console.log(message.author.username + '#' + message.author.discriminator + ':', message.content);

}

function sendHelp(message: Discord.Message) {
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#00B3F0')
        .setTitle('Mimimi Help')
        .addFields(
            { name: `${BotPrefix}help`, value: 'Shows this help.' },
            { name: `${BotPrefix}tt`, value: 'Shows todays timetable.' },
            { name: `${BotPrefix}new *<title>*`, value: 'Creates a new summary.' },
            { name: `${BotPrefix}delete *<id>*`, value: 'Removes summary with id.' },
            { name: `${BotPrefix}edit *<id>*`, value: 'Starts editing mode of summary.' },
            { name: `${BotPrefix}drop`, value: 'Stops editing mode and *deletes* changes.' },
            { name: `${BotPrefix}apply`, value: 'Stops editing mode and *applies* changes.' }
        )
    message.channel.send(exampleEmbed);
}