import { Application, RpcClass } from "mydog";
import { svr_connector } from "../../../app/svr_connector/svr_connector";
import { cmd } from "../../../config/cmd";

declare global {
    interface Rpc {
        connector: {
            main: RpcClass<Remote>,
        }
    }
}

export default class Remote {
    private app: Application
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 获取在线人数
     */
    getOnlineNum(cb: (err: number, num: number) => void) {
        cb(0, this.app.clientNum);
    }


    kickUserNotTellInfoSvr(msg: { "uid": number, "info": string }, cb?: (err: number) => void) {
        if (this.app.hasClient(msg.uid)) {
            this.app.sendMsgByUid(cmd.onKicked, { "code": 1, "info": msg.info }, [msg.uid]);
            svr_connector.connectorMgr.setUid(msg.uid);
            this.app.closeClient(msg.uid);
        }
        cb && cb(0);
    }

    setGameState(uid: number, gameState: { "gameSvr": string, "roomId": number }) {
        this.app.applySession(uid, { "gameState": gameState });
    }
}