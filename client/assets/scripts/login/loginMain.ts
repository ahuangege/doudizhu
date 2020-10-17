// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UiMgr, uiPanel } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class LoginMain extends cc.Component {
    public static instance: LoginMain = null;

    @property(cc.String)
    host: string = "127.0.0.1";
    @property(cc.Integer)
    port: number = 4001;

    start() {
        LoginMain.instance = this;
        UiMgr.showPanel(uiPanel.loginPanel);
    }


}
