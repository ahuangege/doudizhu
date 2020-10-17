export const enum cmd {
    /**
     * 登录，获取网关
     */
    gate_main_login = "gate.main.login",
    /**
     * 登录到网关
     */
    connector_main_enter = "connector.main.enter",
    /**
     * 重连
     */
    connector_main_reconnectEnter = "connector.main.reconnectEnter",
    /**
     * 被踢
     */
    onKicked = "onKicked",
    /**
     * 修改昵称
     */
    info_main_changeNickname = "info.main.changeNickname",
    /**
     * 匹配
     */
    info_main_match = "info.main.match",
    /**
     * 重连进入房间
     */
    info_main_enterRoom = "info.main.enterRoom",
    /**
     * 取消匹配
     */
    match_main_cancelMatch = "match.main.cancelMatch",
    /**
     * 抢地主
     */
    game_main_qiangDizhu = "game.main.qiangDizhu",
    /**
     * 出牌
     */
    game_main_playCard = "game.main.playCard",
    /**
     * 离开
     */
    game_main_leave = "game.main.leave",
    /**
     * 游戏开始
     */
    onGameStart = "onGameStart",
    /**
     * 抢地主
     */
    onQiangDizhu = "onQiangDizhu",
    /**
     * 抢地主完成
     */
    onDizhuOk = "onDizhuOk",
    /**
     * 出牌
     */
    onPlayCard = "onPlayCard",
    /**
     * 游戏结束
     */
    onGameOver = "onGameOver",
    /**
     * 游戏结算信息
     */
    onWinInfo = "onWinInfo",
    /**
     * 金币改变
     */
    onGoldChanged = "onGoldChanged",
}