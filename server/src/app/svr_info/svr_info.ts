
import mysqlClient from "../util/mysql";
import { RoleMgr } from "./roleMgr";

interface I_svr_info {
    mysql: mysqlClient,
    roleMgr: RoleMgr,
}

export let svr_info: I_svr_info = {
    mysql: null as any,
    roleMgr: null as any,
}
