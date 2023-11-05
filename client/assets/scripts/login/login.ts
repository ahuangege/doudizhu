import { cmd } from "../common/cmdClient";
import { LoginMain } from "./loginMain";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { network } from "../common/network";
import { UiMgr } from "../common/uiMgr";
import { I_roleInfo, PlayerInfo } from "../common/playerInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    @property(cc.EditBox)
    private accountEdit: cc.EditBox = null;
    @property(cc.EditBox)
    private passwordEdit: cc.EditBox = null;

    private isLogining = false;

    btn_login() {
        if (this.accountEdit.string === "") {
            return UiMgr.showSomeInfo("账号不能为空");
        }
        if (this.isLogining) {
            return;
        }
        this.isLogining = true;
        network.onOpen(this.svr_onGateOpen, this);
        network.onClose(this.svr_onGateClose, this);
        network.connect(LoginMain.instance.host, LoginMain.instance.port);
    }

    update() {
        network.readMsg();
    }

    // gate服连接成功，登录
    svr_onGateOpen() {
        network.addHandler(cmd.gate_main_login, this.svr_gateLoginBack, this);
        network.sendMsg(cmd.gate_main_login, { "username": this.accountEdit.string, "password": this.passwordEdit.string });
    }

    // gate服断开连接
    svr_onGateClose() {
        this.isLogining = false;
        console.log("gate close");
        UiMgr.showSomeInfo("服务器错误");
    }

    // 登录回调
    svr_gateLoginBack(msg: { "code": number, "host": string, "port": number, "uid": number, "token": number }) {
        if (msg.code === 0) {
            PlayerInfo.host = msg.host;
            PlayerInfo.port = msg.port;
            PlayerInfo.uid = msg.uid;
            PlayerInfo.token = msg.token;
            network.onOpen(this.svr_onConOpen, this);
            network.onClose(this.svr_onConClose, this);
            network.connect(msg.host, msg.port);
        } else if (msg.code === 1) {
            this.isLogining = false;
            UiMgr.showSomeInfo("密码错误");
            network.disconnect();
        } else {
            this.isLogining = false;
            UiMgr.showSomeInfo("服务器错误");
            network.disconnect();
        }
    }

    // 网关服连接成功
    svr_onConOpen() {
        network.addHandler(cmd.connector_main_enter, this.svr_onEnterBack, this);
        network.sendMsg(cmd.connector_main_enter, { "uid": PlayerInfo.uid, "token": PlayerInfo.token });
    }

    // 网关服断开连接
    svr_onConClose() {
        this.isLogining = false;
        console.log("con close");
        UiMgr.showSomeInfo("服务器错误");
    }

    // 网关服登入回调
    svr_onEnterBack(msg: I_roleInfo) {
        // console.log(msg);
        if (msg.code !== 0) {
            this.isLogining = false;
            UiMgr.showSomeInfo("服务器错误");
            network.disconnect();
            return;
        }
        PlayerInfo.role = msg;
        cc.director.loadScene("main");
    }

    onDestroy() {
        network.removeThisHandlers(this);
    }
}
