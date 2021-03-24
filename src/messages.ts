import * as Discord from "discord.js";
import * as Untis from "./untis";
import * as Summary from './summaries';
import child_process from 'child_process';


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
        case "hw":
            Untis.sendHomework(message);
            break;
        case "new":
            if (message.channel.type != "dm") {
                Summary.create(message);
            } else {
                message.reply('can\'t create summary in DM.');
            }
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
            if (message.channel.type != "dm") {
                Summary.apply(message);
            } else {
                message.reply('can\'t apply summary in DM. Go into original channel to apply.');
            }
            break;
        case "clear":
            if (message.channel.type == "dm") {
                clear(message.channel);
            }
            break;
        case "status":
            status(message);
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
            { name: `${BotPrefix}hw`, value: 'Shows list of homework.' },
            { name: `${BotPrefix}clear`, value: 'Deletes last 100 messages from DM.\n(won\'t work in server)\n----------------------------------------------------------' },
            { name: `${BotPrefix}new *<title>*`, value: 'Creates a new summary.' },
            { name: `${BotPrefix}delete *<id>*`, value: 'Removes summary with id.' },
            { name: `${BotPrefix}edit *<id>*`, value: 'Starts editing mode of summary.' },
            { name: `${BotPrefix}drop`, value: 'Stops editing mode and *deletes* changes.' },
            { name: `${BotPrefix}apply`, value: 'Stops editing mode and *applies* changes.' }
        )
    message.channel.send(exampleEmbed);
}

function status(message: Discord.Message) {
    if (message.author.id == '545608977438998529') {
        let temp;
        try {
            temp = child_process.execSync('vcgencmd measure_temp');
        } catch {
            temp = "Temp not available";
        }

        message.reply(new Discord.MessageEmbed().setColor('#f00').setTitle('Status').addField('Temp:', `${temp}`));
    }
}

function clear(channel: Discord.DMChannel) {
    channel.messages.fetch({ limit: 100 }).then(msgs => {
        msgs.forEach(msg => {
            if (msg.author.bot) {
                msg.delete().catch();
            }
        });
    }).catch(err => {
        channel.send('cleaning not working: ' + err);
    });
}