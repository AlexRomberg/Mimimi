import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'

const db = new JsonDB(new Config("data", true, true, '/'));
// db.delete("/");

export function newSummary(title: string, id: number): void {
    db.push("/summaries[]", { id, title, lines: [], locked: false }, true);
}

export function getSummary(id: number): ({ id: number; title: string; lines: string[]; messageID: number; locked: (string | false) } | undefined) {
    const summaryID = db.getIndex("/summaries", id);
    if (summaryID >= 0) {
        return db.getData(`/summaries[${summaryID}]`);
    }
    return undefined;
}

export function lockSummary(id: number, userID: string): (boolean | string) {
    const summary = getSummary(id);
    if (summary != undefined) {
        if (summary.locked == false) {
            const summaryID = db.getIndex("/summaries", id);
            db.push(`/summaries[${summaryID}]/locked`, userID, true);
            db.push(`/edits[]`, summary, true);
            return true;
        }
        return summary.locked;
    }
    return false;
}

export function editsSummary(userID: string) {
    return (db.getIndex('/summaries', userID, 'locked') == -1) ? false : true;
}

export function deleteSummary(id: number): boolean {
    const summaryID = db.getIndex("/summaries", id);
    if (db.getData(`/summaries[${summaryID}]/locked`) == false) {
        db.delete(`/summaries[${summaryID}]`);
        return true
    }
    return false;
}

export function getEditSummary(userID: string): ({ id: number; title: string; lines: string[]; messageID: number; locked: (string | false) } | undefined) {
    const summaryID = db.getIndex('/edits', userID, 'locked');
    if (summaryID >= 0) {
        return db.getData(`/edits[${summaryID}]`);
    }
    return undefined;
}

export function deleteEdit(userID: string): void {
    let summaryID = db.getIndex('/edits', userID, 'locked');
    db.delete(`/edits[${summaryID}]`);
    summaryID = db.getIndex('/summaries', userID, 'locked');
    db.push(`/summaries[${summaryID}]/locked`, false, true);
}

export function updateEdit(lines: string[], userID: string) {
    const summaryID = db.getIndex('/edits', userID, 'locked');
    db.push(`/edits[${summaryID}]/lines`, lines);
}

export function copyEdit(userID: string): { messageID: string; id: number } {
    const summaryEditID = db.getIndex('/edits', userID, 'locked');
    const summaryID = db.getIndex('/summaries', userID, 'locked');
    const lines = db.getData(`/edits[${summaryEditID}]/lines`);
    db.push(`/summaries[${summaryID}]/lines`, lines, true);
    db.push(`/summaries[${summaryID}]/locked`, false, true);
    db.delete(`/edits[${summaryEditID}]`);
    return { messageID: db.getData(`/summaries[${summaryID}]/messageID`), id: db.getData(`/summaries[${summaryID}]/id`) };
}

export function saveMessagedata(id: number, messageID: string): void {
    const summaryID = db.getIndex("/summaries", id);
    db.push(`/summaries[${summaryID}]/messageID`, messageID, true);
}

export function getID(): number {
    try {
        const id: number = db.getData("/lastID") + 1;
        db.push("/lastID", id, true);
        return id;
    } catch {
        db.push("/lastID", 0, true);
        return 0;
    }
}