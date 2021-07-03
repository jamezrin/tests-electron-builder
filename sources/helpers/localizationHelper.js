"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notion_intl_1 = require("notion-intl");
const messages_json_1 = __importDefault(require("../i18n/ko_KR/messages.json"));
function createIntlShape(locale = "en-US") {
    let messages = {};
    if (locale === "ko-KR") {
        messages = messages_json_1.default;
    }
    const cache = notion_intl_1.createIntlCache();
    const intl = notion_intl_1.createIntl({ locale: locale, defaultLocale: "en-US", messages }, cache);
    return intl;
}
exports.createIntlShape = createIntlShape;
function getNotionLocaleFromElectronLocale(electronLocale) {
    const localeMap = {
        ko: "ko-KR",
        en: "en-US",
    };
    return localeMap[electronLocale] || "en-US";
}
exports.getNotionLocaleFromElectronLocale = getNotionLocaleFromElectronLocale;
//# sourceMappingURL=localizationHelper.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
