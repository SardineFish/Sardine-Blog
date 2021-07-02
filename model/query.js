// Post Activities
[
    {
        $sort: { time: -1 }
    },
    {
        $match: {
            type: "Post",
            op: { $in: ["Create", "Update"] },
            "data.type": { $in: ["Blog", "Note", "Comment"] },
        }
    },
    {
        $skip: 0,
    },
    {
        $limit: 10,
    },
    {
        $lookup: {
            from: "user",
            localField: "user",
            foreignField: "uid",
            as: "user",
        }
    },
    {
        $project: {
            op: 1,
            time: 1,
            data: 1,
            user: {
                $arrayElemAt: ["$user", 0]
            },
        }
    },
    {
        $project: {
            op: 1,
            time: 1,
            uid: "$user.uid",
            user_name: "$user.info.name",
            pid: "$data.pid",
            data: "$data",
        }
    }
]