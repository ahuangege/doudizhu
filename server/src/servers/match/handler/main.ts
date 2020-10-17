import { Session } from "mydog";
import { MatchMgr } from "../../../app/svr_match/matchMgr";
import { svr_match } from "../../../app/svr_match/svr_match";

export default class Handler {
    private matchMgr: MatchMgr;
    constructor() {
        this.matchMgr = svr_match.matchMgr;
    }

    // 取消匹配
    cancelMatch(msg: any, session: Session, next: Function) {
        this.matchMgr.cancelMatch(session.uid);
        next({ "code": 0 });
    }
}