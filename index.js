const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const build = require("./build");

async function createOrDeleteIfDirsExist() {
  const dirToCheck = ["shopping", "vacations", "expenses"];
  const dirsExist = dirToCheck.some((dir) => {
    return fsSync.existsSync(dir);
  });

  if (!dirsExist) {
    await build();
  } else {
    dirToCheck.forEach((dir) => {
      if (fsSync.existsSync(dir))
        fsSync.rmSync(dir, { recursive: true, force: true });
    });
    await build();
  }
}

async function getFilesByDir(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesByDir(res) : res;
    })
  );

  return Array.prototype.concat(...files);
}

async function returnExpensesByCategory(dir) {
  try {
    const pathToShoppingDir = path.join(__dirname, dir);
    const filesDir = Array.from(await getFilesByDir(pathToShoppingDir));
    let totalSum = 0;

    for (const fileDir of filesDir) {
      const data = await fs.readFile(fileDir, "utf8");
      totalSum += JSON.parse(data).total;
    }

    return totalSum;
  } catch (err) {
    console.error(err);
  }
}

async function writeExpensesByCategory(category, expense) {
  const content = `Expenses by ${category} : ${expense}`;
  const filePath = path.join("expenses", `totalBy${category}.txt`);

  await fs.writeFile(path.join(__dirname, filePath), content);

  console.log(`Expenses for ${category} successfully written`);
}

async function main() {
  try {
    await createOrDeleteIfDirsExist();

    const dirents = (
      await fs.readdir(__dirname, { withFileTypes: true })
    ).filter((dir) => {
      return dir.isDirectory() && !dir.name.includes(".");
    });

    await fs.mkdir("expenses");

    dirents.forEach(async (dirent) => {
      writeExpensesByCategory(
        dirent.name,
        await returnExpensesByCategory(dirent.name)
      );
    });
  } catch (err) {
    console.error(err);
  }
}

main();
