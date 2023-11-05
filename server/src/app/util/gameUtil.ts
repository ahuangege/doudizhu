import { app, Session } from "mydog";

export const enum svrType {
    "gate" = "gate",
    "connector" = "connector",
    "info" = "info",
    "match" = "match",
    "game" = "game",
}



let infoSvrs = app.serversConfig[svrType.info];
export function getInfoId(uid: number) {
    return infoSvrs[uid % infoSvrs.length].id;
}


export const enum constKey {
    "gate" = "gate",
    "match" = "match",
}


export function changeInfoGameState(uid: number, gameState: I_gameState) {
    app.rpc(getInfoId(uid), true).info.main.setGameState(uid, gameState);
}

export function changeConGameState(uid: number, sid: string, gameState: I_gameState) {
    app.rpc(sid, true).connector.main.setGameState(uid, gameState);
}

/**
 * 从session里获取游戏状态
 * @param session 
 */
export function getGameState(session: Session): I_gameState {
    return session.get("gameState");
}

export interface I_gameState {
    "gameSvr": string,
    "roomId": number
}