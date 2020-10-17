// 牌色
export const enum e_card_color {
    red = 1,
    black = 2,
    rect = 3,
    flower = 4,
}

// 牌值
export const enum e_card_score {
    c3 = 3,
    c4 = 4,
    c5 = 5,
    c6 = 6,
    c7 = 7,
    c8 = 8,
    c9 = 9,
    c10 = 10,
    J = 11,
    Q = 12,
    K = 13,
    A = 14,
    c2 = 16,    // 前后隔2，方便顺子判断
    kings = 18,
    kingb = 19,
}

// 牌型
export const enum e_card_arr_type {
    none = 0,           // 非法
    wang_zha = 1,       // 王炸
    zha = 2,            // 炸弹
    one = 3,            // 单张
    two = 4,            // 对子
    three = 5,          // 三张
    three1 = 6,         // 三带1
    three2 = 7,         // 三带2
    one_arr = 8,        // 单顺
    two_arr = 9,        // 双顺
    three_arr = 10,     // 三顺(飞机)
    three_arr_wing = 11,    // 飞机带翅膀
    four2 = 12,         // 四带2
}

export interface I_card {
    id: number,
    color: e_card_color,
    score: e_card_score,
}


export class cardUtil {

    private static res: I_cardRes = { "card_arr_type": e_card_arr_type.none, "cards": [], "score": e_card_score.c3 };

    // 不是打上家，随便出牌，需要决定牌型
    static getCardRes(arr: I_card[]): I_cardRes {
        let len = arr.length;
        if (len === 1) {
            this.setRes(e_card_arr_type.one, arr, arr[0].score); // 单张
        } else if (len === 2) {
            if (arr[0].score === arr[1].score) {
                this.setRes(e_card_arr_type.two, arr, arr[0].score);        // 对子
            } else if (this.isWangZha(arr)) {
                this.setRes(e_card_arr_type.wang_zha, arr, e_card_score.kings);   // 王炸
            } else {
                this.setRes(e_card_arr_type.none);
            }
        } else if (len === 3) {
            if (this.isSameScore(arr)) {
                this.setRes(e_card_arr_type.three, arr, arr[0].score);      // 三张
            } else {
                this.setRes(e_card_arr_type.none);
            }
        } else if (len === 4) {
            if (this.isSameScore(arr)) {
                this.setRes(e_card_arr_type.zha, arr, arr[0].score);    // 炸弹
            } else if (this.isSameScore(arr.slice(1, 4))) {
                this.setRes(e_card_arr_type.three1, arr.reverse(), arr[0].score);   // 三带1
            } else if (this.isSameScore(arr.slice(0, 3))) {
                this.setRes(e_card_arr_type.three1, arr, arr[0].score);  // 三带1
            } else {
                this.setRes(e_card_arr_type.none);
            }
        } else if (len === 5) {
            if (this.is_one_arr(arr)) { // 单顺
            } else if (this.is_three2(arr)) {  // 三带2
            } else {
                this.setRes(e_card_arr_type.none);
            }
        } else {
            if (this.is_one_arr(arr)) {             // 单顺
            } else if (this.is_two_arr(arr)) {      // 双顺
            } else if (this.is_three_arr(arr)) {    // 三顺
            } else if (this.is_four2(arr)) {        // 四带2
            } else if (this.is_three_arr_wing(arr)) {   // 飞机带翅膀
            } else {
                this.setRes(e_card_arr_type.none);
            }
        }
        let tmpRes = this.res;
        this.res = { "card_arr_type": e_card_arr_type.none, "cards": [], "score": e_card_score.c3 }
        return tmpRes;
    }

    // 打上家牌，比较牌型
    static isCardType(arr: I_card[], lastType: e_card_arr_type) {
        switch (lastType) {
            case e_card_arr_type.one:                                   // 单张
                this.setRes(e_card_arr_type.one, arr, arr[0].score);
                break;

            case e_card_arr_type.two:                            // 对子
                if (arr[0].score === arr[1].score) {
                    this.setRes(e_card_arr_type.two, arr, arr[0].score);
                }
                break;

            case e_card_arr_type.three:                           // 三张
                if (this.isSameScore(arr)) {
                    this.setRes(e_card_arr_type.three, arr, arr[0].score);
                }
                break;

            case e_card_arr_type.three1:                               // 三带1
                if (this.isSameScore(arr.slice(1, 4))) {
                    this.setRes(e_card_arr_type.three1, arr.reverse(), arr[0].score);
                } else if (this.isSameScore(arr.slice(0, 3))) {
                    this.setRes(e_card_arr_type.three1, arr, arr[0].score);
                }
                break;

            case e_card_arr_type.three2:                             // 三带2
                this.is_three2(arr);
                break;

            case e_card_arr_type.one_arr:                           // 单顺
                this.is_one_arr(arr);
                break;

            case e_card_arr_type.two_arr:                            // 双顺
                this.is_two_arr(arr);
                break;

            case e_card_arr_type.three_arr:                              // 三顺（飞机）
                this.is_three_arr(arr);
                break;

            case e_card_arr_type.three_arr_wing:                              // 飞机带翅膀
                this.is_three_arr_wing(arr);
                break;

            case e_card_arr_type.four2:                              // 四带二
                this.is_four2(arr);
                break;

            default:
                break;
        }

        if (this.res.card_arr_type === e_card_arr_type.none) {
            this.setRes(e_card_arr_type.none);
        }
        let tmpRes = this.res;
        this.res = { "card_arr_type": e_card_arr_type.none, "cards": [], "score": e_card_score.c3 }
        return tmpRes;
    }

