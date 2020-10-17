// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CardSelect } from "./cardSelect";

const { ccclass, property } = cc._decorator;

@ccclass
export class CardPrefab extends cc.Component {
    @property(cc.Sprite)
    private colorSprite: cc.Sprite = null;
    @property(cc.Sprite)
    private scoreSprite: cc.Sprite = null;

    id: number = 0;

    init(info: I_card) {
        this.id = info.id;
        this.node.y = CardSelect.instance.baseY;
        this.node.name = info.id.toString();

        cc.resources.load("imgs/color/" + info.color, cc.SpriteFrame, (err, img: cc.SpriteFrame) => {
            if (err || !cc.isValid(this)) {
                return;
            }
            this.colorSprite.spriteFrame = img;
        });
        if (info.score === e_card_score.kings || info.score === e_card_score.kingb) {
            this.colorSprite.node.active = false;
        }

        let str = "";
        if (info.color === e_card_color.black || info.color === e_card_color.flower) {
            str = "imgs/numB/" + info.score;
        } else {
            str = "imgs/numR/" + info.score;
        }
        cc.resources.load(str, cc.SpriteFrame, (err, img: cc.SpriteFrame) => {
            if (err || !cc.isValid(this)) {
                return;
            }
            this.scoreSprite.spriteFrame = img;
        });
    }
}


export interface I_card {
    id: number,
    color: e_card_color,
    score: e_card_score,
}

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