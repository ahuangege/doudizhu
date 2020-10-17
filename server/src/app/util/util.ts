

export function randInt(num: number) {
    return Math.floor(Math.random() * num);
}

export function randArr<T = any>(arr: T[]) {
    return arr[randInt(arr.length)];
}

export function removeFromArr<T>(arr: T[], one: T) {
    let index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

export function timeFormat(_date: any, hasTime = true): string {
    let date: Date = typeof _date === "object" ? _date : new Date(_date);
    let timeStr = "";
    let tmp: number;
    timeStr += date.getFullYear() + "-";
    tmp = date.getMonth() + 1;
    timeStr += (tmp > 9 ? tmp : "0" + tmp) + "-";
    tmp = date.getDate();
    timeStr += (tmp > 9 ? tmp : "0" + tmp);
    if (hasTime) {
        tmp = date.getHours();
        timeStr += " " + (tmp > 9 ? tmp : "0" + tmp) + ":";
        tmp = date.getMinutes();
        timeStr += (tmp > 9 ? tmp : "0" + tmp) + ":";
        tmp = date.getSeconds();
        timeStr += tmp > 9 ? tmp : "0" + tmp;
    }

    return timeStr;
}


export interface DicObj<T = any> {
    [key: string]: T
}