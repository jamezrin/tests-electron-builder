"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const PromiseUtils = __importStar(require("./PromiseUtils"));
async function retry(args) {
    const { fn, handleError, retryAttemptsMS, retryAttemptRandomOffsetMS } = args;
    let fnError;
    let fnInput = args.initialInput;
    for (let retryCount = 0; retryCount <= retryAttemptsMS.length; retryCount += 1) {
        try {
            return await fn(fnInput);
        }
        catch (error) {
            const isLastAttempt = retryCount >= retryAttemptsMS.length;
            const processedError = handleError(error, isLastAttempt, retryCount, fnInput);
            if (processedError.status === "throw") {
                fnError = processedError.error;
                break;
            }
            if (isLastAttempt) {
                fnError = error;
                break;
            }
            const attemptMS = retryAttemptsMS[retryCount] + Math.random() * retryAttemptRandomOffsetMS;
            await PromiseUtils.timeout(attemptMS);
            if (processedError.input) {
                fnInput = processedError.input;
            }
        }
    }
    throw fnError;
}
exports.retry = retry;
function simpleRetry(fn, retryAttemptsMS = [1000, 2000, 5000, 10000], retryAttemptRandomOffsetMS = 200) {
    return retry({
        fn: fn,
        handleError: () => ({ status: "retry" }),
        retryAttemptsMS,
        retryAttemptRandomOffsetMS,
        initialInput: undefined,
    });
}
exports.simpleRetry = simpleRetry;
//# sourceMappingURL=retryHelpers.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
