import { Application } from "mydog";
import { cmd } from "../../config/cmd";
import { I_matchRole } from "../svr_match/matchMgr";
import { changeConGameState, changeInfoGameState, getInfoId } from "../util/gameUtil";
import { DicObj, randInt, removeFromArr } from "../util/util";
import { cardUtil, e_card_arr_type, e_card_color, e_card_score, I_card, I_cardRes } from "./cardLogic";
import { svr_game } from "./svr_game";

const enum e_roomState {
    decideDizhu = 1,     // 确定地主阶段
    normal = 2,     // 正常出牌阶段
}

let dizhuScoreArr: number[] = [0, 1, 2, 3];    // 抢地主时给出的分数

export class Room {
    private app: Application;
    private roomId: number;
    private state: e_roomState = e_roomState.decideDizhu;    // 房间状态
    private nowChairId: number = 0;    // 当前出牌座位号
    private nowTime: number = 0;   // 当前倒计时
    private lastPlayChairId: number = 0; // 上个打出牌的玩家
    private lastPlayCardRes: I_cardRes = null as any;    // 上个打出牌的牌组信息
    private players: Player[] = [];
    private uidsid: { "uid": number, "sid": string }[] = [];
    private dipai: I_card[] = [];   //  底牌
    private dizhuChairId: number = 0;   // 地主座位号
    private dizhuMaxScore = 0;  //  抢地主时，出的最高分

    constructor(app: Application, roomId: number) {
        this.app = app;
        this.roomId = roomId;
    }

    init(roles: I_matchRole[]) {
        let cardArr = this.getCards();
        let chairId = 0;
        let gameState = { "gameSvr": this.app.serverId, "roomId": this.roomId };
        for (let one of roles) {
            let p = new Player(one);
            p.chairId = chairId++;
            p.cards = cardArr.splice(0, 17);
            p.cards.sort((a, b) => {
                return a.score < b.score ? 1 : -1;
            });

            this.players.push(p);
            this.uidsid.push({ "uid": one.uid, "sid": one.sid });

            changeInfoGameState(one.uid, gameState);
            changeConGameState(one.uid, one.sid, gameState);
        }
        this.dipai = cardArr;


        this.state = e_roomState.decideDizhu;
        this.nowChairId = 0;
        this.nowTime = 20 * 1000;

        this.getMsg(cmd.onGameStart, this.getGameData());
    }

    private getCards() {
        let arr: I_card[] = [];
        let id = 0;
        function push(color: e_card_color) {
            for (let i = 3; i <= 14; i++) {
                arr.push({ "id": id++, "color": color, "score": i });
            }
            arr.push({ "id": id++, "color": color, "score": e_card_score.c2 });
        }
        push(e_card_color.red);
        push(e_card_color.black);
        push(e_card_color.rect);
        push(e_card_color.flower);
        arr.push({ "id": id++, "color": e_card_color.red, "score": e_card_score.kings });
        arr.push({ "id": id++, "color": e_card_color.red, "score": e_card_score.kingb });

        // 打乱
        for (let i = 0; i < arr.length; i++) {
            let index = randInt(arr.length);
            let tmp = arr[index];
            arr[index] = arr[i];
            arr[i] = tmp;
        }
        return arr;
    }


    private getGameData() {
        let players: any[] = [];
        for (let one of this.players) {
            players.push(one.toClientJson());
        }
        let info = {
            "state": this.state,
            "nowChairId": this.nowChairId,
            "nowTime": this.nowTime,
            "dipai": this.dipai,
            "dizhuChairId": this.dizhuChairId,
            "dizhuMaxScore": this.dizhuMaxScore,
            "lastPlayChairId": this.lastPlayChairId,
            "players": players,
        }
        return info;
    }

    update(dt: number) {
        if (this.state === e_roomState.normal) {
            this.nowTime -= dt;
            if (this.nowTime <= 0) {
                let p = this.players[this.nowChairId];
                if (this.nowChairId === this.lastPlayChairId) {
                    this.playCard(p.info.uid, [p.cards[p.cards.length - 1].id], () => { });
                } else {
                    this.playCard(p.info.uid, [], () => { });
                }
            }
            return;
        }

        this.nowTime -= dt;
        if (this.nowTime <= 0) {
            let p = this.players[this.nowChairId];
            this.qiangDizhu(p.info.uid, 0);
        }
    }

    private getMsg(route: string, msg: any = null) {
        this.app.sendMsgByUidSid(route, msg, this.uidsid);
    }

    private getPlayer(uid: number) {
        let p: Player = null as any;
        for (let one of this.players) {
            if (one.info.uid === uid) {
                p = one;
                break;
            }
        }
        return p;
    }

    private getNextChairId(chairId: number) {
        if (chairId === 2) {
            return 0;
        } else {
            return chairId + 1;
        }
    }

