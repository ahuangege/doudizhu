import { Db_player, dbTable } from "../logic/dbModel";
import { I_roleAllInfo } from "../util/someInterface";
import { svr_info } from "./svr_info";


export class LoginUtil {

    async getAllRoleInfo(uid: number): Promise<I_roleAllInfo> {
        return { "role": await this.getRoleInfo(uid) };
    }

    private async getRoleInfo(uid: number,): Promise<Db_player> {
        const res = await svr_info.mysql.select<Db_player>(dbTable.player, "*", { "where": { "uid": uid }, "limit": 1 });
        if (res.length) {
            return res[0];
        }

        const role = new Db_player();
        role.uid = uid;
        role.nickname = "农民" + uid;
        await svr_info.mysql.insert<Db_player>(dbTable.player, role);
        return role;
    }
}