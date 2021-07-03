"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
const urlHelpers = __importStar(require("../shared/urlHelpers"));
function getIndexUrl(relativeUrl) {
    if (relativeUrl.startsWith("/")) {
        relativeUrl = relativeUrl.slice(1);
    }
    return urlHelpers.format({
        pathname: path_1.default.resolve(__dirname, "../renderer/index.html"),
        protocol: "file:",
        slashes: true,
        query: {
            path: `${schemeHelpers_1.getSchemeUrl({
                httpUrl: config_1.default.baseURL,
                protocol: config_1.default.protocol,
            })}/${relativeUrl}`,
        },
    });
}
exports.getIndexUrl = getIndexUrl;
//# sourceMappingURL=urlHelpers.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
