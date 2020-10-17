
import { ConnectorMgr } from "./connectorMgr";

interface I_svr_connector {
    connectorMgr: ConnectorMgr,
}

export let svr_connector: I_svr_connector = {
    connectorMgr: null as any,
}
