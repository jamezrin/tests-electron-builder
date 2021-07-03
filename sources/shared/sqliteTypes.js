"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSqliteError(result) {
    return (result.type === "Error" ||
        result.type === "ErrorBefore" ||
        result.type === "PreconditionFailed");
}
exports.isSqliteError = isSqliteError;
function makeSqliteBatch(batch) {
    return batch;
}
exports.makeSqliteBatch = makeSqliteBatch;
//# sourceMappingURL=sqliteTypes.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
