import { Db_player, dbTable } from "../logic/dbModel";
import { RoleInfo } from "../svr_info/roleInfo";
import { MysqlClient } from "../util/mysql";


export class RoleSync {
    private mysql: MysqlClient;

    constructor(mysql: MysqlClient) {
        this.mysql = mysql;
    }

    async updateRole(uid: number, role: RoleInfo) {
        await this.mysql.update<Db_player>(dbTable.player, role.getSqlUpdateObj(), { "where": { uid }, "limit": 1 });
    }
}