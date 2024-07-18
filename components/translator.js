const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const reverseDict = (obj) => {
    return Object.assign(
        {},
        ...Object.entries(obj).map(([k, v]) => ({ [v]: k }))
    );
};

class Translator {
    toBritishEnglish(text) {
        const dict = { ...americanOnly, ...americanToBritishSpelling };
        const titles = americanToBritishTitles;
        const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
        const translated = this.translate(
            text,
            dict,
            titles,
            timeRegex,
            "toBritish"
        );

        if (!translated) {
            return text;
        }

        return translated;
    }

    toAmericanEnglish(text) {
        const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
        const titles = reverseDict(americanToBritishTitles);
        const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
        const translated = this.translate(
            text,
            dict,
            titles,
            timeRegex,
            "toAmerican"
        );

        if (!translated) {
            return text;
        }
        return translated;
    }

    translate(text, dict, titles, timeRegex, locale) {
  
        const lowerText = text.toLowerCase();
        const matchesMap = {};

        Object.entries(titles).map(([k, v]) => {
            if (lowerText.includes(k)) {
                matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
            }
        });

        const wordsWithSpace = Object.fromEntries(
            Object.entries(dict).filter(([k, v]) => k.includes(" "))
        );

        Object.entries(wordsWithSpace).map(([k, v]) => {
            if (lowerText.includes(k)) {
                matchesMap[k] = v;
            }
        });

        lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
            if (dict[word]) matchesMap[word] = dict[word];
        });

        const matchedTimes = lowerText.match(timeRegex);

        if (matchedTimes) {
            matchedTimes.map((e) => {
                if (locale === "toBritish") {
                    return (matchesMap[e] = e.replace(":", "."));
                }
                return (matchesMap[e] = e.replace(".", ":"));
            })
        }

        if (Object.keys(matchesMap).length === 0) return null;

        console.log("matchesMap :>> ", matchesMap);
        const translation = this.replaceAll(text, matchesMap);

        const translationWithHighlight = this.replaceAllWithHighlight(
            text,
            matchesMap
        );

        
        
        return [translation, translationWithHighlight];
    }

    replaceAllWithHighlight(text, map) {
        const re = new RegExp(Object.keys(map).join("|"), "gi");
        return text.replace(re, (matched) => {
            return `<span class="highlight">${
                map[matched.toLowerCase()]
            }</span>`;
        });
    }

    replaceAll(text, map) {
        const re = new RegExp(Object.keys(map).join("|"), "gi");
        return text.replace(re, (matched) => map[matched.toLowerCase()]);
    }

}

module.exports = Translator;