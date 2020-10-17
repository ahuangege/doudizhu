import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { I_gameData, PlayerInfo } from "../common/playerInfo";
import { UiMgr, uiPanel } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class HallPanel extends cc.Component {
    public static instance: HallPanel = null;
    private isMatching = false;
    @property(cc.Label)
    private matchLabel: cc.Label = null;
    onLoad() {
        HallPanel.instance = this;
    }

    start() {
        this.setNickname();
        this.setGold();
        this.setGameInfo();
        network.addHandler(cmd.info_main_match, this.svr_matchBack, this);
        network.addHandler(cmd.match_main_cancelMatch, this.svr_cancelMatchBack, this);
        network.addHandler(cmd.onGameStart, this.svr_onGameStart, this);
        network.addHandler(cmd.onGoldChanged, this.svr_onGoldChanged, this);
        network.addHandler(cmd.onWinInfo, this.svr_onWinInfo, this);
    }

    setNickname() {
        cc.find("left/nickname", this.node).getComponent(cc.Label).string = PlayerInfo.role.nickname;
    }

    setGold() {
        cc.find("left/gold", this.node).getComponent(cc.Label).string = "金币:" + PlayerInfo.role.gold;
    }

    setGameInfo() {
        let winPro = "--";
        let gameInfo = PlayerInfo.role.gameInfo;
        if (gameInfo.all !== 0) {
            winPro = Math.round(gameInfo.win / gameInfo.all * 100) + "%";
        }
        cc.find("left/gameInfo", this.node).getComponent(cc.Label).string = "总:" + PlayerInfo.role.gameInfo.all + " 胜:" + PlayerInfo.role.gameInfo.win +
            " 胜率:" + winPro;
    }

    private btn_changeNickname() {
        UiMgr.showPanel(uiPanel.changeNicknamePanel);
    }


    private btn_matchOrNot() {
        if (this.isMatching) {
            network.sendMsg(cmd.match_main_cancelMatch);
        } else {
            network.sendMsg(cmd.info_main_match);
        }
    }

    private svr_matchBack(msg: { "code": number }) {
        // console.log(msg);
        if (msg.code === 0) {
            this.isMatching = true;
            this.matchLabel.string = "取消匹配";
        } else if (msg.code === 1) {
            UiMgr.showPanel(uiPanel.gameWarnPanel);
        }
    }

    private svr_cancelMatchBack(msg: { "code": number }) {
        this.isMatching = false;
        this.matchLabel.string = "匹配";
    }

    private svr_onGameStart(msg: I_gameData) {
        PlayerInfo.gameData = msg;
        cc.director.loadScene("game");
    }

    private svr_onGoldChanged(msg: { "gold": number }) {
        PlayerInfo.role.gold = msg.gold;
        this.setGold();
    }

    private svr_onWinInfo(msg: { "isWin": boolean }) {
        let gameInfo = PlayerInfo.role.gameInfo;
        gameInfo.all++;
        if (msg.isWin) {
            gameInfo.win++;
        }
        this.setGameInfo();
    }


    onDestroy() {
        network.removeThisHandlers(this);
    }

}
