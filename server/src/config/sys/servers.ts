export default {
    "development": {
        "gate": [     // 获取网关服
            { "id": "gate", "host": "127.0.0.1", "port": 8040, "frontend": true, "clientPort": 8041, },
        ],
        "connector": [     // 网关服
            { "id": "connector-server-1", "host": "127.0.0.1", "port": 8042, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 8043, },
            { "id": "connector-server-2", "host": "127.0.0.1", "port": 8044, "frontend": true, "clientHost": "127.0.0.1", "clientPort": 8045, },
        ],
        "info": [   // 玩家信息服
            { "id": "info-server-1", "host": "127.0.0.1", "port": 8046 },
            { "id": "info-server-2", "host": "127.0.0.1", "port": 8047 },
        ],
        "match": [      // 匹配服
            { "id": "match", "host": "127.0.0.1", "port": 8048 },
        ],
        "game": [       // 游戏服
            { "id": "game-server-1", "host": "127.0.0.1", "port": 8049 },
            { "id": "game-server-2", "host": "127.0.0.1", "port": 8050 },
        ],

    },
    "production": {
        "gate": [     // 获取网关服
            { "id": "gate", "host": "127.0.0.1", "port": 8040, "frontend": true, "clientPort": 8041, },
        ],
        "connector": [     // 网关服
            { "id": "connector-server-1", "host": "127.0.0.1", "port": 8042, "frontend": true, "clientHost": "47.105.203.146", "clientPort": 8043, },
            { "id": "connector-server-2", "host": "127.0.0.1", "port": 8044, "frontend": true, "clientHost": "47.105.203.146", "clientPort": 8045, },
        ],
        "info": [   // 玩家信息服
            { "id": "info-server-1", "host": "127.0.0.1", "port": 8046 },
            { "id": "info-server-2", "host": "127.0.0.1", "port": 8047 },
        ],
        "match": [      // 匹配服
            { "id": "match", "host": "127.0.0.1", "port": 8048 },
        ],
        "game": [       // 游戏服
            { "id": "game-server-1", "host": "127.0.0.1", "port": 8049 },
            { "id": "game-server-2", "host": "127.0.0.1", "port": 8050 },
        ],
    }
}