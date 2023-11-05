import { Application } from "mydog";
import { RoleMgr } from "../../../app/svr_info/roleMgr";
import { svr_info } from "../../../app/svr_info/svr_info";
import { I_gameState } from "../../../app/util/gameUtil";
import { I_roleAllInfoClient } from "../../../app/util/someInterface";

declare global {
    interface Rpc {
        info: {
            main: Remote,
        }
    }
}

export default class Remote {
    private app: Application;
    private roleMgr: RoleMgr;
    constructor(app: Application) {
        this.app = app;
        this.roleMgr = svr_info.roleMgr;
    }

    /**
     * 进入游戏
     */
    async enterServer(uid: number, sid: string, token: number): Promise<I_roleAllInfoClient> {
        return await this.roleMgr.enterServer(uid, sid, token);
    }

    /**
     * 重连
     */
    async reconnectEntry(uid: number, sid: string, token: number): Promise<I_roleAllInfoClient> {
        return this.roleMgr.reconnectEntry(uid, sid, token);
    }

    /**
     * 掉线
     */
    offline(uid: number) {
        this.roleMgr.getRole(uid).offline();
    }

    setGameState(uid: number, gameState: I_gameState) {
        let role = this.roleMgr.getRole(uid);
        role.changeRoleMem(gameState);
    }

    gameOver(info: { "uid": number, "isWin": boolean, "addGold": number }) {
        let role = this.roleMgr.getRole(info.uid);
        role.gameOver(info);
    }
}