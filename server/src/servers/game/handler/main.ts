import { Session } from "mydog";
import { RoomMgr } from "../../../app/svr_game/roomMgr";
import { svr_game } from "../../../app/svr_game/svr_game";
import { getGameState } from "../../../app/util/gameUtil";


export default class Handler {
    private roomMgr: RoomMgr;
    constructor() {
        this.roomMgr = svr_game.roomMgr;
    }

    // 抢地主
    qiangDizhu(msg: { "score": number }, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(getGameState(session).roomId);
        room.qiangDizhu(session.uid, msg.score);
    }
    // 出牌
    playCard(msg: { "ids": number[] }, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(getGameState(session).roomId);
        room.playCard(session.uid, msg.ids, next);
    }

    // 离开
    leave(msg: any, session: Session, next: Function) {
        let room = this.roomMgr.getRoom(getGameState(session).roomId);
        room.leave(session.uid);
    }
}