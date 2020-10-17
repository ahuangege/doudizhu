// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
import { PlayerInfo } from "../common/playerInfo";
import { UiMgr, uiPanel } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameMain extends cc.Component {
    public static instance: GameMain = null;


    onLoad() {
        GameMain.instance = this;
        network.onClose(this.svr_onConClose, this);
    }

    start() {
        UiMgr.showPanel(uiPanel.gamePanel);

        network.addHandler(cmd.onGoldChanged, this.svr_onGoldChanged, this);
        network.addHandler(cmd.onWinInfo, this.svr_onWinInfo, this);
    }

    private svr_onConClose() {
        console.log("game con close");
        UiMgr.showPanel(uiPanel.gameReconnectPanel);
    }

    update(dt) {
        network.readMsg();
    }

    // 重连成功
    reconnectBack() {
        network.onClose(this.svr_onConClose, this);
    }

    private svr_onGoldChanged(msg: { "gold": number }) {
        PlayerInfo.role.gold = msg.gold;
    }

    private svr_onWinInfo(msg: { "isWin": boolean }) {
        let gameInfo = PlayerInfo.role.gameInfo;
        gameInfo.all++;
        if (msg.isWin) {
            gameInfo.win++;
        }
    }


    onDestroy() {
        network.removeThisHandlers(this);
    }
}
