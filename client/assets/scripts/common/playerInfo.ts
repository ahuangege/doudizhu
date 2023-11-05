import { I_card } from "../game/cardPrefab";


export class PlayerInfo {

    public static uid: number = 0;
    public static token: number = 0;
    public static host: string = "";
    public static port: number = 0;
    public static role: I_roleInfo = null;

    public static gameData: I_gameData = null;
    static PlayerInfo: { code: number; };
}

export interface I_roleInfo {
    "code": number,
    "uid": number,              // uid
    "nickname": string,         // 昵称
    "gold": number,           // 金币
    "gameInfo": { "all": number, "win": number },  // 游戏总局数，胜利局数
    "roomId": number,       // 房间id
}

export interface I_gameData {
    "state": e_roomState,
    "nowChairId": number,
    "nowTime": number,
    "dipai": I_card[],
    "dizhuChairId": number,
    "dizhuMaxScore": number,
    "lastPlayChairId": number,
    "players": I_gamePlayer[],
}

export const enum e_roomState {
    decideDizhu = 1,     // 确定地主阶段
    normal = 2,     // 正常出牌阶段
}

export interface I_gamePlayer {
    "uid": number,
    "nickname": string,
    "gold": number,
    "chairId": number,
    "cards": I_card[],
    "lastCards": I_card[],
}