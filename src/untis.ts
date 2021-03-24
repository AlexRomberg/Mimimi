import * as Discord from "discord.js";
import WebUntis from "webuntis";

let Untis: WebUntis;
export function init(PW: string, user: string) {
    Untis = new WebUntis(
        'KF',
        user,
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

export function sendHomework(message: Discord.Message) {
    Untis.login()
        .then(async () => {
            return Untis.getHomeWorksFor(new Date(), await Untis.getLatestSchoolyear().then(schoolyear => {
                return schoolyear.endDate;
            }));
        }).then((homeworks: any) => {
            let homeworkObjects: { teacher: object, homework: object, lesson: object }[] = [];
            homeworks.records.forEach(record => {
                const teacher = fetchTeacher(record.teacherId, homeworks.teachers);
                const homework = fetchHomework(record.homeworkId, homeworks.homeworks);
                if (homework != null) {
                    const lesson = fetchLesson(homework.lessonId, homeworks.lessons);
                    if (lesson != null) {
                        homeworkObjects.push({ teacher, homework, lesson });
                    }
                }
            });
            message.channel.send(getHomeworkEmbed(homeworkObjects));
        });
}

function fetchTeacher(teacherId: number, teachers: { id: number, name: string }[]): ({ id: number, name: string }) {
    let teacherObject = { id: -1, name: "" };
    teachers.forEach(teacher => {
        if (teacher.id == teacherId) {
            teacherObject = teacher;
        }
    });
    return teacherObject;
}

function fetchHomework(homeworkId: number, homeworks: { id: number, lessonId: number; date: number; dueDate: number; text: string; remark: string; completed: boolean; attachments: number }[]): ({ id: number, lessonId: number; date: number; dueDate: number; text: string; remark: string; completed: boolean; attachments: number } | null) {
    let homeworkObject: any = null;
    homeworks.forEach(homework => {
        if (homework.id == homeworkId) {
            homeworkObject = homework;
        }
    });
    return homeworkObject;
}

function fetchLesson(lessonId: number, lessons: { id: number; subject: string; lessonType: string }[]): ({ id: number; subject: string; lessonType: string } | null) {
    let lessonObject: any = null;
    lessons.forEach(lesson => {
        if (lesson.id == lessonId) {
            lessonObject = lesson;
        }
    });
    return lessonObject;
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
        embed.addField("Keine Schule", "Schönen Tag");
    }
    return embed;
}

function getHomeworkEmbed(homeworkObjects): Discord.MessageEmbed {
    const embed = new Discord.MessageEmbed();
    embed.setTitle('Hausaufgaben').setColor('#ff9800');
    if (homeworkObjects.length > 0) {
        homeworkObjects.forEach(homeworkObject => {
            console.log(homeworkObject.homework);
            embed.addField(formatDate(WebUntis.convertUntisDate(homeworkObject.homework.dueDate)) + ' | ' + homeworkObject.lesson.subject + ' | ' + homeworkObject.teacher.name, homeworkObject.homework.text);
        });
    } else {
        embed.addField("Keine Hausaufgaben", "Da ist etwas falsch.");
    }
    return embed;
}

function formatDate(date: Date): string {
    return date.getDate().toString().padStart(2, '0') + '.' + (+date.getMonth() + 1).toString().padStart(2, '0') + '.' + date.getFullYear();
}

function formatTime(date: Date): string {
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
}