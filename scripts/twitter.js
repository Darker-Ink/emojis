const fs = require("node:fs/promises");
const path = "../third_party/twemoji/assets/svg";


/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Since they are already named their unicode name, we can just then copy them to a new folder called "output/twitter"
    ? 3. Done     
*/

const assets = [];

const start = async () => {
    try {
        await fs.readdir("../output/twemoji");
    } catch (e) {
        await fs.mkdir("../output/").catch(() => {});
        await fs.mkdir("../output/twemoji").catch(() => {});
    }

    const files = await fs.readdir(path);

    for (const file of files) {
        assets.push(file);
    }

    for (const asset of assets) {
        await fs.copyFile(`${path}/${asset}`, `../output/twemoji/${asset}`);
    }

    console.log("Done");
}

start();