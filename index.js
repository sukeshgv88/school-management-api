const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const Aeon = require('aeon-machine');

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at', promise, 'reason:', reason);
    process.exit(1);
});

const cache = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX,
    url: config.dotEnv.CACHE_REDIS
});

const Oyster = require('oyster-db');
const oyster = new Oyster({
    url: config.dotEnv.OYSTER_REDIS,
    prefix: config.dotEnv.OYSTER_PREFIX
});

const cortex = new Cortex({
    prefix: config.dotEnv.CORTEX_PREFIX,
    url: config.dotEnv.CORTEX_REDIS,
    type: config.dotEnv.CORTEX_TYPE,
    state: () => ({}),
    activeDelay: "50",
    idlDelay: "200"
});

const aeon = new Aeon({ cortex, timestampFrom: Date.now(), segmentDuration: 500 });

const managersLoader = new ManagersLoader({ config, cache, cortex, oyster, aeon });
const managers = managersLoader.load();

// Register School, Classroom, and Student Managers
managers.schoolManager = require('./managers/entities/SchoolManager');
managers.classroomManager = require('./managers/entities/ClassroomManager');
managers.studentManager = require('./managers/entities/StudentManager');

managers.userServer.run();

console.log('Managers loaded successfully');