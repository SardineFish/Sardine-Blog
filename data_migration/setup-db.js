printjson(db.getSiblingDB("sar_blog"));

printjson(db.user.createIndex({ uid: 1 }, {
    unique: true,
}));

printjson(db.post.createIndex({ pid: 1 }, {
    unique: true,
}));
printjson(db.post.createIndex({ pid: 1, "data.type": 1 }));
printjson(db.post.createIndex({ "data.content.comment_root": 1 }, {
    sparse: true
}));

printjson(db.storage.createIndex({ name: 1 }, {
    unique: true
}))