    // 抢地主
    qiangDizhu(uid: number, score: number) {
        if (this.state !== e_roomState.decideDizhu) {
            return;
        }
        let p = this.getPlayer(uid);
        if (p.chairId !== this.nowChairId) {
            return;
        }
        if (dizhuScoreArr.indexOf(score) === -1) {
            return;
        }
        if (score !== 0 && score <= this.dizhuMaxScore) {
            return;
        }
        if (score > this.dizhuMaxScore) {
            this.dizhuMaxScore = score;
        }
        p.dizhuScore = score;

        if (score === 3) {
            this.dizhuOk(p.chairId);
            this.getMsg(cmd.onQiangDizhu, { "score": score, "dizhuChairId": this.dizhuChairId });
            return;
        }
        let nextChairId = this.getNextChairId(p.chairId);
        let nextP = this.players[nextChairId];
        if (nextP.dizhuScore === -1) {
            this.nowChairId = nextChairId;
            this.nowTime = 20 * 1000;
            this.getMsg(cmd.onQiangDizhu, { "score": score, "dizhuChairId": -1 });
            return;
        }
        if (this.dizhuMaxScore === 0) {
            this.dizhuOk(0);
            this.getMsg(cmd.onQiangDizhu, { "score": score, "dizhuChairId": this.dizhuChairId });
            return;
        }
        for (let one of this.players) {
            if (one.dizhuScore === this.dizhuMaxScore) {
                this.dizhuOk(one.chairId);
                this.getMsg(cmd.onQiangDizhu, { "score": score, "dizhuChairId": this.dizhuChairId });
                break;
            }
        }
    }

    private dizhuOk(chairId: number) {
        this.state = e_roomState.normal;
        this.dizhuChairId = chairId;
        this.nowChairId = chairId;
        this.nowTime = 20 * 1000;
        this.lastPlayChairId = chairId;
        let p = this.players[chairId];
        p.cards.push(...this.dipai);
        p.cards.sort((a, b) => {
            return a.score < b.score ? 1 : -1;
        });
    }

    // 出牌
    playCard(uid: number, cardIds: number[], next: Function) {
        if (this.state !== e_roomState.normal) {
            return;
        }
        let p = this.getPlayer(uid);
        if (p.chairId !== this.nowChairId) {    // 未轮到出牌
            return;
        }
        cardIds = Array.from(new Set(cardIds));     // id去重

        if (cardIds.length === 0) { // 不要
            if (p.chairId === this.lastPlayChairId) {   // 直接出牌时，不能过
                return;
            }
            p.lastPlayCard = [];
            this.nowChairId = this.getNextChairId(p.chairId);
            this.nowTime = 20 * 1000;
            let cardRes: I_cardRes = { "card_arr_type": e_card_arr_type.none, "cards": [], "score": 0 };
            this.getMsg(cmd.onPlayCard, { "cardRes": cardRes, "isOver": false });
            return;
        }

        // 找出牌组
        let cardArr: I_card[] = [];
        for (let id of cardIds) {
            let find = false;
            for (let one of p.cards) {
                if (one.id === id) {
                    cardArr.push(one);
                    find = true;
                    break;
                }
            }
            if (!find) {
                return;
            }
        }
        cardArr.sort((a, b) => {   // 从小到大排序
            return a.score > b.score ? 1 : -1;
        });

        if (this.lastPlayChairId === p.chairId) { // 直接出牌
            let cardRes = cardUtil.getCardRes(cardArr);
            if (cardRes.card_arr_type === e_card_arr_type.none) {
                next({ "code": 1, "info": "非法牌组" })
                return;
            }
            this.playCardOk(p, cardRes);
            return;
        }

        // 必须比上家大
        let res = this.isBigger(cardArr);
        if (!res.bigger) {
            next({ "code": 2, "info": "非法牌组或要不起" })
            return;
        }
        this.playCardOk(p, res.cardRes);
    }

