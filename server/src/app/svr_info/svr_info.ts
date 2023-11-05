
import { SyncUtil } from "sync-util";
import { MysqlClient } from "../util/mysql";
import { RoleMgr } from "./roleMgr";
import { Dic } from "../util/util";
import { RoleSync } from "../dbSync/roleSync";

interface I_svr_info {
    mysql: MysqlClient,
    roleMgr: RoleMgr,
    syncUtil: SyncUtil<I_syncUtil_info>
}

export let svr_info: I_svr_info = {
    mysql: null as any,
    roleMgr: null as any,
    syncUtil: null as any,
}


export interface I_syncUtil_info extends Dic<Dic<any>> {
    "roleSync": RoleSync
}