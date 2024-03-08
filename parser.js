/*

This is the parser you can use for generating the emoji urls.

*/

const emojiDatasource = require("emoji-datasource")

const skinTones = [
    {
        name: "Default",
        code: ""
    },
    {
        name: "Light",
        code: "1F3FB"
    },
    {
        name: "Medium-Light",
        code: "1F3FC"
    },
    {
        name: "Medium",
        code: "1F3FD"
    },
    {
        name: "Medium-Dark",
        code: "1F3FE"
    },
    {
        name: "Dark",
        code: "1F3FF"
    }
];

const fixUnicode = (unicode) => {
    if (unicode.startsWith("00")) {
        return unicode.slice(2);
    }

    return unicode;
}

// ? fuzzInReverse is like fuzzyParse, but instead of checking if the emoji.unified for example starts with unicode, we do the opposite
const fuzzInReverse = (unicode) => {
    const foundEmoji = emojiDatasource.find(emoji => {
        const uni = unicode.toLowerCase().startsWith(fixUnicode(emoji.unified).toLowerCase());

        if (uni) {
            return true;
        }

        const nonQualified = emoji.non_qualified && unicode.toLowerCase().startsWith(fixUnicode(emoji.non_qualified).toLowerCase());

        if (nonQualified) {
            return true;
        }

        const googleEmoji = emoji.google && unicode.toLowerCase().startsWith(emoji.google.toLowerCase());

        if (googleEmoji) {
            return true;
        }

        if (emoji.skin_variations) {
            for (const skin of Object.values(emoji.skin_variations)) {
                if (unicode.toLowerCase().startsWith(skin.unified.toLowerCase())) {
                    return true;
                }

                if (skin.non_qualified && unicode.toLowerCase().startsWith(fixUnicode(skin.non_qualified).toLowerCase())) {
                    return true;
                }

                if (skin.google && unicode.toLowerCase().startsWith(skin.google.toLowerCase())) {
                    return true;
                }
            }
        }

        return false;
    });

    if (!foundEmoji) {
        return {
            name: null,
            skinTone: false,
            skinToneType: null
        };
    }

    const skinTone = foundEmoji.skin_variations && Object.entries(foundEmoji.skin_variations)
        .find(([, skin]) => unicode.toLowerCase().startsWith(skin.unified.toLowerCase())
            || skin.non_qualified && unicode.toLowerCase().startsWith(fixUnicode(skin.non_qualified).toLowerCase())
            || skin.google && unicode.toLowerCase().startsWith(skin.google.toLowerCase()));

    return {
        name: skinTone ? skinTone[1].image.slice(0, -4) : foundEmoji.image.slice(0, -4),
        skinTone: !!skinTone,
        skinToneType: skinTone ? skinTones.find(skin => skin.code.toLowerCase() === skinTone[0].toLowerCase()) : null
    };
};

// ? fuzzy parse is like parse, but instead if searching for an exact match, we check if any unicode starts with the given unicode
// ? for example 0023 would match "0023-FE0F-20E3" and "0023-FE0F"
const fuzzyParse = (unicode) => {
    const foundEmoji = emojiDatasource.find(emoji => {
        const uni = emoji.unified.toLowerCase().startsWith(unicode.toLowerCase());

        if (uni) {
            return true;
        }

        const nonQualified = emoji.non_qualified && fixUnicode(emoji.non_qualified).toLowerCase().startsWith(unicode.toLowerCase());

        if (nonQualified) {
            return true;
        }

        const googleEmoji = emoji.google && emoji.google.toLowerCase().startsWith(unicode.toLowerCase());

        if (googleEmoji) {
            return true;
        }

        if (emoji.skin_variations) {
            for (const skin of Object.values(emoji.skin_variations)) {
                if (skin.unified.toLowerCase().startsWith(unicode.toLowerCase())) {
                    return true;
                }

                if (skin.non_qualified && fixUnicode(skin.non_qualified).toLowerCase().startsWith(unicode.toLowerCase())) {
                    return true;
                }

                if (skin.google && skin.google.toLowerCase().startsWith(unicode.toLowerCase())) {
                    return true;
                }
            }
        }

        return false;
    });

    if (!foundEmoji) {
        return fuzzInReverse(unicode);
    }

    const skinTone = foundEmoji.skin_variations && Object.entries(foundEmoji.skin_variations)
        .find(([, skin]) => skin.unified.toLowerCase().startsWith(unicode.toLowerCase())
            || skin.non_qualified && fixUnicode(skin.non_qualified).toLowerCase().startsWith(unicode.toLowerCase())
            || skin.google && skin.google.toLowerCase().startsWith(unicode.toLowerCase()));

    return {
        name: skinTone ? skinTone[1].image.slice(0, -4) : foundEmoji.image.slice(0, -4),
        skinTone: !!skinTone,
        skinToneType: skinTone ? skinTones.find(skin => skin.code.toLowerCase() === skinTone[0].toLowerCase()) : null
    };
};



const emojiParser = (unicode) => {
    const foundEmoji = emojiDatasource.find(emoji => {
        const uni = fixUnicode(emoji.unified).toLowerCase() === unicode.toLowerCase();

        if (uni) {
            return true;
        }

        const nonQualified = emoji.non_qualified && fixUnicode(emoji.non_qualified).toLowerCase() === unicode.toLowerCase();

        if (nonQualified) {
            return true;
        }

        const googleEmoji = emoji.google && emoji.google.toLowerCase() === unicode.toLowerCase();

        if (googleEmoji) {
            return true;
        }

        if (emoji.skin_variations) {
            for (const skin of Object.values(emoji.skin_variations)) {
                if (skin.unified.toLowerCase() === unicode.toLowerCase()) {
                    return true;
                }

                if (skin.non_qualified && fixUnicode(skin.non_qualified).toLowerCase() === unicode.toLowerCase()) {
                    return true;
                }

                if (skin.google && skin.google.toLowerCase() === unicode.toLowerCase()) {
                    return true;
                }
            }
        }

        return false;
    });

    if (!foundEmoji) {
        return fuzzyParse(unicode);
    }

    const skinTone = foundEmoji.skin_variations && Object.entries(foundEmoji.skin_variations)
        .find(([, skin]) => skin.unified.toLowerCase() === unicode.toLowerCase()
            || skin.non_qualified && fixUnicode(skin.non_qualified).toLowerCase() === unicode.toLowerCase()
            || skin.google && skin.google.toLowerCase() === unicode.toLowerCase());

    return {
        name: skinTone ? skinTone[1].image.slice(0, -4) : foundEmoji.image.slice(0, -4),
        skinTone: !!skinTone,
        skinToneType: skinTone ? skinTones.find(skin => skin.code.toLowerCase() === skinTone[0].toLowerCase()) : null
    };
};


const baseUrl = "https://cdn.jsdelivr.net/gh/Darker-Ink/emojis/output";

const emojiToUnicode = (emoji) => {
    const scalars = Array.from(emoji);

    return scalars.map(scalar => scalar?.codePointAt(0)?.toString(16)).join("-");
};

const parse = (unicode, options) => {
    const style = options.style ?? "twemoji";
    const basedUrl = options.baseUrl ?? baseUrl;

    const emojiUnicode = emojiToUnicode(unicode);

    const parsed = emojiParser(emojiUnicode);

    console.log(parsed, emojiUnicode);

    if (!parsed.name) {
        return null;
    }

    return `${basedUrl}/${style}/${parsed.name}.svg`;
};

export default parse;