    private static setRes(card_arr_type: e_card_arr_type, cards: I_card[] = [], score: e_card_score = e_card_score.c3) {
        this.res.card_arr_type = card_arr_type;
        this.res.cards = cards;
        this.res.score = score;
    }


    // 王炸
    public static isWangZha(arr: I_card[]) {
        if (arr.length !== 2) {
            return false;
        }
        let kingCount = 0;
        for (let one of arr) {
            if (one.score === e_card_score.kings || one.score === e_card_score.kingb) {
                kingCount++;
            } else {
                break;
            }
        }
        return kingCount === 2;
    }
    // 炸弹
    public static isZha(arr: I_card[]) {
        if (arr.length !== 4) {
            return false;
        }
        return this.isSameScore(arr);
    }

    // 牌组是不是分数相同
    private static isSameScore(arr: I_card[]) {
        let isSame = true;
        let score = arr[0].score;
        for (let i = arr.length - 1; i >= 1; i--) {
            if (arr[i].score !== score) {
                isSame = false;
                break;
            }
        }
        return isSame;
    }

    // 单顺
    private static is_one_arr(arr: I_card[]) {
        var len = arr.length;
        if (len < 5 || len > 12) {
            return false;
        }
        let is = true;
        for (let i = arr.length - 2; i >= 0; i--) {
            if (arr[i + 1].score - arr[i].score !== 1) {
                is = false;
                break;
            }
        }
        if (is) {
            this.setRes(e_card_arr_type.one_arr, arr, arr[0].score);
        }
        return is;
    }

    // 三带1对
    private static is_three2(arr: I_card[]) {
        if (this.isSameScore(arr.slice(0, 3)) && this.isSameScore(arr.slice(3, 5))) {
            this.setRes(e_card_arr_type.three2, arr, arr[0].score);
            return true;
        } else if (this.isSameScore(arr.slice(0, 2)) && this.isSameScore(arr.slice(2, 5))) {
            this.setRes(e_card_arr_type.three2, arr.reverse(), arr[0].score);
            return true;
        } else {
            return false;
        }
    }

    // 双顺
    private static is_two_arr(arr: I_card[]) {
        if (arr.length % 2 !== 0) {
            return false;
        }
        let is = true;
        for (let i = arr.length - 2; i >= 0; i -= 2) {
            if (arr[i].score !== arr[i + 1].score) {
                is = false;
                break;
            }
            if (i < arr.length - 2 && arr[i + 2].score - arr[i].score !== 1) {
                is = false;
                break;
            }
        }
        if (is) {
            this.setRes(e_card_arr_type.two_arr, arr, arr[0].score);
        }
        return is;
    }

    // 三顺
    private static is_three_arr(arr: I_card[], setRes = true) {
        if (arr.length % 3 !== 0) {
            return false;
        }
        let is = true;
        for (let i = arr.length - 3; i >= 0; i -= 3) {
            if (arr[i].score !== arr[i + 1].score || arr[i].score !== arr[i + 2].score) {
                is = false;
                break;
            }
            if (i < arr.length - 3 && arr[i + 3].score - arr[i].score !== 1) {
                is = false;
                break;
            }
        }
        if (is && setRes) {
            this.setRes(e_card_arr_type.three_arr, arr, arr[0].score);
        }
        return is;
    }

    // 四带2
    private static is_four2(arr: I_card[]) {
        if (arr.length === 6) {
            let tmpArr: I_card[];
            if (tmpArr = arr.slice(0, 4), this.isSameScore(tmpArr)) {
                tmpArr.push(arr[4], arr[5]);
                this.setRes(e_card_arr_type.four2, tmpArr, tmpArr[0].score);
                return true;
            } else if (tmpArr = arr.slice(1, 5), this.isSameScore(tmpArr)) {
                tmpArr.push(arr[0], arr[5]);
                this.setRes(e_card_arr_type.four2, tmpArr, tmpArr[0].score);
                return true;
            } else if (tmpArr = arr.slice(2, 6), this.isSameScore(tmpArr)) {
                tmpArr.push(arr[0], arr[1]);
                this.setRes(e_card_arr_type.four2, tmpArr, tmpArr[0].score);
                return true;
            }
        } else if (arr.length === 8) {
            let tmpArr: I_card[];
            if (tmpArr = arr.slice(0, 4), arr[4].score === arr[5].score && arr[6].score === arr[7].score && this.isSameScore(tmpArr)) {
                if (arr[4].score === arr[6].score) {    // 两个炸弹,取大的为4，小的拆为两个对子
                    arr.reverse();
                }
                this.setRes(e_card_arr_type.four2, arr, arr[0].score);
                return true;
            } else if (tmpArr = arr.slice(2, 6), arr[0].score === arr[1].score && arr[6].score === arr[7].score && this.isSameScore(tmpArr)) {
                tmpArr.push(arr[0], arr[1], arr[6], arr[7]);
                this.setRes(e_card_arr_type.four2, tmpArr, tmpArr[0].score);
                return true;
            } else if (tmpArr = arr.slice(4, 8), arr[0].score === arr[1].score && arr[2].score === arr[3].score && this.isSameScore(tmpArr)) {
                tmpArr.push(arr[0], arr[1], arr[2], arr[3]);
                this.setRes(e_card_arr_type.four2, tmpArr, tmpArr[0].score);
                return true;
            }
        }
        return false;
    }

