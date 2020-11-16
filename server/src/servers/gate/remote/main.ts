import { Application } from "mydog";
import { svr_gate } from "../../../app/svr_gate/svr_gate";

declare global {
    interface Rpc {
        gate: {
            main: Remote,
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
    isTokenOk(info: { "uid": number, "token": number }, cb: (err: number, ok: boolean) => void) {
        cb(0, svr_gate.gateMgr.isTokenOk(info));
    }
}