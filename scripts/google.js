const fs = require("node:fs/promises");
const path = require("node:path");

const filePath = path.join(__dirname, "../third_party/noto-emoji/svg");


/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Since the emojis are.. pretty much using the unicode name, all we have to do is replace emoji_u and then replace all the _ with -
    ? 2. Done
*/

const assets = [];

const start = async () => {
    try {
        await fs.readdir(path.join(__dirname, "../output/noto-emoji"));
    } catch (e) {
        await fs.mkdir(path.join(__dirname, "../output/")).catch(() => {});
        await fs.mkdir(path.join(__dirname, "../output/noto-emoji")).catch(() => {});
    }

    const files = await fs.readdir(filePath);

    for (const file of files) {
        assets.push(file);
    }

    for (const asset of assets) {
        const name = asset.replace("emoji_u", "").replace(/_/g, "-");

        await fs.copyFile(`${filePath}/${asset}`, path.join(__dirname, `../output/noto-emoji/${name}`));
    }

    console.log("Done");
}

start();