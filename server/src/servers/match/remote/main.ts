import { Application } from "mydog";
import { I_matchRole, MatchMgr } from "../../../app/svr_match/matchMgr";
import { svr_match } from "../../../app/svr_match/svr_match";


declare global {
    interface Rpc {
        match: {
            main: Remote,
        }
    }
}

export default class Remote {
    private matchMgr: MatchMgr;
    constructor(app: Application) {
        this.matchMgr = svr_match.matchMgr;
    }

    match(info: I_matchRole) {
        this.matchMgr.match(info);
    }

    offline(uid: number) {
        this.matchMgr.cancelMatch(uid);
    }

}