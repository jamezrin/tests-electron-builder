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
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const constants_1 = require("../shared/constants");
const notionIpc = __importStar(require("../helpers/notionIpc"));
const electron_2 = require("electron");
const urlHelpers_1 = require("../helpers/urlHelpers");
class WarmWindowState {
    constructor() {
        this.warmedWindow = undefined;
        this.warmedLoaded = false;
    }
}
const warmWindowState = new WarmWindowState();
function createWindow(relativeUrl = "", args) {
    const windowState = electron_window_state_1.default({
        defaultWidth: 1320,
        defaultHeight: 860,
    });
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    const rect = getRectFromFocusedWindow(windowState);
    const windowCreationArgs = {
        ...rect,
        show: false,
        backgroundColor: "#ffffff",
        titleBarStyle: "hiddenInset",
        webPreferences: {
            preload: path_1.default.resolve(__dirname, "../renderer/index.js"),
            webviewTag: true,
            session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
            enableRemoteModule: true,
        },
    };
    const { window, warmed } = getNextWindow(windowCreationArgs);
    warmWindowState.warmedWindow = undefined;
    window.once("ready-to-show", () => {
        if (args && args.isLocalhost) {
            return;
        }
        if (!warmed) {
            window.show();
        }
    });
    if (warmed) {
        if (warmWindowState.warmedLoaded) {
            notionIpc.sendMainToNotionWindow(window, "notion:navigate-to-url", relativeUrl);
        }
        else {
            void window.loadURL(urlHelpers_1.getIndexUrl(relativeUrl));
        }
        window.setBounds(getRectFromFocusedWindow(windowState));
        window.show();
    }
    else {
        void window.loadURL(urlHelpers_1.getIndexUrl(relativeUrl));
    }
    if (focusedWindow) {
        if (focusedWindow.isFullScreen()) {
            window.setFullScreen(true);
        }
    }
    else {
        if (windowState.isFullScreen) {
            window.setFullScreen(true);
        }
    }
    window.on("close", () => {
        windowState.saveState(window);
        if (process.platform === "win32") {
            const currentWindows = electron_1.BrowserWindow.getAllWindows();
            const hasNoOtherOpenWindows = currentWindows.every(currentWindow => Boolean(currentWindow.id === window.id ||
                (warmWindowState.warmedWindow &&
                    currentWindow.id === warmWindowState.warmedWindow.id)));
            if (hasNoOtherOpenWindows) {
                electron_2.app.quit();
            }
        }
    });
    setImmediate(() => {
        warmWindowState.warmedLoaded = false;
        warmWindowState.warmedWindow = new electron_1.BrowserWindow(windowCreationArgs);
        void warmWindowState.warmedWindow.loadURL(urlHelpers_1.getIndexUrl("/"));
    });
    return window;
}
exports.createWindow = createWindow;
notionIpc.addMainHandler("notion:ready", (_event, windowId) => {
    if (warmWindowState.warmedWindow &&
        windowId === warmWindowState.warmedWindow.id) {
        warmWindowState.warmedLoaded = true;
    }
    return Promise.resolve({ value: undefined });
});
notionIpc.addMainHandler("notion:refresh-all", _event => {
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    for (const window of electron_1.BrowserWindow.getAllWindows()) {
        if (!focusedWindow || window.id !== focusedWindow.id) {
            void window.loadURL(urlHelpers_1.getIndexUrl("/"));
        }
    }
    return Promise.resolve({ value: undefined });
});
function getRectFromFocusedWindow(windowState) {
    const rect = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
    };
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        const [x, y] = focusedWindow.getPosition();
        rect.x = x + 20;
        rect.y = y + 20;
        const [width, height] = focusedWindow.getSize();
        rect.width = width;
        rect.height = height;
    }
    return rect;
}
function getNextWindow(windowCreationArgs) {
    if (warmWindowState.warmedWindow) {
        return { window: warmWindowState.warmedWindow, warmed: true };
    }
    else {
        return { window: new electron_1.BrowserWindow(windowCreationArgs), warmed: false };
    }
}
//# sourceMappingURL=createWindow.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
