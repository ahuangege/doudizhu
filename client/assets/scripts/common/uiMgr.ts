// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { SomeInfo } from "./someInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export class UiMgr extends cc.Component {
    private static node: cc.Node = null;

    onLoad() {
        UiMgr.node = this.node;
    }

    // 加载界面
    static showPanel(url: string, cb?: (node: cc.Node) => void) {
        cc.resources.load("uiPanel/" + url, (err, res: cc.Prefab) => {
            if (err) {
                console.error(err);
                return cb && cb(null);
            }
            let node = cc.instantiate(res);
            node.parent = this.node;
            cb && cb(node);
        });
    }

    // 弹窗信息
    static showSomeInfo(info: string, showCloseBtn = true, yesCb?: () => void) {
        this.showPanel(uiPanel.someInfoPanel, (node) => {
            node.getComponent(SomeInfo).init(info, showCloseBtn, yesCb);
        });
    }
}


export const enum uiPanel {
    loginPanel = "loginPanel",  // 登录界面
    someInfoPanel = "someInfoPanel",  // 信息弹窗界面
    hallPanel = "hall/hallPanel",    // 大厅主界面
    changeNicknamePanel = "hall/changeNicknamePanel",    //修改昵称
    hallReconnectPanel = "hall/hallReconnectPanel",  // 大厅重连
    gamePanel = "game/gamePanel",    // 游戏界面
    gameWarnPanel = "hall/gameWarnPanel",    // 还有游戏
    gameReconnectPanel = "game/gameReconnectPanel",    // 游戏内重连
    gameOverPanel = "game/gameOverPanel",    // 游戏结算
}