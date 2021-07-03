"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function batch(tasks, batchSize, processTasks) {
    return new Promise((resolve, reject) => {
        let currentIndex = 0;
        const evalNext = () => {
            const currentTasks = lodash_1.default.slice(tasks, currentIndex, currentIndex + batchSize);
            currentIndex += batchSize;
            if (currentTasks.length > 0) {
                processTasks(currentTasks)
                    .then(() => {
                    setImmediate(evalNext);
                })
                    .catch(reject);
            }
            else {
                resolve();
            }
        };
        evalNext();
    });
}
exports.batch = batch;
function timeout(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
exports.timeout = timeout;
function timeoutResolve(time, value) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, time);
    });
}
exports.timeoutResolve = timeoutResolve;
async function race(promises) {
    const defer = deferred();
    const rest = Promise.all(promises.map(async (promise, index) => {
        await promise;
        defer.resolve(index);
    }));
    const winner = await defer.promise;
    return { winner, rest };
}
exports.race = race;
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        resolve: resolve,
        reject: reject,
        promise,
    };
}
exports.deferred = deferred;
function requestTimeout(arg, time) {
    return new Promise((resolve, reject) => {
        void timeout(time).then(() => resolve({ result: undefined, timeout: true }));
        arg.then(result => resolve({ result, timeout: false })).catch(reject);
    });
}
exports.requestTimeout = requestTimeout;
async function raceWithTimeout(maxTimeoutMs, promises) {
    const promiseTimeout = deferred();
    const timerId = setTimeout(() => {
        promiseTimeout.resolve({ result: undefined, timeout: true });
    }, maxTimeoutMs);
    const firstResponse = await Promise.race([
        promiseTimeout.promise,
        Promise.race(promises).then(result => ({
            result,
            timeout: false,
        })),
    ]);
    clearTimeout(timerId);
    return firstResponse;
}
exports.raceWithTimeout = raceWithTimeout;
async function retryTimeout(tries, time, fn) {
    const result = await requestTimeout(fn(), time);
    if (tries <= 1 || !result.timeout) {
        return result;
    }
    return retryTimeout(tries - 1, time, fn);
}
exports.retryTimeout = retryTimeout;
exports.timeAll = async function (promises) {
    const start = Date.now();
    const mapped = promises.map(async (promise) => {
        if (promise) {
            await promise;
            return Date.now() - start;
        }
        else {
            return 0;
        }
    });
    return Promise.all(mapped);
};
class Waitable {
    constructor() {
        this.deferredPromise = deferred();
        this.isCompleted = false;
    }
    async wait(minDelay, maxDelay) {
        if (minDelay > 0) {
            await timeout(minDelay);
        }
        const remainingDelay = maxDelay - minDelay;
        if (remainingDelay > 0) {
            await Promise.race([
                this.deferredPromise.promise,
                timeout(remainingDelay),
            ]);
        }
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.deferredPromise.resolve(undefined);
        }
    }
    trigger() {
        if (!this.isCompleted) {
            this.deferredPromise.resolve(undefined);
        }
        this.isCompleted = true;
    }
}
exports.Waitable = Waitable;
async function* batchAsyncIterable(maxConcurrency, input, transform) {
    let batch = [];
    let inputIteratorDone = false;
    while (!inputIteratorDone) {
        while (batch.length < maxConcurrency) {
            const next = await input.next();
            const { value, done } = next;
            if (done === true) {
                inputIteratorDone = true;
                break;
            }
            batch.push(transform(value));
        }
        const completedTransforms = await Promise.all(batch);
        batch = [];
        for (const out of completedTransforms) {
            yield out;
        }
    }
}
exports.batchAsyncIterable = batchAsyncIterable;
//# sourceMappingURL=PromiseUtils.js.map


//notion-enhancer
require('../embedded_enhancer/pkg/loader.js')(__filename, exports);