    private playCardOk(p: Player, cardRes: I_cardRes) { //出牌合法
        this.lastPlayChairId = p.chairId;
        this.lastPlayCardRes = cardRes;
        this.nowChairId = this.getNextChairId(p.chairId);
        this.nowTime = 20 * 1000;
        for (let one of cardRes.cards) {
            removeFromArr(p.cards, one);
        }
        p.lastPlayCard = cardRes.cards;
        let isOver = false;
        if (p.cards.length === 0) { //游戏结束
            isOver = true;
        }
        this.getMsg(cmd.onPlayCard, { "cardRes": cardRes, "isOver": isOver });

        if (isOver) {
            this.jiesuan(p.chairId);
        }
    }
    private jiesuan(winChairId: number) {
        let list: { "chairId": number, "gold": number }[] = [];
        let dizhuP = this.players[this.dizhuChairId];
        if (winChairId === this.dizhuChairId) {   // 地主胜
            let gold = 0;
            for (let one of this.players) {
                if (one !== dizhuP) {
                    let tmpGold = 0;
                    if (one.info.gold >= 10) {
                        tmpGold = 10;
                    } else {
                        tmpGold = one.info.gold;
                    }
                    gold += tmpGold;
                    this.app.rpc(getInfoId(one.info.uid)).info.main.gameOver({ "uid": one.info.uid, "isWin": false, "addGold": -tmpGold });
                    list.push({ "chairId": one.chairId, "gold": -tmpGold });
                }
            }
            this.app.rpc(getInfoId(dizhuP.info.uid)).info.main.gameOver({ "uid": dizhuP.info.uid, "isWin": true, "addGold": gold });
            list.push({ "chairId": dizhuP.chairId, "gold": gold });

        } else {    // 农民胜
            let gold = 0;
            if (dizhuP.info.gold >= 20) {
                gold = 20;
            } else {
                gold = dizhuP.info.gold;
            }
            let halfGold = Math.floor(gold / 2);
            for (let one of this.players) {
                if (one !== dizhuP) {
                    this.app.rpc(getInfoId(one.info.uid)).info.main.gameOver({ "uid": one.info.uid, "isWin": true, "addGold": halfGold });
                    list.push({ "chairId": one.chairId, "gold": halfGold });
                }
            }
            this.app.rpc(getInfoId(dizhuP.info.uid)).info.main.gameOver({ "uid": dizhuP.info.uid, "isWin": false, "addGold": -gold });
            list.push({ "chairId": dizhuP.chairId, "gold": -gold });
        }

        this.getMsg(cmd.onGameOver, { "winChairId": winChairId, "list": list });
        svr_game.roomMgr.delRoom(this.roomId);
    }

    private isBigger(cardArr: I_card[]): { "bigger": boolean, "cardRes": I_cardRes } {
        if (cardUtil.isWangZha(cardArr)) {
            return { "bigger": true, "cardRes": { "card_arr_type": e_card_arr_type.wang_zha, "score": e_card_score.kings, "cards": cardArr } };
        }
        let last = this.lastPlayCardRes;
        if (cardUtil.isZha(cardArr)) {
            if (last.card_arr_type === e_card_arr_type.wang_zha) {
                return { "bigger": false, "cardRes": null as any };
            } else if (last.card_arr_type === e_card_arr_type.zha) {
                if (cardArr[0].score > last.score) {
                    return { "bigger": true, "cardRes": { "card_arr_type": e_card_arr_type.zha, "score": cardArr[0].score, "cards": cardArr } };
                } else {
                    return { "bigger": false, "cardRes": null as any };
                }
            } else {
                return { "bigger": true, "cardRes": { "card_arr_type": e_card_arr_type.zha, "score": cardArr[0].score, "cards": cardArr } };
            }
        }

        if (last.card_arr_type === e_card_arr_type.wang_zha || last.card_arr_type === e_card_arr_type.zha) {
            return { "bigger": false, "cardRes": null as any };
        } else if (last.cards.length !== cardArr.length) {
            return { "bigger": false, "cardRes": null as any };
        } else {
            let cardRes = cardUtil.isCardType(cardArr, last.card_arr_type);
            if (cardRes.card_arr_type === e_card_arr_type.none) {
                return { "bigger": false, "cardRes": null as any };
            } else if (cardRes.score > last.score) {
                return { "bigger": true, "cardRes": cardRes };
            } else {
                return { "bigger": false, "cardRes": null as any };
            }
        }
    }

    // 离开房间
    leave(uid: number) {
        let p = this.getPlayer(uid);
        p.info.sid = "";
        for (let i = 0; i < this.uidsid.length; i++) {
            if (this.uidsid[i].uid === uid) {
                this.uidsid.splice(i, 1)
                break;
            }
        }
    }

    // 重新进入房间
    enter(info: { "uid": number, "sid": string }) {
        let p = this.getPlayer(info.uid);
        if (!p) {
            return false;
        }
        p.info.sid = info.sid;
        for (let i = 0; i < this.uidsid.length; i++) {
            if (this.uidsid[i].uid === info.uid) {
                this.uidsid.splice(i, 1)
                break;
            }
        }
        this.uidsid.push(info);
        this.app.sendMsgByUidSid(cmd.onGameStart, this.getGameData(), [info]);
        return true;
    }
}


class Player {
    info: I_matchRole;
    chairId: number = 0;    // 座位号
    cards: I_card[] = [];   // 手中牌组
    dizhuScore: number = -1;  // 抢地主时给出的的分数  (-1还未抢，0不要，1、2、3分)
    lastPlayCard: I_card[] = [];    // 上一次出的牌
    constructor(info: I_matchRole) {
        this.info = info;
    }

    toClientJson() {
        return {
            "uid": this.info.uid,
            "nickname": this.info.nickname,
            "gold": this.info.gold,
            "chairId": this.chairId,
            "cards": this.cards,
            "lastCards": this.lastPlayCard,
        }
    }
}