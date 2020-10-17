export const enum cmd {
    /**
     * 被踢
     */
    onKicked = "onKicked",
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