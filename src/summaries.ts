import * as Discord from "discord.js";
import * as DB from './db';

let BotPrefix: string = '!';

export function init(botPrefix: any) {
    BotPrefix = botPrefix;
}

export function create(message: Discord.Message) {
    const args = message.content.split(' ');
    args.shift();
    if (args.length > 0) {
        const title = args.join(' ');
        const id = DB.getID();
        DB.newSummary(title, id);
        message.channel.send(getEmbed(id)).then(sentMessage => {
            DB.saveMessagedata(id, sentMessage.id);
            sentMessage.pin().catch(() => {
                console.log("missing permission to delete message on " + message.guild?.name);
            });
            message.delete().catch(() => {
                console.log("missing permission to delete message on " + message.guild?.name);
            });
        });
    } else {
        message.reply(`\`${BotPrefix}new\` requires a title argument.\n> e.g: \`${BotPrefix}new superlist\``)
    }
}

export function remove(id: number, message: Discord.Message) {
    if (message.channel.type == "text") {
        const summary = DB.getSummary(id);
        if (summary != undefined) {

            message.channel.messages.fetch(summary.messageID.toString()).then(summaryMessage => {
                if (DB.deleteSummary(id)) {
                    summaryMessage.delete().then(() => {
                        message.delete().catch(() => {
                            console.log(`missing permission to delete message on ${message.guild?.name}`);
                        });
                    });
                } else {
                    message.reply('someone is editing this summary.')
                }
            }).catch(() => {
                message.reply('can\'t find Message, please go into the channel, where it was posted.')
            });
        } else {
            message.reply('can\'t find Message, please select the right id.');
        }
    }
}

export function update(message: Discord.Message) {
    if (DB.editsSummary(message.author.id)) {
        DB.updateEdit(message.content.split('\n'), message.author.id);
        message.channel.send('Saved Draft!');
        message.channel.send(getEditEmbed(message.author.id));
    }
}

export function edit(id: number, message: Discord.Message) {
    const summary = DB.getSummary(id);
    if (summary != undefined) {
        if (!DB.editsSummary(message.author.id)) {
            const wasEditable = DB.lockSummary(id, message.author.id);
            if (wasEditable === false) {
                message.reply('can\'t find Message, please select the right id');
            } else if (wasEditable === true) {
                message.author.send(`**Here is the unformated version of the summary**\ncopy and send it here to edit it.\nIf you\'re done, go into the chat with the summary and type \`${BotPrefix}apply\` -> save or \`${BotPrefix}drop\` -> cancel\n-------------------------------------------------------------`);
                message.author.send((summary.lines.length >= 1) ? summary.lines.join('\n').replace(/\`/g, '\\\`').replace(/\*/g, '\\\*').replace(/~/g, '\\~') : "empty summary");
            } else {
                message.channel.send(`<@${wasEditable}> is currently editing, ask him to \`${BotPrefix}drop\` or \`${BotPrefix}apply\` his changes.`);
            }
        } else {
            message.reply(`Your currently editing a summary.\nType \`${BotPrefix}apply\` -> save or \`${BotPrefix}drop\` -> cancel.`);
        }
    } else {
        message.reply('can\'t find Message, please select the right id');
    }
}

export function drop(message: Discord.Message) {
    if (DB.editsSummary(message.author.id)) {
        DB.deleteEdit(message.author.id);
        message.reply('dopped your edit.');
    } else {
        message.reply('You\'re not editing a summary.');
    }
}

export function apply(message: Discord.Message) {
    if (DB.editsSummary(message.author.id)) {
        const summaryIDs = DB.copyEdit(message.author.id);
        message.channel.messages.fetch(summaryIDs.messageID).then(summaryMessage => {
            summaryMessage.edit(getEmbed(summaryIDs.id)).then(() => {
                message.delete().catch(() => {
                    console.log(`missing permission to delete message on ${message.guild?.name}`);
                });
            });
            message.channel.send(`Applied Draft to summary[${summaryIDs.id}]`)
        }).catch(() => {
            message.reply('can\'t find Message, please go into the channel, where it was posted.');
        });
    } else {
        message.reply('You\'re not editing a summary.');
    }
}

function getEmbed(id: number): Discord.MessageEmbed {
    const summary = DB.getSummary(id);
    const embed = new Discord.MessageEmbed;
    if (summary != undefined) {
        embed.setColor('#27E100');
        embed.setTitle(`${summary.title} *[id: ${summary.id}]*`);
        embed.setDescription(summary.lines.length < 1 ? `**empty**\nuse \`${BotPrefix}edit ${summary.id}\` to change content of this summary` : summary.lines.join('\n'));
    }
    return embed;
}

function getEditEmbed(userID: string): Discord.MessageEmbed {
    const summary = DB.getEditSummary(userID);
    const embed = new Discord.MessageEmbed;
    if (summary != undefined) {
        embed.setColor('#27E100');
        embed.setTitle(`${summary.title} *[id: ${summary.id}]*`);
        embed.setDescription(summary.lines.join('\n'));
    }
    return embed;
}