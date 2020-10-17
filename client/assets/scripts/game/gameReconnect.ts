import { cmd } from "../common/cmdClient";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "../common/network";
import { I_gameData, I_roleInfo, PlayerInfo } from "../common/playerInfo";
import { UiMgr } from "../common/uiMgr";
import { GameMain } from "../game/gameMain";
import { GamePanel } from "../game/gamePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class NewClass extends cc.Component {

    private lastTime = 0;
    private times = 0;

    onLoad() {
        network.onOpen(this.svr_onOpen, this);
        network.onClose(this.svr_onClose, this);
        this.lastTime = Date.now();
        this.reConnect();
    }


    svr_onOpen() {
        network.addHandler(cmd.connector_main_reconnectEnter, this.svr_reconnectBack, this);
        network.sendMsg(cmd.connector_main_reconnectEnter, { "uid": PlayerInfo.uid, "token": PlayerInfo.token });
    }

    svr_onClose() {
        this.times++;
        if (this.times >= 4) {
            this.reconnectFail();
        } else {
            this.reConnect();
        }
    }


    reConnect() {
        let diff = Date.now() - this.lastTime;
        if (diff >= 2000) {
            this.lastTime = Date.now();
            network.connect(PlayerInfo.host, PlayerInfo.port);
        } else {
            let later = 2000 - diff;
            this.scheduleOnce(() => {
                this.lastTime = Date.now();
                network.connect(PlayerInfo.host, PlayerInfo.port);
            }, later / 1000);
        }
    }

    svr_reconnectBack(msg: { "code": number, "role": I_roleInfo }) {
        if (msg.code !== 0) {
            network.disconnect();
            this.reconnectFail();
            return;
        }
        PlayerInfo.role = msg.role;
        if (msg.role.roomId) {
            network.addHandler(cmd.info_main_enterRoom, this.svr_enterRoomBack, this);
            network.addHandler(cmd.onGameStart, this.svr_onGameStart, this);
            network.sendMsg(cmd.info_main_enterRoom);
        } else {
            this.toMainScene();
        }
    }

    private svr_enterRoomBack(msg: { "code": number }) {
        if (msg.code !== 0) {
            this.toMainScene();
        }
    }

    private svr_onGameStart(msg: I_gameData) {
        PlayerInfo.gameData = msg;
        GameMain.instance.reconnectBack();
        GamePanel.instance.init();
        this.node.destroy();
    }

    private toMainScene() {
        UiMgr.showSomeInfo("游戏已结束，返回大厅", false, () => {
            cc.director.loadScene("main");
        });
    }

    reconnectFail() {
        UiMgr.showSomeInfo("重连失败,重新登陆", false, () => {
            cc.director.loadScene("login");
        });
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }

}
