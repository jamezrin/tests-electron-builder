"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
function parse(str, args = {}) {
    try {
        return url_1.default.parse(str, true, args.slashesDenoteHost);
    }
    catch (err) {
        try {
            const result = url_1.default.parse(str);
            const resultWithQuery = {
                ...result,
                query: {},
            };
            return resultWithQuery;
        }
        catch (err) {
            return url_1.default.parse("", true);
        }
    }
}
exports.parse = parse;
function format(args) {
    return url_1.default.format(args);
}
exports.format = format;
function makeUrl(args) {
    const parsed = parse(args.url);
    parsed.query;
    delete parsed.search;
    parsed.query = args.query || {};
    parsed.hash = args.hash || null;
    return format(parsed);
}
exports.makeUrl = makeUrl;
function removeBaseUrl(str) {
    const parsed = parse(str);
    delete parsed.protocol;
    delete parsed.host;
    delete parsed.hostname;
    parsed.slashes = false;
    return format(parsed);
}
exports.removeBaseUrl = removeBaseUrl;
function isRelativeUrl(relativeUrl) {
    const parsed = parse(relativeUrl);
    return Boolean(!parsed.host && !parsed.hostname);
}
exports.isRelativeUrl = isRelativeUrl;
function setBaseUrl(args) {
    const parsed = parse(args.relativeUrl);
    const baseUrlParsed = parse(args.baseUrl);
    parsed.protocol = baseUrlParsed.protocol;
    parsed.host = baseUrlParsed.host;
    parsed.hostname = baseUrlParsed.hostname;
    return format(parsed);
}
exports.setBaseUrl = setBaseUrl;
function replacePathname(args) {
    const parsed = parse(args.url);
    delete parsed.path;
    parsed.pathname = args.pathname;
    return format(parsed);
}
exports.replacePathname = replacePathname;
function resolve(baseUrl, pathname) {
    return replacePathname({ url: baseUrl, pathname });
}
exports.resolve = resolve;
function removeQueryParam(str, param) {
    const parsed = parse(str);
    delete parsed.search;
    delete parsed.query[param];
    return format(parsed);
}
exports.removeQueryParam = removeQueryParam;
function addQueryParams(str, query) {
    const parsed = parse(str);
    delete parsed.search;
    parsed.query = { ...parsed.query, ...query };
    return format(parsed);
}
exports.addQueryParams = addQueryParams;
const hostBlacklist = {
    "thumpmagical.top": true,
    "geoloc8.com": true,
    "kutabminaj.top": true,
    "cutisbuhano.xyz": true,
    "bhapurimillat.xyz": true,
    "kingoffightermens.top": true,
    "boxgeneral.xyz": true,
    "ahnd.ga": true,
    "steptossmessage.top": true,
    "earthdiscover.xyz": true,
    "sopecasniteroi.com.br": true,
    "clangchapshop.xyz": true,
};
function sanitizeUrl(args) {
    const { str, allowNoProtocol } = args;
    if (!str || typeof str !== "string") {
        return;
    }
    try {
        const parsed = parse(str);
        if (parsed.host && hostBlacklist[parsed.host]) {
            return;
        }
        if (parsed.protocol === "http:" ||
            parsed.protocol === "https:" ||
            parsed.protocol === "mailto:" ||
            parsed.protocol === "itms-apps:" ||
            parsed.protocol === "tel:" ||
            (allowNoProtocol && !parsed.protocol)) {
            return str;
        }
    }
    catch (err) {
        return;
    }
}
exports.sanitizeUrl = sanitizeUrl;
function removeUrlFromString(str) {
    return (str || "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
}
exports.removeUrlFromString = removeUrlFromString;
//# sourceMappingURL=urlHelpers.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
