export default {
    "development": {
        "gate": [     // 获取网关服
            { "id": "gate", "host": "127.0.0.1", "port": 4011, "frontend": true, "clientPort": 4001, },
        ],
        "connector": [     // 网关服
            { "id": "connector-server-1", "host": "127.0.0.1", "port": 4012, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4002, },
            { "id": "connector-server-2", "host": "127.0.0.1", "port": 4014, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 4004, },
        ],
        "info": [   // 玩家信息服
            { "id": "info-server-1", "host": "127.0.0.1", "port": 4021 },
            { "id": "info-server-2", "host": "127.0.0.1", "port": 4022 },
        ],
        "match": [      // 匹配服
            { "id": "match", "host": "127.0.0.1", "port": 4030 },
        ],
        "game": [       // 游戏服
            { "id": "game-server-1", "host": "127.0.0.1", "port": 4031 },
            { "id": "game-server-2", "host": "127.0.0.1", "port": 4032 },
        ],

    },
    "production": {
        "connector": [
            { "id": "connector-server-1", "host": "127.0.0.1", "port": 4021, "frontend": true, "clientPort": 4001, },
        ],
    }
}