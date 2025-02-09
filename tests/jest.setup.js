jest.mock('../cache/cache.dbh', () => {
    return jest.fn(() => ({
        search: {
            createIndex: jest.fn(),
            find: jest.fn().mockResolvedValue({ count: 0, docs: [] }),
        },
        hyperlog: {
            add: jest.fn(),
            count: jest.fn().mockResolvedValue(0),
            merge: jest.fn(),
        },
        hash: {
            set: jest.fn(),
            remove: jest.fn(),
            get: jest.fn().mockResolvedValue({}),
            incrby: jest.fn(),
            getFields: jest.fn(),
        },
        key: {
            expire: jest.fn(),
            exists: jest.fn().mockResolvedValue(false),
            delete: jest.fn().mockResolvedValue(true),
            set: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue(null),
        },
        set: {
            add: jest.fn(),
            remove: jest.fn(),
            get: jest.fn().mockResolvedValue([]),
        },
        sorted: {
            get: jest.fn().mockResolvedValue([]),
            update: jest.fn(),
            remove: jest.fn(),
        },
    }));
});
