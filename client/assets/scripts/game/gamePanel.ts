// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
import { e_roomState, I_gamePlayer, PlayerInfo } from "../common/playerInfo";
import { UiMgr, uiPanel } from "../common/uiMgr";
import { CardPrefab, e_card_arr_type, e_card_score, I_card } from "./cardPrefab";
import { CardSelect } from "./cardSelect";
import { GameOverPanel } from "./gameOverPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class GamePanel extends cc.Component {
    public static instance: GamePanel = null;

    @property(cc.Prefab)
    private cardPrefab: cc.Prefab = null;

    private meChairId: number = 0;
    @property(cc.Node)
    private normalBtns: cc.Node = null;
    @property(cc.Node)
    private qiangdizhuBtns: cc.Node = null;

    private state: e_roomState = e_roomState.decideDizhu;
    private nowTime: number = 0;
    private nowTimeInt: number = -1;
    private nowChairId: number = 0;
    private dipai: I_card[] = [];
    private players: { [chairId: number]: { "info": I_gamePlayer, "node": cc.Node } } = {};
    private qiangDizhuMaxScore: number = 0;
    private dizhuChairId: number = 0;
    private lastPlayChairId: number = 0;
    private nowClockLabel: cc.Label = null;
    private isGameOver: boolean = false;

    onLoad() {
        GamePanel.instance = this;
    }

    start() {

        network.addHandler(cmd.onQiangDizhu, this.svr_onQiangDizhu, this);
        network.addHandler(cmd.onPlayCard, this.svr_onPlayCard, this);
        network.addHandler(cmd.onGameOver, this.svr_onGameOver, this);

        this.init();
    }

    init() {
        let data = PlayerInfo.gameData;
        let self = this;
        this.state = data.state;
        this.nowTime = data.nowTime;
        this.nowChairId = data.nowChairId;
        this.qiangDizhuMaxScore = data.dizhuMaxScore;
        this.dizhuChairId = data.dizhuChairId;
        this.lastPlayChairId = data.lastPlayChairId;
        this.dipai = data.dipai;
        for (let one of data.players) {
            if (one.uid === PlayerInfo.uid) {
                this.meChairId = one.chairId;
                break;
            }
        }
        for (let one of data.players) {
            let node = this.node.getChildByName("player" + getNodeId(one.chairId));
            this.players[one.chairId] = { "info": one, "node": node };

            node.getChildByName("left").getComponent(cc.Label).string = "x" + one.cards.length;
            node.getChildByName("clock").active = one.chairId === this.nowChairId;
            node.getChildByName("noCards").active = false;
            if (one.chairId == this.meChairId) {
                cc.find("meInfo/nickname", this.node).getComponent(cc.Label).string = one.nickname;
                cc.find("meInfo/gold", this.node).getComponent(cc.Label).string = "金币:" + one.gold;
            } else {
                cc.find("info/nickname", node).getComponent(cc.Label).string = one.nickname;
                cc.find("info/gold", node).getComponent(cc.Label).string = "金币:" + one.gold;
            }

            let cardsNode = node.getChildByName("cards");
            delChildren(cardsNode);
            if (this.state === e_roomState.normal && one.lastCards.length === 0) {
                node.getChildByName("noCards").active = true;
            } else {
                for (let card of one.lastCards) {
                    this.newCard(card, cardsNode);
                }
            }


            if (one.chairId === this.nowChairId) {
                let clock = node.getChildByName("clock");
                clock.active = true;
                this.nowClockLabel = clock.children[0].getComponent(cc.Label);
            }
        }

        if (this.state === e_roomState.normal) {
            this.setDizhu(this.dizhuChairId);
        }

        let meCardNode = CardSelect.instance.node;
        delChildren(meCardNode);
        CardSelect.instance.reset();
        for (let card of this.players[this.meChairId].info.cards) {
            this.newCard(card, meCardNode);
        }

        if (this.meChairId === this.nowChairId) {
            if (this.state === e_roomState.decideDizhu) {
                this.meTo_qiangDizhu();
            } else {
                this.qiangdizhuBtns.active = false;
                this.normalBtns.active = true;
                this.players[this.meChairId].node.getChildByName("noCards").active = false;
                delChildren(this.players[this.meChairId].node.getChildByName("cards"));
            }
        } else {
            this.qiangdizhuBtns.active = false;
            this.normalBtns.active = false;
        }

        function getNodeId(chairId: number) {
            let id = chairId - self.meChairId;
            if (id < 0) {
                id += 3;
            }
            return id;
        }
    }

    private getNextChairId(chairId: number) {
        if (chairId === 2) {
            return 0;
        } else {
            return chairId + 1;
        }
    }


    private newCard(card: I_card, parent: cc.Node) {
        let tmpNode = cc.instantiate(this.cardPrefab);
        tmpNode.parent = parent;
        tmpNode.getComponent(CardPrefab).init(card);
    }

    update(dt: number) {
        if (this.isGameOver) {
            return;
        }
        this.nowTime -= dt * 1000;
        let tmpInt = Math.floor(this.nowTime / 1000);
        if (tmpInt !== this.nowTimeInt && tmpInt >= 0) {
            this.nowTimeInt = tmpInt;
            this.nowClockLabel.string = tmpInt.toString();
        }
    }

    private btn_qiangDizhu(touch, scoreStr: string) {
        let score = parseInt(scoreStr);
        network.sendMsg(cmd.game_main_qiangDizhu, { "score": score });
    }

    private btn_playCard() {
        let ids = CardSelect.instance.getSelectedCards();
        if (ids.length === 0) {
            return;
        }
        network.sendMsg(cmd.game_main_playCard, { "ids": ids });
    }

    private btn_playNoCard() {
        if (this.lastPlayChairId === this.meChairId) {
            return;
        }
        network.sendMsg(cmd.game_main_playCard, { "ids": [] });
    }

    private meTo_qiangDizhu() {
        this.qiangdizhuBtns.active = true;
        this.normalBtns.active = false;
        if (this.qiangDizhuMaxScore === 1) {
            this.qiangdizhuBtns.getChildByName("1").active = false;
        } else if (this.qiangDizhuMaxScore === 2) {
            this.qiangdizhuBtns.getChildByName("1").active = false;
            this.qiangdizhuBtns.getChildByName("2").active = false;
        }
    }

    private setDizhu(chairId: number) {
        this.dizhuChairId = chairId;
        this.players[chairId].node.getChildByName("dizhu").active = true;
    }


    private svr_onQiangDizhu(msg: { "score": number, "dizhuChairId": number }) {
        this.players[this.nowChairId].node.getChildByName("clock").active = false;
        if (this.nowChairId === this.meChairId) {
            this.qiangdizhuBtns.active = false;
        }
        if (msg.dizhuChairId !== -1) {
            this.state = e_roomState.normal;
            this.setDizhu(msg.dizhuChairId);
            this.lastPlayChairId = this.dizhuChairId;
            this.nowChairId = msg.dizhuChairId;

            let p = this.players[this.nowChairId];
            p.info.cards.push(...this.dipai);
            p.node.getChildByName("left").getComponent(cc.Label).string = "x" + p.info.cards.length;

            let dipaiParent = this.node.getChildByName("dipai");
            delChildren(dipaiParent);
            for (let one of this.dipai) {
                this.newCard(one, dipaiParent);
            }

            this.nowTime = 20 * 1000;
            let node = p.node.getChildByName("clock");
            node.active = true;
            this.nowClockLabel = node.children[0].getComponent(cc.Label);

            if (msg.dizhuChairId === this.meChairId) {
                this.normalBtns.active = true;
                let cardsArr = p.info.cards;
                cardsArr.sort((a, b) => {
                    return a.score < b.score ? 1 : -1;
                });

                let meCardNode = CardSelect.instance.node;
                for (let one of this.dipai) {
                    this.newCard(one, meCardNode);
                }

                for (let i = 0; i < cardsArr.length; i++) {
                    meCardNode.getChildByName(cardsArr[i].id.toString()).setSiblingIndex(i);
                }

            }
        } else {
            if (msg.score > this.qiangDizhuMaxScore) {
                this.qiangDizhuMaxScore = msg.score;
            }
            this.nowChairId = this.getNextChairId(this.nowChairId);
            this.nowTime = 20 * 1000;
            let node = this.players[this.nowChairId].node.getChildByName("clock");
            node.active = true;
            this.nowClockLabel = node.children[0].getComponent(cc.Label);
            if (this.nowChairId === this.meChairId) {
                this.meTo_qiangDizhu();
            }

        }

    }

    private removeCardById(cards: I_card[], id: number) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].id === id) {
                cards.splice(i, 1);
                break;
            }
        }
    }
    private svr_onPlayCard(msg: { "cardRes": I_cardRes, "isOver": boolean }) {
        let info = this.players[this.nowChairId];
        info.node.getChildByName("clock").active = false;
        for (let one of msg.cardRes.cards) {
            this.newCard(one, info.node.getChildByName("cards"));
        }
        if (this.nowChairId === this.meChairId) {
            this.normalBtns.active = false;
        }
        let cards = msg.cardRes.cards;
        if (cards.length > 0) {
            for (let one of cards) {
                this.removeCardById(info.info.cards, one.id);
            }
            if (this.nowChairId === this.meChairId) {
                CardSelect.instance.delCards(cards);
            }
            this.lastPlayChairId = this.nowChairId;
            info.node.getChildByName("left").getComponent(cc.Label).string = "x" + info.info.cards.length;
        } else {
            info.node.getChildByName("noCards").active = true;
        }

        if (msg.isOver) {
            return;
        }
        this.nowChairId = this.getNextChairId(this.nowChairId);
        this.nowTime = 20 * 1000;
        let node = this.players[this.nowChairId].node.getChildByName("clock");
        node.active = true;
        this.nowClockLabel = node.children[0].getComponent(cc.Label);
        delChildren(node.parent.getChildByName("cards"));
        node.parent.getChildByName("noCards").active = false;
        if (this.nowChairId === this.meChairId) {
            this.normalBtns.active = true;
        }
    }

    private svr_onGameOver(msg: { "winChairId": number, "list": { "chairId": number, "gold": number }[] }) {
        this.isGameOver = true;
        UiMgr.showPanel(uiPanel.gameOverPanel, (node) => {
            node.getComponent(GameOverPanel).init(this.meChairId, this.dizhuChairId, msg, this.players);
        });
    }

    btn_leave() {
        UiMgr.showSomeInfo("返回大厅吗", true, () => {
            network.sendMsg(cmd.game_main_leave);
            cc.director.loadScene("main");
        });
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }

}


function delChildren(node: cc.Node) {
    for (let one of node.children) {
        one.destroy();
    }
}


interface I_cardRes {
    card_arr_type: e_card_arr_type,
    cards: I_card[],
    score: e_card_score,
}