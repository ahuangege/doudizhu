
import mysqlClient from "../util/mysql";
import { GateMgr } from "./gateMgr";

interface I_svr_gate {
    mysql: mysqlClient,
    gateMgr: GateMgr,
}

export let svr_gate: I_svr_gate = {
    mysql: null as any,
    gateMgr: null as any,
}
