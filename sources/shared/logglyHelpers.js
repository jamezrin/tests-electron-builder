"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanObjectForSerialization_1 = require("./cleanObjectForSerialization");
const logLevelOrder = [
    "silent",
    "error",
    "warning",
    "info",
    "debug",
];
function shouldLog(args) {
    return (logLevelOrder.indexOf(args.messageLevel) <=
        logLevelOrder.indexOf(args.loggerLevel));
}
exports.shouldLog = shouldLog;
function toStringifiedLogglyMessage(logglyMessage, jsonStringify) {
    let data;
    if (typeof logglyMessage.data === "object") {
        const { message } = logglyMessage.data;
        data = {
            message: typeof message === "string" ? message : undefined,
            asJSON: jsonStringify(cleanObjectForSerialization_1.cleanObjectForSerialization(logglyMessage.data)),
        };
    }
    else if (typeof logglyMessage.data !== "undefined") {
        data = {
            asJSON: jsonStringify(cleanObjectForSerialization_1.cleanObjectForSerialization(logglyMessage.data)),
        };
    }
    let error;
    if (typeof logglyMessage.error === "object") {
        const { name, message, stack } = logglyMessage.error;
        error = {
            name: typeof name === "string" ? name : undefined,
            message: typeof message === "string" ? message : undefined,
            stack: typeof stack === "string" ? stack : undefined,
            asJSON: jsonStringify(cleanObjectForSerialization_1.cleanObjectForSerialization(logglyMessage.error)),
        };
    }
    else if (typeof logglyMessage.error !== "undefined") {
        error = {
            asJSON: jsonStringify(cleanObjectForSerialization_1.cleanObjectForSerialization(logglyMessage.error)),
        };
    }
    return {
        ...logglyMessage,
        error,
        data,
    };
}
exports.toStringifiedLogglyMessage = toStringifiedLogglyMessage;
function fromStringifiedLogglyMessage(logglyMessage, jsonParse) {
    const { data, error, ...shared } = logglyMessage;
    const result = shared;
    if (data) {
        result.data = jsonParse(data.asJSON);
    }
    if (error) {
        const parsedJSON = error.asJSON ? jsonParse(error.asJSON) : {};
        result.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...parsedJSON,
        };
    }
    return result;
}
exports.fromStringifiedLogglyMessage = fromStringifiedLogglyMessage;
function isStringifiedLogglyMessage(message) {
    return ((typeof message.data === "object" &&
        typeof message.data.asJSON === "string") ||
        (typeof message.error === "object" &&
            typeof message.error.asJSON === "string"));
}
exports.isStringifiedLogglyMessage = isStringifiedLogglyMessage;
function trimActorDataForLogging(actor) {
    if (actor === undefined) {
        return undefined;
    }
    const { table } = actor;
    const { id, email, parent_table, name, type } = actor.value;
    const actorForLogging = {
        id,
        table,
        email,
        parent_table,
        name,
        type,
    };
    Object.keys(actorForLogging).forEach(key => {
        if (actorForLogging[key] === undefined || actorForLogging[key] === null) {
            delete actorForLogging[key];
        }
    });
    return actorForLogging;
}
exports.trimActorDataForLogging = trimActorDataForLogging;
function safelyConvertAnyToString(toConvert) {
    try {
        if (typeof toConvert === "object" && toConvert !== null) {
            return JSON.stringify(cleanObjectForSerialization_1.cleanObjectForSerialization(toConvert, 8));
        }
        else {
            return String(toConvert);
        }
    }
    catch (e) {
        return `Unable to safely convert to string: "${e.stack ? e.stack : ""}"`;
    }
}
exports.safelyConvertAnyToString = safelyConvertAnyToString;
function convertErrorToLog(toConvert) {
    try {
        if (typeof toConvert === "object" && toConvert !== null) {
            const temp1 = toConvert;
            const { statusCode, name, message, data, error, stack, body } = temp1;
            const result = {};
            if (statusCode) {
                result.statusCode = Number(statusCode);
            }
            if (name) {
                result.name = String(name);
            }
            if (message) {
                result.message = String(message);
            }
            if (data) {
                result.miscDataString = safelyConvertAnyToString(data);
            }
            if (error) {
                result.miscErrorString = safelyConvertAnyToString(error);
            }
            if (stack) {
                result.stack = String(stack);
            }
            if (body) {
                result.body = {};
                if (typeof body === "object" && body !== null) {
                    const temp2 = body;
                    const { errorId, name, message, clientData } = temp2;
                    if (errorId) {
                        result.body.errorId = String(errorId);
                    }
                    if (name) {
                        result.body.name = String(name);
                    }
                    if (message) {
                        result.body.message = String(message);
                    }
                    if (clientData) {
                        result.body.clientDataString = safelyConvertAnyToString(clientData);
                    }
                }
                else {
                    result.body.message = safelyConvertAnyToString(body);
                }
            }
            return result;
        }
        else {
            return {
                miscErrorString: safelyConvertAnyToString(toConvert),
            };
        }
    }
    catch (e) {
        return {
            miscErrorString: `Unable to safely convert error to log: "${e.stack ? e.stack : ""}"`,
        };
    }
}
exports.convertErrorToLog = convertErrorToLog;
function convertLogDataToFinalVersion(data) {
    const { miscDataToConvertToString, ...everythingElse } = data;
    const postProcessedData = everythingElse;
    if (miscDataToConvertToString !== undefined) {
        postProcessedData.miscDataString = safelyConvertAnyToString(miscDataToConvertToString);
    }
    return postProcessedData;
}
exports.convertLogDataToFinalVersion = convertLogDataToFinalVersion;
//# sourceMappingURL=logglyHelpers.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
