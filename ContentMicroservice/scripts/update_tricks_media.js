use bowo - content - db;

db.tricks.updateOne(
    { _id: "ollie" },
    {
        $set: {
            "images": [
                "http://192.168.1.44:5002/tricks/ollie/ollie_1.jpg",
                "http://192.168.1.44:5002/tricks/ollie/ollie_2.jpg",
                "http://192.168.1.44:5002/tricks/ollie/ollie_3.jpg"
            ],
            "videos.amateurUrl": "",
            "videos.proUrl": ""
        }
    }
);

db.tricks.updateOne(
    { _id: "popshoveit" },
    {
        $set: {
            "images": [
                "http://192.168.1.44:5002/tricks/popshoveit/popshoveit_1.jpg",
                "http://192.168.1.44:5002/tricks/popshoveit/popshoveit_2.jpg",
                "http://192.168.1.44:5002/tricks/popshoveit/popshoveit_3.jpg"
            ],
            "videos.amateurUrl": "http://192.168.1.44:5002/tricks/popshoveit/CRITERIUM%202019.mp4",
            "videos.proUrl": ""
        }
    }
);
