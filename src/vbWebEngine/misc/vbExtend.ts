/* eslint-disable @typescript-eslint/no-explicit-any */
/** Extensions for JavaScript objects */


declare global {
    interface Array<T> {
        clear(): void;
        front(): T;
        back(): T;
        moveToBack(fromIndex: number): void;
        swap(index1: number, index2: number): void;
        /** Remove the matched item once at a time */
        removeOnce(item: T | undefined): this;
        /** Set union */
        union(other: (T | undefined | null)[]): T[];
        /** Set intersection */
        intersect(other: (T | undefined | null)[]): T[];
        /** Set difference */
        diff(other: (T | undefined | null)[]): T[];
    }

    interface ArrayConstructor {
        /** compare elements of two arrays one by one sequentially */
        isEqual(arr1: any[], arr2: any[]): boolean;
        /** Generate a list of numbers */
        rangeFrom(stop: number): number[];
        rangeFrom(start: number, stop: number): number[];
        rangeFrom(start: number, stop: number, step: number): number[];
        /** Return an iterator */
        range(stop: number): Generator<number, void>;
        range(start: number, stop: number): Generator<number, void>;
        range(start: number, stop: number, step: number): Generator<number, void>;
    }

    interface String {
        /**
         * Map multiple strings (simply use replace multiple times...)
         * @param replaceList A list of tuples, each tuple is a replace mapping [from, to]
         */
        mapReplace(replaceList: [string, string | number][]): string;
        /**
         * Format strings like "{0}{1}{2}..." with arguments
         */
        format(...args: (string | number)[]): string;
    }

    interface Number {
        /** Format number with padding character */
        pad(len: number, char: string): string;
        pad0(len: number): string;
    }

    interface ObjectConstructor {
        /** Remove all properties whose values are undefined, use at your own risk */
        removeUndef(obj: any): void;
        /**
         * Recursively merge source object properties into target object
         * 
         * @param keepTarget If a primitive property exists in both target and source, keep target. Default true.
         */
        merge(target: any, source: any, keepTarget?: boolean): void;
        /** rename property if it exists */
        rename(obj: any, from: string, to: string): void;
    }

    interface Set<T> {
        union(other: Set<T | undefined | null>): Set<T>;
        intersect(other: Set<T | undefined | null>): Set<T>;
        diff(other: Set<T | undefined | null>): Set<T>;
    }

    interface Math {
        randInt(max: number): number;
        /**
         * @param probs Array of probabilities that has the sum of 1
         * @return index of the picked probability
         */
        randPickFromProbs(probs: number[]): number;
        /**
         * @param n How many times to perform random element swap, default is the length of array.
         */
        shuffle(arr: any[], n?: number): void;
    }
}


Array.prototype.clear = function() {
    this.length = 0;
}
Array.prototype.front = function() {
    return this[0];
}
Array.prototype.back = function() {
    return this[this.length - 1];
}
Array.prototype.moveToBack = function(fromIndex) {
    let tmp = this[fromIndex];
    this.splice(fromIndex, 1);
    this.push(tmp);
}
Array.prototype.swap = function(index1, index2) {
    let tmp = this[index1];
    this[index1] = this[index2];
    this[index2] = tmp;
}
Array.prototype.removeOnce = function(item) {
    let index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
    return this;
}
Array.prototype.union = function(other) {
    return [...new Set([...this, ...other])];
}
Array.prototype.intersect = function(other) {
    return this.filter(x => other.includes(x));
}
Array.prototype.diff = function(other) {
    return this.filter(x => !other.includes(x));
}

Array.isEqual = function(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (let i of Array.range(arr1.length)) {
        if (arr1[i] != arr2[i]) return false;
    }
    return true;
}
Array.rangeFrom = function(start: number, stop?: number, step?: number) {
    if (step === undefined) step = 1;
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    return Array.from({ length: (stop - start) / step }, (_, i) => start + (i * <number>step));
}
Array.range = function(start: number, stop?: number, step?: number) {
    if (step === undefined) step = 1;
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    const gen = function* () {
        for (let i = start; i != (<number>stop); i += (<number>step)) {
            yield i;
        }
    }
    return gen();
}

String.prototype.mapReplace = function(replaceList) {
    let s = this.toString();
    for (let [from, to] of replaceList) {
        s = s.replace(from, <string>to);
    }
    return s;
}
String.prototype.format = function(...args) {
    let s = this.toString();
    for (let i = 0; i < args.length; i++) {
        s = s.replace(`{${i}}`, <string>args[i]);
    }
    return s;
}

Number.prototype.pad = function(len, char) {
    return String(this).padStart(len, char);
}
Number.prototype.pad0 = function(len) {
    return String(this).padStart(len, '0');
}

Object.removeUndef = function(obj) {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
}

Object.merge = function(target, source, keepTarget=true) {
    if (keepTarget)
        _objectMergeKeepTarget(target, source);
    else
        _objectMergeKeepSource(target, source);
}

Object.rename = function(obj, from, to) {
    const val = obj[from];
    if (val !== undefined) {
        delete obj[from];
        obj[to] = val;
    }
}

function _objectMergeKeepTarget(target: any, source: any) {
    for (const key in source) {
        if (key in target) {
            const targetValue = target[key];
            // if this target property is still an object but not array, recursively merge
            // otherwise just keep the target property
            if (typeof targetValue == 'object' && (!Array.isArray(targetValue))) {
                _objectMergeKeepTarget(targetValue, source[key]);
            }
        }
        else
            target[key] = source[key];
    }
}
function _objectMergeKeepSource(target: any, source: any) {
    for (const key in source) {
        const targetValue = target[key];
        // if this target property is still an object but not array, recursively merge
        // otherwise replace with source property
        if (typeof targetValue == 'object' && (!Array.isArray(targetValue))) {
            _objectMergeKeepSource(targetValue, source[key]);
        }
        else
            target[key] = source[key];
    }
}

Set.prototype.union = function(other) {
    return new Set([...this, ...other]);
}
Set.prototype.intersect = function(other) {
    return new Set(
        Array.from(this).filter(x => other.has(x))
    );
}
Set.prototype.diff = function(other) {
    return new Set(
        Array.from(this).filter(x => !other.has(x))
    );
}

Math.randInt = function(max) {
    return Math.floor(Math.random() * max);
}
Math.randPickFromProbs = function(probs) {
    // with index
    let arr: NumPair[] = [];
    for (let i = 0; i < probs.length; i++) {
        arr.push([probs[i], i]);
    }
    arr.sort((a: NumPair, b: NumPair) => {
        return a[0] - b[0];
    });
    // pre sum
    for (let i = 1; i < probs.length; i++) {
        arr[i][0] += arr[i-1][0];
    }
    // get a random and determine where it belongs
    let r = Math.random();
    for (let [prob, index] of arr) {
        if (r <= prob) return index;
    }
    return -1;
}
Math.shuffle = function(arr, n) {
    if (n === undefined) n = arr.length;
    for (let i = 0; i < n; i++) {
        arr.swap(i, Math.randInt(arr.length));
    }
}

export {};