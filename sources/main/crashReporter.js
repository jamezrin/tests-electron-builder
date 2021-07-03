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
const electron_1 = require("electron");
const config_1 = __importDefault(require("../config"));
const notionIpc = __importStar(require("../helpers/notionIpc"));
electron_1.crashReporter.start({
    productName: "Notion",
    companyName: "Notion",
    submitURL: `${config_1.default.baseURL}/server/crash-report`,
    uploadToServer: true,
    extra: {
        desktopEnvironment: config_1.default.env,
        desktopVersion: electron_1.app.getVersion(),
    },
});
notionIpc.receiveMainFromRenderer.addListener("notion:set-loggly-data", (event, data) => {
    for (const key in data) {
        const value = data[key];
        if (typeof value === "string") {
            electron_1.crashReporter.addExtraParameter(key, value);
        }
    }
});
//# sourceMappingURL=crashReporter.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
