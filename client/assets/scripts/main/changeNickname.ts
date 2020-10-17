import { cmd } from "../common/cmdClient";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "../common/network";
import { PlayerInfo } from "../common/playerInfo";
import { UiMgr } from "../common/uiMgr";
import { HallPanel } from "./hallPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start() {
        network.addHandler(cmd.info_main_changeNickname, this.svr_changeNicknameBack, this);
    }

    btn_close() {
        this.node.destroy();
    }

    btn_yes() {
        let str = this.node.getChildByName("nameEdit").getComponent(cc.EditBox).string;
        if (str === "") {
            UiMgr.showSomeInfo("昵称不能为空");
            return;
        }
        if (str === PlayerInfo.role.nickname) {
            UiMgr.showSomeInfo("昵称不能和之前一样");
            return;
        }
        network.sendMsg(cmd.info_main_changeNickname, { "nickname": str });
    }

    svr_changeNicknameBack(msg: { "code": number, "nickname": string }) {
        if (msg.code === 0) {
            PlayerInfo.role.nickname = msg.nickname;
            HallPanel.instance.setNickname();
            this.node.destroy();
        }
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
