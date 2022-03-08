const path = require("path");
const fs = require("fs").promises;

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

async function returnSumByDir(dir) {
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

(async function main() {
  console.log(await returnSumByDir("shopping"));
})();
