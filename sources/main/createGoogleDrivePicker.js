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
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const notionIpc = __importStar(require("../helpers/notionIpc"));
const urlHelpers = __importStar(require("../shared/urlHelpers"));
const constants_1 = require("../shared/constants");
function createGoogleDrivePicker(args) {
    const { url } = args;
    const rect = {
        x: undefined,
        y: undefined,
        width: 566,
        height: 350,
    };
    const PICKER_MAX_WIDTH = 1051;
    const PICKER_MAX_HEIGHT = 650;
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        const [winX, winY] = focusedWindow.getPosition();
        const [winWidth, winHeight] = focusedWindow.getSize();
        rect.width = Math.min(Math.max(rect.width, winWidth * 0.8), PICKER_MAX_WIDTH);
        rect.height = Math.min(Math.max(rect.height, winHeight * 0.8), PICKER_MAX_HEIGHT);
        rect.x = Math.round(winX + winWidth / 2 - rect.width / 2);
        rect.y = Math.round(winY + winHeight / 2 - rect.height / 2);
    }
    const baseURLDomain = urlHelpers.parse(config_1.default.baseURL).hostname;
    if (!baseURLDomain) {
        throw new Error("No base URL dmain.");
    }
    const window = new electron_1.BrowserWindow({
        ...rect,
        title: "",
        webPreferences: {
            preload: path_1.default.join(__dirname, "../renderer/popupPreload.js"),
            nodeIntegration: false,
            session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
        },
    });
    const handlePostMessage = (event, data) => {
        if (data && data.type === "google-drive-picker-callback") {
            notionIpc.receiveMainFromRenderer.removeListener("notion:post-message", handlePostMessage);
            window.removeListener("close", handleClose);
            window.close();
            notionIpc.sendMainToNotion("notion:google-drive-picker-callback", data.file);
        }
    };
    const handleClose = () => {
        notionIpc.receiveMainFromRenderer.removeListener("notion:post-message", handlePostMessage);
        window.removeListener("close", handleClose);
        notionIpc.sendMainToNotion("notion:google-drive-picker-callback", undefined);
    };
    notionIpc.receiveMainFromRenderer.addListener("notion:post-message", handlePostMessage);
    window.addListener("close", handleClose);
    void window.loadURL(url);
}
exports.createGoogleDrivePicker = createGoogleDrivePicker;
//# sourceMappingURL=createGoogleDrivePicker.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