    // 飞机带翅膀
    private static is_three_arr_wing(arr: I_card[]) {
        if (arr.length < 8) {
            return false;
        }
        let obj: { 1: I_card[], 2: I_card[], 3: I_card[] } = { "3": [], "2": [], "1": [] };
        for (let i = 0; i < arr.length;) {
            let count = 1;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j].score === arr[i].score) {
                    count++;
                } else {
                    break;
                }
                if (count === 3) {
                    break;
                }
            }
            (obj as any)[count].push(...arr.slice(i, i + count));
            i += count;
        }
        let len1 = obj["1"].length;
        let len2 = obj["2"].length;
        let len3 = obj["3"].length;
        if (len3 < 2) {
            return false;
        }
        if (len1 === 0 && len2 > 0 && len2 / 2 === len3 / 3) {               // 翅膀为对子
            if (this.is_three_arr(obj["3"], false)) {
                let tmpArr = obj["3"].concat(obj["2"]);
                this.setRes(e_card_arr_type.three_arr_wing, tmpArr, tmpArr[0].score);
                return true;
            } else {
                return false;
            }
        }

        if (len3 / 3 < len1 + len2) {
            return false;
        } else if (len3 / 3 === len1 + len2) {    // 333444555 + 778
            if (this.is_three_arr(obj["3"], false)) {
                obj["2"] = obj["2"].concat(obj["1"]);
                obj["2"].sort((a, b) => {
                    return a.score > b.score ? 1 : -1;
                });
                let tmpArr = obj["3"].concat(obj["2"]);
                this.setRes(e_card_arr_type.three_arr_wing, tmpArr, tmpArr[0].score);
                return true;
            } else {
                return false;
            }
        }
        //检查牌型，需要拆分3个的，如： 333444555 + 888， 333444555666 + 8889
        let tmpLen3 = len3;
        while (tmpLen3 / 3 > len1 + len2 + len3 - tmpLen3) {
            tmpLen3 -= 3;
        }
        if (tmpLen3 / 3 !== len1 + len2 + len3 - tmpLen3) {
            return false;
        }
        obj["3"].reverse();
        let tmpIndex = 0;
        while (true) {
            if (tmpIndex + tmpLen3 > len3) {
                return false;
            }
            if (this.is_three_arr(obj["3"].slice(tmpIndex, tmpIndex + tmpLen3).reverse(), false)) {
                break;
            } else {
                tmpIndex += 3;
            }
        }
        let tmpArrOne = obj["3"].slice(0, tmpIndex).concat(obj["3"].slice(tmpIndex + tmpLen3), obj["2"], obj["1"]);
        tmpArrOne.sort((a, b) => {
            return a.score > b.score ? 1 : -1;
        });
        let tmpArr = obj["3"].slice(tmpIndex, tmpIndex + tmpLen3).reverse().concat(tmpArrOne);
        this.setRes(e_card_arr_type.three_arr_wing, tmpArr, tmpArr[0].score);
        return true;
    }

}


export interface I_cardRes {
    card_arr_type: e_card_arr_type,
    cards: I_card[],
    score: e_card_score,
}


function isBigger(last: I_cardRes, cardArr: I_card[]) {
    if (cardUtil.isWangZha(cardArr)) {
        return true;
    } else if (cardUtil.isZha(cardArr)) {
        if (last.card_arr_type === e_card_arr_type.wang_zha) {
            return false;
        } else if (last.card_arr_type === e_card_arr_type.zha) {
            return cardArr[0].score > last.score;
        } else {
            return true;
        }
    } else if (last.card_arr_type === e_card_arr_type.wang_zha || last.card_arr_type === e_card_arr_type.zha) {
        return false;
    } else if (last.cards.length !== cardArr.length) {
        return false;
    } else {
        // let res = cardUtil.getCardRes(cardArr, last.card_arr_type);
    }
}

// let arr: I_card[] = [
//     { "score": 4 },
//     { "score": 4 },
//     { "score": 4 },
//     { "score": 5 },
//     { "score": 3 },
//     { "score": 3 },
//     { "score": 3 },
//     { "score": 6 },
// ];

// console.log(cardUtil.getCardRes(arr));
