const fs = require("fs").promises;

const path = require("path");

async function createDir(name) {
  try {
    await fs.mkdir(name);
  } catch {
    console.log(`${name} already exists.`);
  }
}

async function createFile(dirName) {
  fs.writeFile(
    path.join(dirName, `${new Date().toISOString().split("T")[0]}.json`),

    JSON.stringify({ total: Math.ceil(1000 * Math.random()) }, null, 2)
  );
}

async function createPurchases(name) {
  await createDir(path.join(__dirname, name));

  await createFile(path.join(__dirname, name));
}

async function main() {
  const DB = new Map([
    ["shopping", new Set(["restaurant", "food", "clothing"])],

    ["vacations", new Set(["Paris", "NY"])],
  ]);

  for (const [catName, catSet] of DB) {
    await createDir(catName);

    catSet.forEach(async (item) => {
      await createPurchases(path.join(catName, item));
    });
  }
}

module.exports = main;
