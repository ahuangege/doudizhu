/**
 * 玩家数据结构 mysql
 */
export interface I_roleInfoMysql {
    "uid": number,              // uid
    "nickname": string,         // 昵称
    "gold": number,           // 金币
    "regTime": string,           // 注册时间
    "loginTime": string,           // 最近登录时间
    "gameInfo": { "win": number, "all": number }, // 胜利局数，总局数
}

/**
 * 玩家数据
 */
export interface I_roleInfo extends I_roleInfoMysql {
    "sid": string,              // sid
    "gameSvr": string,          // game svr
    "roomId": number,          // 桌子id
    "token": number,            // token
}



/**
 * 玩家基本数据
 */
export interface I_roleAllInfo {
    "role": I_roleInfo,
}

/**
 * 玩家基本数据（返回给客户端的）
 */
export interface I_roleAllInfoClient {
    "code": number,
    "role": I_roleInfo,
}

export interface I_enterSvr {
    sid: string
}