// tslint:disable-next-line:import-name
import uuidr = require('uuid/v4');
import { Class } from '../types/core';

// http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
export function getArgs(func: (...args: any[]) => any): string[] {
  return (func + '')
    .replace(/[/][/].*$/mg, '') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
    .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
    .replace(/=[^,]+/g, '') // strip any ES6 defaults
    .split(',').filter(Boolean); // split & filter [""]
}

export function uuid() {
  return uuidr();
}

export function password() {
  let u = uuid() + uuid();
  u = u.split('-').join('');
  let b = new Buffer(u, 'hex').toString('base64');
  b = b.split('+').join('').split('/').join('');
  const p = b.substr(0, 4) + '-' + b.substr(4, 4) + '-' + b.substr(8, 4) + '-' + b.substr(12, 4);
  return p;
}

// https://github.com/nof1000/isclass/blob/master/index.js
export function isClass(cls: any): cls is Function {
  if (typeof (cls) === 'function' && cls.prototype) {
    try {
      return !(cls.arguments && cls.caller);
    } catch (e) {
      return true;
    }
  }
  return false;
}

export function baseClass(cls: Class): Class {
  const p = cls && Object.getPrototypeOf(cls.prototype);
  return p && p.constructor;
}

export function label(val: any) {
  if (val instanceof Function) {
    if (isClass(val)) return `[class: ${val.name || 'inline'}]`;
    if (val.name) return `[function: ${val.name}]`;
    // TODO: is arrow function
    return `[ref: ${val.toString()}]`;
  }
  if (typeof val === 'object' && val && val.constructor) {
    return `[object: ${val.constructor.name}]`;
  }
  return val;
}

const notBase64 = /[^A-Z0-9+\/=\n\r]/i;

export function isUUID(str: string): boolean {
  if (!str) return false;
  return !!str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}

// const base64 = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$");

export function isBase64(str: string): boolean {
  let len = str.length;
  const firstPaddingIndex = str.indexOf('=');
  let firstPaddingChar = firstPaddingIndex;
  let firstCorrect = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '\r' || c === '\n') {
      len--;
      if (i < firstPaddingChar) firstCorrect++;
    }
  }
  if (firstPaddingChar > firstCorrect) firstPaddingChar -= firstCorrect;
  if (!len || len % 4 !== 0 || notBase64.test(str)) {
    return false;
  }
  return firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && str[firstPaddingIndex + 1] === '=');
}

const gzipPrefix = Buffer.from('1F8B', 'hex');

export function isGzip(buf: Buffer | string): boolean {
  // 1f 8b;
  if (typeof buf === 'string') {
    return buf.startsWith(gzipPrefix.toString());
  }
  if (typeof buf === 'object' && buf instanceof Buffer) {
    return (buf[0] === gzipPrefix[0] && buf[1] === gzipPrefix[1]);
  }
  return false;
}

export function wildcardMatch(rule: string, value: string) {
  return new RegExp('^' + rule.split('*').join('.*') + '$').test(value);
}

export function parseMap(map: string, prefix?: string) {
  const res: Record<string, any> = {};
  const parts = map.split(';').map(x => x.trim()).filter(x => x);
  for (const part of parts) {
    let key: string;
    let value: string;
    [key, value] = part.split('=').map(x => x.trim()).filter(x => x);
    res[(prefix || '') + key] = value;
  }
  return res;
}

/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
export function camelCase(str: string, firstCapital: boolean = false): string {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2, offset) => {
    if (firstCapital && offset === 0) return p1;
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

/**
 * Converts string into snake-case.
 *
 * @see https://regex101.com/r/QeSm2I/1
 */
export function snakeCase(str: string) {
  return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, '$1_$3$2$4').toLowerCase();
}

/**
 * Converts string into title-case.
 *
 * @see http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
