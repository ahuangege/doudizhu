// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CardPrefab, I_card } from "./cardPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class CardSelect extends cc.Component {
    public static instance: CardSelect = null;

    public baseY = 50;    // 基础 y
    private width = 126;    // 牌宽度
    private height = 163;   // 牌高度
    private startCard: cc.Node = null;
    private endCard: cc.Node = null;

    onLoad() {
        CardSelect.instance = this;
    }
    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touch_start, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touch_end, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touch_end, this);
    }

    reset() {
        this.startCard = null;
        this.endCard = null;
    }

    private touch_start(e: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        let card = this.getCardPosAt(pos);
        if (!card) {
            return;
        }
        this.startCard = card;
        this.endCard = card;
        card.getChildByName("grey").active = true;

    }

    private touch_move(e: cc.Event.EventTouch) {
        if (!this.startCard) {
            return;
        }
        let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        let card = this.getCardPosAt(pos);
        if (!card || card === this.endCard) {
            return;
        }

        let children = this.node.children;
        let indexArr = this.getIndexArr(this.startCard, this.endCard);
        for (let i = indexArr[0]; i <= indexArr[1]; i++) {
            children[i].getChildByName("grey").active = false;
        }

        this.endCard = card;
        indexArr = this.getIndexArr(this.startCard, this.endCard);
        for (let i = indexArr[0]; i <= indexArr[1]; i++) {
            children[i].getChildByName("grey").active = true;
        }
    }



    private touch_end(e: cc.Event.EventTouch) {
        let children = this.node.children;
        if (!this.startCard) {
            for (let one of children) {
                one.y = this.baseY;
            }
            return;
        }
        let indexArr = this.getIndexArr(this.startCard, this.endCard);
        for (let i = indexArr[0]; i <= indexArr[1]; i++) {
            let node = children[i];
            node.getChildByName("grey").active = false;
            node.y = node.y === this.baseY ? this.baseY + 30 : this.baseY;
        }
        this.startCard = null;
        this.endCard = null;
    }


    // 获取点在哪张牌上
    private getCardPosAt(pos: cc.Vec2) {
        let children = this.node.children;
        for (let i = children.length - 1; i >= 0; i--) {    // 注意，必须从UI最上层的牌开始遍历
            let node = children[i];
            if (pos.x >= node.x && pos.x <= node.x + this.width && pos.y >= node.y && pos.y <= node.y + this.height) {
                return node;
            }
        }
        return null;
    }

    // 排序号
    private getIndexArr(node1: cc.Node, node2: cc.Node) {
        let index1 = node1.getSiblingIndex();
        let index2 = node2.getSiblingIndex();
        if (index1 <= index2) {
            return [index1, index2];
        } else {
            return [index2, index1];
        }
    }

    getSelectedCards() {
        let ids: number[] = [];
        for (let one of this.node.children) {
            if (one.y != this.baseY) {
                ids.push(one.getComponent(CardPrefab).id);
            }
        }
        return ids;
    }

    delCards(cards: I_card[]) {
        for (let one of cards) {
            let node = this.node.getChildByName(one.id.toString());
            if (node) {
                node.destroy();
            }
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touch_start, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touch_end, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touch_end, this);
    }
}
