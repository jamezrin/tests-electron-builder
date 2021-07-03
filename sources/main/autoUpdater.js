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
const electron_log_1 = __importDefault(require("electron-log"));
const electron_updater_1 = require("electron-updater");
const config_1 = __importDefault(require("../config"));
const notionIpc = __importStar(require("../helpers/notionIpc"));
const loggly_1 = require("../helpers/loggly");
const isOfflineError_1 = __importDefault(require("../shared/isOfflineError"));
const cleanObjectForSerialization_1 = require("../shared/cleanObjectForSerialization");
const logglyHelpers_1 = require("../shared/logglyHelpers");
electron_log_1.default.transports.file.level = "info";
electron_log_1.default.transports.file.fileName = "log.log";
electron_updater_1.autoUpdater.logger = electron_log_1.default;
let electronUpdateIsAvailable = false;
electron_updater_1.autoUpdater.autoInstallOnAppQuit = false;
function initializeAutoUpdater() {
    let inInstallInitializationWindow = true;
    setTimeout(() => {
        inInstallInitializationWindow = false;
    }, 5000);
    electron_updater_1.autoUpdater.on("error", error => {
        electronUpdateIsAvailable = false;
        if (isOfflineError_1.default(error)) {
            electron_log_1.default.info("No electron update -- offline");
            notionIpc.sendMainToNotion("notion:update-not-available");
            return;
        }
        if (error.domain === "NSPOSIXErrorDomain") {
            void loggly_1.loggly.log({
                level: "error",
                from: "autoUpdater",
                type: "NSPOSIXErrorDomainError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.domain === "SQRLUpdaterErrorDomain") {
            void loggly_1.loggly.log({
                level: "error",
                from: "autoUpdater",
                type: "SQRLUpdaterErrorDomainError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.domain === "NSCocoaErrorDomain") {
            void loggly_1.loggly.log({
                level: "error",
                from: "autoUpdater",
                type: "NSCocoaErrorDomainError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.message.startsWith("net::ERR")) {
            void loggly_1.loggly.log({
                level: "info",
                from: "autoUpdater",
                type: "networkError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.statusCode === 403) {
            void loggly_1.loggly.log({
                level: "warning",
                from: "autoUpdater",
                type: "cloudflareCaptcha",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.statusCode === 503) {
            void loggly_1.loggly.log({
                level: "warning",
                from: "autoUpdater",
                type: "serviceUnavailable",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.message.indexOf("/opt/notion-app/app.asar") !== -1) {
            void loggly_1.loggly.log({
                level: "info",
                from: "autoUpdater",
                type: "unsupportedLinuxApp",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        else if (error.message.indexOf("app-update.yml") !== -1) {
        }
        else {
            void loggly_1.loggly.log({
                level: "error",
                from: "autoUpdater",
                type: "unknownAutoUpdaterError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
        }
        notionIpc.sendMainToNotion("notion:update-error", cleanObjectForSerialization_1.cleanObjectForSerialization(error));
    });
    electron_updater_1.autoUpdater.on("checking-for-update", () => {
        notionIpc.sendMainToNotion("notion:checking-for-update");
    });
    electron_updater_1.autoUpdater.on("update-available", (info) => {
        electronUpdateIsAvailable = true;
        notionIpc.sendMainToNotion("notion:update-available", info);
    });
    electron_updater_1.autoUpdater.on("update-not-available", () => {
        notionIpc.sendMainToNotion("notion:update-not-available");
    });
    electron_updater_1.autoUpdater.on("download-progress", (progress) => {
        notionIpc.sendMainToNotion("notion:update-progress", progress);
    });
    electron_updater_1.autoUpdater.on("update-downloaded", (info) => {
        notionIpc.sendMainToNotion("notion:update-ready", info);
        if (inInstallInitializationWindow) {
            electron_updater_1.autoUpdater.quitAndInstall();
        }
    });
}
exports.initializeAutoUpdater = initializeAutoUpdater;
notionIpc.receiveMainFromRenderer.addListener("notion:install-update", () => {
    setTimeout(() => {
        if (electronUpdateIsAvailable) {
            electron_updater_1.autoUpdater.quitAndInstall();
        }
        else {
            electron_1.app.relaunch();
            electron_1.app.quit();
        }
    });
});
notionIpc.receiveMainFromRenderer.addListener("notion:check-for-updates", () => {
    void electron_updater_1.autoUpdater.checkForUpdates();
});
const pollInterval = config_1.default.isLocalhost ? 10 * 1000 : 24 * 60 * 60 * 1000;
async function pollForElectronUpdates() {
    while (true) {
        if (!electronUpdateIsAvailable) {
            try {
                await electron_updater_1.autoUpdater.checkForUpdates();
            }
            catch (error) { }
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
}
if (!config_1.default.isLocalhost) {
    void pollForElectronUpdates();
}
//# sourceMappingURL=autoUpdater.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
