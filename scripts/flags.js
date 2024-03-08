const fs = require("node:fs/promises");
const path = require("node:path");
const filePath = path.join(__dirname, "../third_party/noto-emoji/third_party/region-flags/svg");


/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Since they are flags we just need to lowercase the name
    ? 3. These are a different case, we wanna move them to each of the 3 folders, i.e output/noto-emoji, output/twemoji, output/fluentui-emoji
*/

const assets = [];

const start = async () => {
    const files = await fs.readdir(filePath);

    for (const file of files) {
        assets.push(file);
    }

    for (const asset of assets) {
        const name = asset.slice(0, -4).toLowerCase();

        await fs.copyFile(`${filePath}/${asset}`, path.join(__dirname, `../output/noto-emoji/${name}.svg`));
        await fs.copyFile(`${filePath}/${asset}`, path.join(__dirname, `../output/twemoji/${name}.svg`));
        await fs.copyFile(`${filePath}/${asset}`, path.join(__dirname, `../output/fluentui-emoji/${name}.svg`));
    }

    console.log("Done");
}

start();