"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const notionIpc = __importStar(require("../helpers/notionIpc"));
window.opener = {
    postMessage: (msg, origin) => {
        notionIpc.sendToMainListeners("notion:post-message", msg);
    },
};
//# sourceMappingURL=popupPreload.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
