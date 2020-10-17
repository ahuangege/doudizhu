// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { I_gamePlayer } from "../common/playerInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameOverPanel extends cc.Component {

    @property(cc.Node)
    private itemParent: cc.Node = null;
    @property(cc.Label)
    private winOrLoseLabel: cc.Label = null;

    init(meChairId: number, dizhuChairId: number, msg: { "winChairId": number, "list": { "chairId": number, "gold": number }[] }, players: { [chairId: number]: { "info": I_gamePlayer, "node": cc.Node } }) {
        for (let one of msg.list) {
            let nodes = this.itemParent.children[one.chairId];
            nodes.children[0].getComponent(cc.Label).string = players[one.chairId].info.nickname;
            nodes.children[1].getComponent(cc.Label).string = one.gold <= 0 ? one.gold.toString() : ("+" + one.gold);
        }
        let meWin = false;
        if (msg.winChairId === dizhuChairId) {
            meWin = dizhuChairId === meChairId;
        } else {
            meWin = dizhuChairId !== meChairId;
        }
        this.winOrLoseLabel.string = meWin ? "胜利" : "失败";
    }

    btn_yes() {
        cc.director.loadScene("main");
    }
}
