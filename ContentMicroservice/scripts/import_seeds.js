// ================================
//   VALID MONGOSH IMPORT SCRIPT
// ================================

// Select DB
use("bowo-content-db");

// Import Node's filesystem helper
const fs = require("fs");

// Helper function
function importSeed(collectionName, filename) {
    const path = `/app/seeds/${filename}`;

    print(`→ Importing ${collectionName} from ${filename}...`);

    // Read + parse JSON
    const jsonText = fs.readFileSync(path, "utf8");
    const data = JSON.parse(jsonText);

    // Upsert each document
    data.forEach(doc => {
        db.getCollection(collectionName).updateOne(
            { _id: doc._id },
            { $set: doc },
            { upsert: true }
        );
    });

    print(`✔ ${collectionName} imported (${data.length} docs).`);
    print("");
}

// Import each seed file
importSeed("tricks", "seed_tricks.json");
importSeed("quizzes", "seed_quizzes.json");

print("🎉 All seeds imported successfully!");
