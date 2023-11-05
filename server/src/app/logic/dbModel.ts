
export enum dbTable {
    account = "account",
    player = "player",
}


export class Db_account {
    id = 0;
    username = "";
    password = "";
    regTime = Date.now();

    constructor() { }
}

export class Db_player {
    uid = 0;
    nickname = "";
    gold = 1000;
    regTime = Date.now();
    loginTime = Date.now();
    gameInfo = { "win": 0, "all": 0 };

    constructor() { }
}