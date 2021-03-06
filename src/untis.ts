import * as Discord from "discord.js";
import WebUntis from "webuntis";

let Untis: WebUntis;
export function init(PW: string) {
    Untis = new WebUntis(
        'KF',
        'Alexander.Romberg',
        PW,
        'herakles.webuntis.com'
    );

}

export function sendTimeTable(message: Discord.Message, date: Date) {
    Untis.login()
        .then(() => {
            return Untis.getOwnTimetableFor(date);
        }).then((timeTable) => {
            timeTable = sortTimeTable(timeTable);
            const embed = getTimeTableEmbed(timeTable, date);
            message.channel.send(embed);
        });
}

function sortTimeTable(timeTable: any[]) {
    timeTable.sort(function (a, b) {
        return a.startTime.toString().padStart(4, '0').localeCompare(b.startTime.toString().padStart(4, '0'));
    });

    return timeTable;
}

function getTimeTableEmbed(timeTable, date: Date): Discord.MessageEmbed {
    const embed = new Discord.MessageEmbed();
    embed.setTitle('Stundenplan ' + formatDate(date)).setColor('#ff9800');
    if (timeTable.length > 0) {
        timeTable.forEach(lesson => {
            embed.addField(lesson.su[0].longname, formatTime(WebUntis.convertUntisTime(lesson.startTime)) + ' - ' + formatTime(WebUntis.convertUntisTime(lesson.endTime)) + ' | ' + lesson.te[0].longname + ' [' + lesson.te[0].name + '] | ' + lesson.ro[0].name);
        });
    } else {
        embed.addField("Keine Schuel","Schönen Tag");
    }
    return embed;
}

function formatDate(date: Date): string {
    return date.getDay().toString().padStart(2, '0') + '.' + (+date.getMonth() + 1).toString().padStart(2, '0') + '.' + date.getFullYear();
}

function formatTime(date: Date): string {
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
}