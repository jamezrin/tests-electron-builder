"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const md5_1 = __importDefault(require("md5"));
function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
exports.distance = distance;
function randomlySucceedWithPercentage(percentage) {
    if (percentage <= 0) {
        return false;
    }
    if (percentage >= 100) {
        return true;
    }
    return Math.random() < percentage / 100;
}
exports.randomlySucceedWithPercentage = randomlySucceedWithPercentage;
function consistentlySucceedWithPercentage(key, percentage) {
    const pivot = (parseInt(md5_1.default(key).slice(0, 8), 16) / 0xffffffff) * 100;
    return pivot < percentage;
}
exports.consistentlySucceedWithPercentage = consistentlySucceedWithPercentage;
//# sourceMappingURL=mathUtils.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
