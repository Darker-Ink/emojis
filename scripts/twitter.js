const fs = require("node:fs/promises");
const path = require("node:path");
const parse = require("./parse.js");
const filePath = path.join(__dirname, "../third_party/twemoji/assets/svg");


/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Since they are already named their unicode name, we can just then copy them to a new folder called "output/twitter"
    ? 3. Done     
*/

const assets = [];

const start = async () => {
    try {
        await fs.readdir(path.join(__dirname, "../output/twemoji"));
    } catch (e) {
        await fs.mkdir(path.join(__dirname, "../output/")).catch(() => {});
        await fs.mkdir(path.join(__dirname, "../output/twemoji")).catch(() => {});
    }

    const files = await fs.readdir(filePath);

    for (const file of files) {
        assets.push(file);
    }

    for (const asset of assets) {
        const parsed = parse(asset.slice(0, -4));

        if (!parsed.name) {
            console.log("Could not find", asset);
            
            continue;
        }

        await fs.copyFile(`${filePath}/${asset}`, path.join(__dirname, `../output/twemoji/${parsed.name}.svg`));
    }

    console.log("Done");
}

start();