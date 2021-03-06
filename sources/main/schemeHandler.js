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
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const config_1 = __importDefault(require("../config"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
const assetCache_1 = require("./assetCache");
const loggly_1 = require("../helpers/loggly");
const notionIpc = __importStar(require("../helpers/notionIpc"));
const constants_1 = require("../shared/constants");
const JsonStore_1 = require("./JsonStore");
const logglyHelpers_1 = require("../shared/logglyHelpers");
const cookieJsonStore = new JsonStore_1.JsonStore("cookies");
async function migrateCookies() {
    const cookies = electron_1.session.fromPartition(constants_1.electronSessionPartition).cookies;
    let count = 0;
    const oldCookies = cookieJsonStore.get() || {};
    for (const domainName in oldCookies) {
        for (const pathName in oldCookies[domainName]) {
            for (const cookieName in oldCookies[domainName][pathName]) {
                const cookieValue = oldCookies[domainName][pathName][cookieName];
                if (cookieName === "csrf") {
                    continue;
                }
                let url = "";
                if (cookieValue.secure) {
                    url += "https://";
                }
                else {
                    url += "http://";
                }
                if (domainName === "localhost/") {
                    url += "localhost:3000/";
                }
                else {
                    url += domainName;
                }
                url += pathName;
                const newCookie = {
                    url: url,
                    name: cookieName,
                    value: cookieValue.value,
                    domain: domainName,
                    path: pathName,
                    secure: cookieValue.secure,
                    httpOnly: cookieValue.httpOnly,
                    expirationDate: cookieValue.expires
                        ? new Date(cookieValue.expires).getTime() / 1000
                        : undefined,
                };
                await cookies.set(newCookie);
                count += 1;
            }
        }
    }
    if (count !== 0) {
        void loggly_1.loggly.log({
            level: "info",
            from: "schemeHandler",
            type: "cookieMigration",
            data: { cookieCount: count },
        });
    }
    void cookieJsonStore.set({});
}
exports.migrateCookies = migrateCookies;
async function wipeTransientCsrfCookie() {
    const cookies = electron_1.session.fromPartition(constants_1.electronSessionPartition).cookies;
    const [csrfCookie] = await cookies.get({ name: "csrf" });
    if (csrfCookie && csrfCookie.domain) {
        const url = csrfCookie.domain === "localhost"
            ? "https://localhost:3000/"
            : config_1.default.baseURL;
        await cookies.remove(url, csrfCookie.name);
    }
}
exports.wipeTransientCsrfCookie = wipeTransientCsrfCookie;
notionIpc.receiveMainFromRenderer.addListener("notion:clear-cookies", () => {
    void electron_1.session.fromPartition(constants_1.electronSessionPartition).clearStorageData({
        origin: config_1.default.baseURL,
        storages: ["cookies"],
    });
});
notionIpc.receiveMainFromRenderer.addListener("notion:clear-all-cookies", () => {
    void electron_1.session.fromPartition(constants_1.electronSessionPartition).clearStorageData();
    if (electron_1.session.defaultSession) {
        void electron_1.session.defaultSession.clearStorageData();
    }
});
notionIpc.addMainHandler("notion:get-cookie", async (_event, cookieName) => {
    const { cookies } = electron_1.session.fromPartition(constants_1.electronSessionPartition);
    const [cookie] = await cookies.get({
        url: config_1.default.baseURL,
        name: cookieName,
    });
    const value = cookie && !cookie.httpOnly ? cookie.value : undefined;
    return { value };
});
electron_1.protocol.registerSchemesAsPrivileged([
    {
        scheme: config_1.default.protocol,
        privileges: {
            standard: true,
            secure: true,
            allowServiceWorkers: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
]);
function registerUrlSchemeProxy() {
    const { protocol } = electron_1.session.fromPartition(constants_1.electronSessionPartition);
    const success = protocol.registerStreamProtocol(config_1.default.protocol, async (req, callback) => {
        if (config_1.default.isLocalhost && !config_1.default.offline) {
            proxyRequest(req, callback);
            return;
        }
        try {
            const cachedFile = await assetCache_1.assetCache.handleRequest(req);
            if (cachedFile) {
                const fileStream = fs_extra_1.default.createReadStream(cachedFile.absolutePath);
                const headers = coerceHeaders(cachedFile.headers, cachedFile.absolutePath);
                callback({
                    statusCode: 200,
                    headers: headers,
                    data: fileStream,
                });
            }
            else {
                proxyRequest(req, callback);
            }
        }
        catch (error) {
            void loggly_1.loggly.log({
                level: "error",
                from: "schemeHandler",
                type: "requestHandlerError",
                error: logglyHelpers_1.convertErrorToLog(error),
            });
            callback({
                statusCode: 500,
                headers: {},
                data: createStream("Something went wrong."),
            });
        }
    });
    if (!success) {
        const error = new Error("Could not register url scheme handler.");
        void loggly_1.loggly.log({
            level: "error",
            from: "schemeHandler",
            type: "registerSchemeHandlerError",
            error: logglyHelpers_1.convertErrorToLog(error),
        });
        throw error;
    }
}
exports.registerUrlSchemeProxy = registerUrlSchemeProxy;
function proxyRequest(req, callback) {
    const httpUrl = schemeHelpers_1.getHttpUrl({ schemeUrl: req.url, baseUrl: config_1.default.baseURL });
    const request = electron_1.net.request({
        method: req.method,
        url: httpUrl,
        session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
        useSessionCookies: true,
    });
    for (const [name, value] of Object.entries(req.headers)) {
        request.setHeader(name, value);
    }
    request.on("response", response => {
        const headers = coerceHeaders(response.headers, httpUrl);
        const stream = response;
        callback({
            statusCode: response.statusCode || 0,
            headers: headers,
            data: stream,
        });
    });
    request.on("error", error => {
        callback({
            statusCode: 0,
            headers: {},
            data: createErrorStream(error),
        });
    });
    if (req.uploadData) {
        for (const { bytes } of req.uploadData) {
            request.write(bytes);
        }
    }
    request.end();
}
function createStream(str) {
    const stream = new stream_1.PassThrough();
    stream.push(str);
    stream.push(null);
    return stream;
}
function createErrorStream(error) {
    const stream = new stream_1.PassThrough();
    stream.destroy(error);
    return stream;
}
function coerceHeaders(uncoercedHeaders, url) {
    const headers = { ...uncoercedHeaders };
    if (!headers["content-type"]) {
        if (url.endsWith(".css")) {
            headers["content-type"] = "text/css; charset=UTF-8";
        }
        if (url.endsWith(".html")) {
            headers["content-type"] = "text/html; charset=UTF-8";
        }
        if (url.endsWith(".js")) {
            headers["content-type"] = "text/javascript; charset=UTF-8";
        }
    }
    return headers;
}
//# sourceMappingURL=schemeHandler.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
