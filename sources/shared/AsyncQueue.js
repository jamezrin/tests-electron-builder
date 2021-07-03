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
class AsyncQueue {
    constructor(parallel) {
        this.parallel = parallel;
        this.queue = [];
        this.running = [];
        this.afterFlushes = [];
        this.afterClogs = [];
    }
    static async map(parallel, array, fn) {
        const queue = new AsyncQueue(parallel);
        return await Promise.all(array.map((value, index, array) => queue.enqueue(() => fn(value, index, array))));
    }
    getStats() {
        return {
            running: this.running.length,
            queue: this.queue.length,
        };
    }
    enqueue(thunk) {
        const deferred = PromiseUtils.deferred();
        const wrapped = () => thunk().then(deferred.resolve).catch(deferred.reject);
        this.queue.push({
            deferred: deferred,
            action: wrapped,
        });
        this.flush();
        return deferred.promise;
    }
    wrap(fn) {
        return (...args) => this.enqueue(() => fn(...args));
    }
    enqueueImmediate(thunk) {
        const promise = thunk();
        const deferred = PromiseUtils.deferred();
        promise.then(deferred.resolve).catch(deferred.reject);
        this.queue.push({
            action: () => promise,
            deferred: deferred,
        });
        this.flush();
        return promise;
    }
    flush() {
        if (this.queue.length === 0) {
            if (this.running.length === 0) {
                for (const deferred of this.afterFlushes) {
                    deferred.resolve(null);
                }
                this.afterFlushes = [];
            }
            if (this.running.length < this.parallel) {
                for (const deferred of this.afterClogs) {
                    deferred.resolve(null);
                }
                this.afterClogs = [];
            }
            return;
        }
        if (this.running.length >= this.parallel) {
            return;
        }
        const thunks = this.queue.splice(0, this.parallel - this.running.length);
        for (const thunk of thunks) {
            this.running.push(thunk);
        }
        for (const thunk of thunks) {
            void thunk.action().then(() => {
                this.running.splice(this.running.indexOf(thunk), 1);
                this.flush();
            });
        }
    }
    afterFlush() {
        const deferred = PromiseUtils.deferred();
        this.afterFlushes.push(deferred);
        this.flush();
        return deferred.promise;
    }
    afterClog() {
        const deferred = PromiseUtils.deferred();
        this.afterClogs.push(deferred);
        this.flush();
        return deferred.promise;
    }
    cancel() {
        const running = this.running;
        const queue = this.queue;
        this.running = [];
        this.queue = [];
        for (const task of running) {
            task.deferred.reject(new Error("CanceledTask."));
        }
        for (const task of queue) {
            task.deferred.reject(new Error("CanceledTask."));
        }
    }
}
exports.AsyncQueue = AsyncQueue;
//# sourceMappingURL=AsyncQueue.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
