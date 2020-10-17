// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
import { UiMgr } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start() {
        network.addHandler(cmd.info_main_enterRoom, this.svr_enterRoomBack, this);
    }

    btn_yes() {
        network.sendMsg(cmd.info_main_enterRoom);
    }

    private svr_enterRoomBack(msg: { "code": number }) {
        if (msg.code === 1) {
            UiMgr.showSomeInfo("房间不存在");
        } else if (msg.code === 2) {
            UiMgr.showSomeInfo("服务器错误");
        }
    }


    btn_close() {
        this.node.destroy();
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
