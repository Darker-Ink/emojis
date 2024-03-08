const fs = require("node:fs/promises");
const path = require("node:path");
const emojiDatasource = require("emoji-datasource");
const parse = require("./parse.js");
const filePath = path.join(__dirname, "../third_party/fluentui-emoji/assets");

/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Once we do that, we go through all of them and read the metadata.json file which should house the unicode name of the emoji
    ? 3. once we do that, we push the unicode name and the path to the /Color/<emojiname>.svg to a new array. Since Microsoft is weird,
    ?    the emoji name is not the unicode one
    ? 4. Once we do that, copy that file to anew folder called "output/microsoft" and rename it to the unicode name
    ? 5. Done
*/


/**
 * @typedef {object} parsedData
 * @property {string} cldr
 * @property {string} fromVersion
 * @property {string} glyph
 * @property {string[]} glyphAsUtfInEmoticons
 * @property {string} group
 * @property {string[]} keywords
 * @property {string[]} mappedToEmoticons
 * @property {string} tts
 * @property {string} unicode
 * @property {string[]} unicodeSkintones
*/

/**
 * @type {Array<string>}
 */
const assets = [];

const emojiToUnicode = (emoji) => {
    const scalars = Array.from(emoji);

    return scalars.map(scalar => scalar.codePointAt(0).toString(16)).join('-');
};

const start = async () => {
    try {
        await fs.access(path.join(__dirname, "../output/fluentui-emoji"));
    } catch (e) {
        await fs.mkdir(path.join(__dirname, "../output")).catch(() => { });
        await fs.mkdir(path.join(__dirname, "../output/fluentui-emoji")).catch(() => { });
    }

    const files = await fs.readdir(filePath);

    for (let file of files) {
        assets.push(file);
    }

    /**
     * @type {Array<{name: string, path: string}>}
     */
    const emojiData = [];

    for (let asset of assets) {
        const data = await fs.readFile(`${filePath}/${asset}/metadata.json`, "utf-8");

        /**
         * @type {parsedData}
         */
        const metaData = JSON.parse(data);

        const unicode = emojiToUnicode(metaData.glyph);

        const parsed = parse(unicode);

        if (!parsed) {
            console.log("Could not find", unicode);

            continue;
        }

        if (metaData.unicodeSkintones) {
            for (const skin of metaData.unicodeSkintones) {
                const parsed = parse(skin.replaceAll(" ", "-"));

                if (!parsed) {
                    console.log("Could not find", skin);

                    continue;
                }

                if (parsed.skinTone) {
                    const fileName = await fs.readdir(`${filePath}/${asset}/${parsed.skinToneType.name}/Color`);

                    if (fileName.length > 0) {
                        emojiData.push({
                            name: parsed.name,
                            path: `${filePath}/${asset}/${parsed.skinToneType.name}/Color/${fileName[0]}`
                        });
                    }

                    continue;
                } else {
                    const fileName = await fs.readdir(`${filePath}/${asset}/Default/Color`);

                    if (fileName.length > 0) {
                        emojiData.push({
                            name: parsed.name,
                            path: `${filePath}/${asset}/Default/Color/${fileName[0]}`
                        });
                    }

                    continue;
                }
            }
        } else {
            const fileName = await fs.readdir(`${filePath}/${asset}/Color`);

            if (fileName.length > 0) {
                emojiData.push({
                    name: parsed.name,
                    path: `${filePath}/${asset}/Color/${fileName[0]}`
                });
            }
        }
    }

    for (const emoji of emojiData) {
        await fs.copyFile(emoji.path, path.join(__dirname, `../output/fluentui-emoji/${emoji.name}.svg`));
    }

    console.log("Done");
};

start();