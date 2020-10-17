// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "../common/network";
import { UiMgr, uiPanel } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class HallMain extends cc.Component {
    public static instance: HallMain = null;


    onLoad() {
        HallMain.instance = this;
        network.onClose(this.svr_onConClose, this);
    }

    start() {
        UiMgr.showPanel(uiPanel.hallPanel);
    }

    private svr_onConClose() {
        console.log("hall con close");
        UiMgr.showPanel(uiPanel.hallReconnectPanel);
    }

    update(dt) {
        network.readMsg();
    }

    // 重连成功
    reconnectBack() {
        network.onClose(this.svr_onConClose, this);
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
