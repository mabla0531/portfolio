import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { sharedConfig, lazy, createComponent, catchError, ErrorBoundary, createSignal, onCleanup } from 'solid-js';
import { renderToString, ssrElement, escape, mergeProps, ssr, renderToStream, createComponent as createComponent$1, ssrHydrationKey, NoHydration, getRequestEvent, useAssets, Hydration, ssrAttribute, HydrationScript, isServer } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$1(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m$1(e._destroy,t._destroy);}};function _$2(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m$1(...n){return function(...e){for(const t of n)t(...e);}}const g$1=_$2();let A$2 = class A extends g$1{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$1 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$2;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}};function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}let w$1 = class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}};const E$2=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$1(n={}){const e=new E$2,t=Array.isArray(n)||H$2(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$2(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$2=new Set([101,204,205,304]);async function b$2(n,e){const t=new y$1,r=new w$1(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$1(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$2.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$2(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$1(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/home/matthew/dev/portfolio","order":0,"outDir":"/home/matthew/dev/portfolio/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/home/matthew/dev/portfolio","base":"/","outDir":"/home/matthew/dev/portfolio/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/home/matthew/dev/portfolio","outDir":"/home/matthew/dev/portfolio/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"node_modules/.deno/@solidjs+start@1.2.1/node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/home/matthew/dev/portfolio","outDir":"/home/matthew/dev/portfolio/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true}},"root":"/home/matthew/dev/portfolio"};
					const buildManifest = {"ssr":{"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"css":["assets/ssr-CnRtlel0.css"]}},"client":{"virtual:$vinxi/handler/client":{"file":"assets/client-DjeyUVO-.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"css":["assets/client-CiqG1pFM.css"]}},"server-fns":{"src/app.tsx":{"file":"assets/app-kJ4QPmu3.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"css":["assets/app-CiqG1pFM.css"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"dynamicImports":["src/app.tsx"]}}};

					const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"298-hdW7/pL89QptiszdYCHH67XxLxs\"",
    "mtime": "2025-12-22T09:29:42.415Z",
    "size": 664,
    "path": "../public/favicon.ico"
  },
  "/knocktwice.png": {
    "type": "image/png",
    "etag": "\"88081-5dj8wuDOybaAtBhd/5wx02Spq/w\"",
    "mtime": "2025-12-22T09:29:42.415Z",
    "size": 557185,
    "path": "../public/knocktwice.png"
  },
  "/aster.png": {
    "type": "image/png",
    "etag": "\"b3c09-4CIMyAIIK9fHa+x+A5iSHU1iNWE\"",
    "mtime": "2025-12-22T09:29:42.415Z",
    "size": 736265,
    "path": "../public/aster.png"
  },
  "/curlplusplus.png": {
    "type": "image/png",
    "etag": "\"6caaf-5d/6jiMDj9CXG1KVPqIwSJ3FhmU\"",
    "mtime": "2025-12-22T09:29:42.415Z",
    "size": 445103,
    "path": "../public/curlplusplus.png"
  },
  "/assets/ssr-CnRtlel0.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5aa9-fndTrfAd+Z7nBpgN3GZ3XCCwteQ\"",
    "mtime": "2025-12-22T09:29:42.424Z",
    "size": 23209,
    "path": "../public/assets/ssr-CnRtlel0.css"
  },
  "/assets/ssr-CnRtlel0.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"15ea-aDgmb9U6FO9ODV9/jr+vanCyeTI\"",
    "mtime": "2025-12-22T09:29:42.453Z",
    "size": 5610,
    "path": "../public/assets/ssr-CnRtlel0.css.gz"
  },
  "/assets/ssr-CnRtlel0.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"133c-ZzMuG9a7qQJzr5W9KP6i+MCaA/Y\"",
    "mtime": "2025-12-22T09:29:42.453Z",
    "size": 4924,
    "path": "../public/assets/ssr-CnRtlel0.css.br"
  },
  "/_build/assets/client-CiqG1pFM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ead-mCKGhAeWvGA7Yo8PMn1/Kz59OoI\"",
    "mtime": "2025-12-22T09:29:42.427Z",
    "size": 24237,
    "path": "../public/_build/assets/client-CiqG1pFM.css"
  },
  "/_build/assets/client-DjeyUVO-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5180-e1qBw3L4Pve3MrzwLo1576P+hqY\"",
    "mtime": "2025-12-22T09:29:42.427Z",
    "size": 20864,
    "path": "../public/_build/assets/client-DjeyUVO-.js"
  },
  "/_build/assets/client-CiqG1pFM.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"16a0-fNf2UGq13Hsn6Q6yQkTbDFNDdQA\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 5792,
    "path": "../public/_build/assets/client-CiqG1pFM.css.gz"
  },
  "/_build/assets/client-CiqG1pFM.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"13da-3E97RhK75xoUHkKSViqZ93iHWK4\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 5082,
    "path": "../public/_build/assets/client-CiqG1pFM.css.br"
  },
  "/_build/assets/client-DjeyUVO-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1ab6-rt0zrzMXupPhIhLp+u9hdGQtUcs\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 6838,
    "path": "../public/_build/assets/client-DjeyUVO-.js.gz"
  },
  "/_build/assets/client-DjeyUVO-.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"17e1-DhQnzL6bx7lz3LbUyFqudZb/vhc\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 6113,
    "path": "../public/_build/assets/client-DjeyUVO-.js.br"
  },
  "/_build/.vite/manifest.json": {
    "type": "application/json",
    "etag": "\"e2-NCw18qqGNEN1HtMFntClfD0LD6Q\"",
    "mtime": "2025-12-22T09:29:42.427Z",
    "size": 226,
    "path": "../public/_build/.vite/manifest.json"
  },
  "/_server/assets/app-CiqG1pFM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ead-mCKGhAeWvGA7Yo8PMn1/Kz59OoI\"",
    "mtime": "2025-12-22T09:29:42.429Z",
    "size": 24237,
    "path": "../public/_server/assets/app-CiqG1pFM.css"
  },
  "/_server/assets/app-CiqG1pFM.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"16a0-fNf2UGq13Hsn6Q6yQkTbDFNDdQA\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 5792,
    "path": "../public/_server/assets/app-CiqG1pFM.css.gz"
  },
  "/_server/assets/app-CiqG1pFM.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"13da-3E97RhK75xoUHkKSViqZ93iHWK4\"",
    "mtime": "2025-12-22T09:29:42.522Z",
    "size": 5082,
    "path": "../public/_server/assets/app-CiqG1pFM.css.br"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _AccgMX = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Un(e, t) {
  const n = (e || "").split(";").filter((c) => typeof c == "string" && !!c.trim()), r = n.shift() || "", s = Hn(r), i = s.name;
  let o = s.value;
  try {
    o = (t == null ? void 0 : t.decode) === false ? o : ((t == null ? void 0 : t.decode) || decodeURIComponent)(o);
  } catch {
  }
  const u = { name: i, value: o };
  for (const c of n) {
    const l = c.split("="), p = (l.shift() || "").trimStart().toLowerCase(), h = l.join("=");
    switch (p) {
      case "expires": {
        u.expires = new Date(h);
        break;
      }
      case "max-age": {
        u.maxAge = Number.parseInt(h, 10);
        break;
      }
      case "secure": {
        u.secure = true;
        break;
      }
      case "httponly": {
        u.httpOnly = true;
        break;
      }
      case "samesite": {
        u.sameSite = h;
        break;
      }
      default:
        u[p] = h;
    }
  }
  return u;
}
function Hn(e) {
  let t = "", n = "";
  const r = e.split("=");
  return r.length > 1 ? (t = r.shift(), n = r.join("=")) : n = e, { name: t, value: n };
}
var qn = ((e) => (e[e.AggregateError = 1] = "AggregateError", e[e.ArrowFunction = 2] = "ArrowFunction", e[e.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", e[e.ObjectAssign = 8] = "ObjectAssign", e[e.BigIntTypedArray = 16] = "BigIntTypedArray", e[e.RegExp = 32] = "RegExp", e))(qn || {}), k$1 = Symbol.asyncIterator, yt$1 = Symbol.hasInstance, U = Symbol.isConcatSpreadable, x = Symbol.iterator, mt$1 = Symbol.match, bt$1 = Symbol.matchAll, wt$1 = Symbol.replace, vt$1 = Symbol.search, St$1 = Symbol.species, Rt$1 = Symbol.split, Et$1 = Symbol.toPrimitive, H$1 = Symbol.toStringTag, At$1 = Symbol.unscopables, Dn = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, kt$1 = { [k$1]: 0, [yt$1]: 1, [U]: 2, [x]: 3, [mt$1]: 4, [bt$1]: 5, [wt$1]: 6, [vt$1]: 7, [St$1]: 8, [Rt$1]: 9, [Et$1]: 10, [H$1]: 11, [At$1]: 12 }, Mn = { 0: k$1, 1: yt$1, 2: U, 3: x, 4: mt$1, 5: bt$1, 6: wt$1, 7: vt$1, 8: St$1, 9: Rt$1, 10: Et$1, 11: H$1, 12: At$1 }, Bn = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, a = void 0, Wn = { 2: true, 3: false, 1: a, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN }, xt$1 = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, Vn = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function g(e, t, n, r, s, i, o, u, c, l, p) {
  return { t: e, i: t, s: n, c: r, m: s, p: i, e: o, a: u, f: c, b: l, o: p };
}
function z$1(e) {
  return g(2, a, e, a, a, a, a, a, a, a, a);
}
var _t$1 = z$1(2), $t$1 = z$1(3), Xn = z$1(1), Gn = z$1(0), Yn = z$1(4), Jn = z$1(5), Kn = z$1(6), Zn = z$1(7);
function Qn(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return a;
  }
}
function A$1(e) {
  let t = "", n = 0, r;
  for (let s = 0, i = e.length; s < i; s++) r = Qn(e[s]), r && (t += e.slice(n, s) + r, n = s + 1);
  return n === 0 ? t = e : t += e.slice(n), t;
}
function er(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function N$1(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, er);
}
var W = "__SEROVAL_REFS__", ie = "$R", re = `self.${ie}`;
function tr(e) {
  return e == null ? `${re}=${re}||[]` : `(${re}=${re}||{})["${A$1(e)}"]=[]`;
}
var zt = /* @__PURE__ */ new Map(), F$1 = /* @__PURE__ */ new Map();
function Ct$1(e) {
  return zt.has(e);
}
function nr(e) {
  return F$1.has(e);
}
function rr(e) {
  if (Ct$1(e)) return zt.get(e);
  throw new Ir(e);
}
function sr(e) {
  if (nr(e)) return F$1.get(e);
  throw new Tr(e);
}
typeof globalThis < "u" ? Object.defineProperty(globalThis, W, { value: F$1, configurable: true, writable: false, enumerable: false }) : typeof self < "u" ? Object.defineProperty(self, W, { value: F$1, configurable: true, writable: false, enumerable: false }) : typeof global < "u" && Object.defineProperty(global, W, { value: F$1, configurable: true, writable: false, enumerable: false });
function Oe$1(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function ar(e) {
  let t = xt$1[Oe$1(e)];
  return e.name !== t ? { name: e.name } : e.constructor.name !== t ? { name: e.constructor.name } : {};
}
function It(e, t) {
  let n = ar(e), r = Object.getOwnPropertyNames(e);
  for (let s = 0, i = r.length, o; s < i; s++) o = r[s], o !== "name" && o !== "message" && (o === "stack" ? t & 4 && (n = n || {}, n[o] = e[o]) : (n = n || {}, n[o] = e[o]));
  return n;
}
function Tt$1(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function ir(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return Jn;
    case Number.NEGATIVE_INFINITY:
      return Kn;
  }
  return e !== e ? Zn : Object.is(e, -0) ? Yn : g(0, a, e, a, a, a, a, a, a, a, a);
}
function Ot$1(e) {
  return g(1, a, A$1(e), a, a, a, a, a, a, a, a);
}
function or(e) {
  return g(3, a, "" + e, a, a, a, a, a, a, a, a);
}
function ur(e) {
  return g(4, e, a, a, a, a, a, a, a, a, a);
}
function cr(e, t) {
  let n = t.valueOf();
  return g(5, e, n !== n ? "" : t.toISOString(), a, a, a, a, a, a, a, a);
}
function lr(e, t) {
  return g(6, e, a, A$1(t.source), t.flags, a, a, a, a, a, a);
}
function fr(e, t) {
  return g(17, e, kt$1[t], a, a, a, a, a, a, a, a);
}
function pr(e, t) {
  return g(18, e, A$1(rr(t)), a, a, a, a, a, a, a, a);
}
function Nt$1(e, t, n) {
  return g(25, e, n, A$1(t), a, a, a, a, a, a, a);
}
function dr(e, t, n) {
  return g(9, e, a, a, a, a, a, n, a, a, Tt$1(t));
}
function hr(e, t) {
  return g(21, e, a, a, a, a, a, a, t, a, a);
}
function gr(e, t, n) {
  return g(15, e, a, t.constructor.name, a, a, a, a, n, t.byteOffset, a);
}
function yr(e, t, n) {
  return g(16, e, a, t.constructor.name, a, a, a, a, n, t.byteOffset, a);
}
function mr(e, t, n) {
  return g(20, e, a, a, a, a, a, a, n, t.byteOffset, a);
}
function br(e, t, n) {
  return g(13, e, Oe$1(t), a, A$1(t.message), n, a, a, a, a, a);
}
function wr(e, t, n) {
  return g(14, e, Oe$1(t), a, A$1(t.message), n, a, a, a, a, a);
}
function vr(e, t) {
  return g(7, e, a, a, a, a, a, t, a, a, a);
}
function Sr(e, t) {
  return g(28, a, a, a, a, a, a, [e, t], a, a, a);
}
function Rr(e, t) {
  return g(30, a, a, a, a, a, a, [e, t], a, a, a);
}
function Er(e, t, n) {
  return g(31, e, a, a, a, a, a, n, t, a, a);
}
function Ar(e, t) {
  return g(32, e, a, a, a, a, a, a, t, a, a);
}
function kr(e, t) {
  return g(33, e, a, a, a, a, a, a, t, a, a);
}
function xr(e, t) {
  return g(34, e, a, a, a, a, a, a, t, a, a);
}
var _r = { parsing: 1, serialization: 2, deserialization: 3 };
function $r(e) {
  return `Seroval Error (step: ${_r[e]})`;
}
var zr = (e, t) => $r(e), Pt = class extends Error {
  constructor(e, t) {
    super(zr(e)), this.cause = t;
  }
}, Be$1 = class Be extends Pt {
  constructor(e) {
    super("parsing", e);
  }
}, Cr = class extends Pt {
  constructor(e) {
    super("deserialization", e);
  }
};
function _$1(e) {
  return `Seroval Error (specific: ${e})`;
}
var ce = class extends Error {
  constructor(e) {
    super(_$1(1)), this.value = e;
  }
}, P$1 = class P extends Error {
  constructor(e) {
    super(_$1(2));
  }
}, Lt$1 = class Lt extends Error {
  constructor(e) {
    super(_$1(3));
  }
}, Q$1 = class Q extends Error {
  constructor(e) {
    super(_$1(4));
  }
}, Ir = class extends Error {
  constructor(e) {
    super(_$1(5)), this.value = e;
  }
}, Tr = class extends Error {
  constructor(e) {
    super(_$1(6));
  }
}, Or = class extends Error {
  constructor(e) {
    super(_$1(7));
  }
}, C = class extends Error {
  constructor(t) {
    super(_$1(8));
  }
}, jt$1 = class jt extends Error {
  constructor(t) {
    super(_$1(9));
  }
}, Nr = class {
  constructor(t, n) {
    this.value = t, this.replacement = n;
  }
}, le = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((t, n) => {
    e.s = t, e.f = n;
  }), e;
}, Pr = (e, t) => {
  e.s(t), e.p.s = 1, e.p.v = t;
}, Lr = (e, t) => {
  e.f(t), e.p.s = 2, e.p.v = t;
}, jr = le.toString(), Fr = Pr.toString(), Ur = Lr.toString(), Ft = () => {
  let e = [], t = [], n = true, r = false, s = 0, i = (c, l, p) => {
    for (p = 0; p < s; p++) t[p] && t[p][l](c);
  }, o = (c, l, p, h) => {
    for (l = 0, p = e.length; l < p; l++) h = e[l], !n && l === p - 1 ? c[r ? "return" : "throw"](h) : c.next(h);
  }, u = (c, l) => (n && (l = s++, t[l] = c), o(c), () => {
    n && (t[l] = t[s], t[s--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (c) => u(c), next: (c) => {
    n && (e.push(c), i(c, "next"));
  }, throw: (c) => {
    n && (e.push(c), i(c, "throw"), n = false, r = false, t.length = 0);
  }, return: (c) => {
    n && (e.push(c), i(c, "return"), n = false, r = true, t.length = 0);
  } };
}, Hr = Ft.toString(), Ut = (e) => (t) => () => {
  let n = 0, r = { [e]: () => r, next: () => {
    if (n > t.d) return { done: true, value: void 0 };
    let s = n++, i = t.v[s];
    if (s === t.t) throw i;
    return { done: s === t.d, value: i };
  } };
  return r;
}, qr = Ut.toString(), Ht$1 = (e, t) => (n) => () => {
  let r = 0, s = -1, i = false, o = [], u = [], c = (p = 0, h = u.length) => {
    for (; p < h; p++) u[p].s({ done: true, value: void 0 });
  };
  n.on({ next: (p) => {
    let h = u.shift();
    h && h.s({ done: false, value: p }), o.push(p);
  }, throw: (p) => {
    let h = u.shift();
    h && h.f(p), c(), s = o.length, i = true, o.push(p);
  }, return: (p) => {
    let h = u.shift();
    h && h.s({ done: true, value: p }), c(), s = o.length, o.push(p);
  } });
  let l = { [e]: () => l, next: () => {
    if (s === -1) {
      let v = r++;
      if (v >= o.length) {
        let f = t();
        return u.push(f), f.p;
      }
      return { done: false, value: o[v] };
    }
    if (r > s) return { done: true, value: void 0 };
    let p = r++, h = o[p];
    if (p !== s) return { done: false, value: h };
    if (i) throw h;
    return { done: true, value: h };
  } };
  return l;
}, Dr = Ht$1.toString(), qt = (e) => {
  let t = atob(e), n = t.length, r = new Uint8Array(n);
  for (let s = 0; s < n; s++) r[s] = t.charCodeAt(s);
  return r.buffer;
}, Mr = qt.toString(), Br = {}, Wr = {}, Vr = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Xr = { 0: "[]", 1: jr, 2: Fr, 3: Ur, 4: Hr, 5: Mr };
function fe(e) {
  return "__SEROVAL_STREAM__" in e;
}
function ee() {
  return Ft();
}
function Gr(e) {
  let t = ee(), n = e[k$1]();
  async function r() {
    try {
      let s = await n.next();
      s.done ? t.return(s.value) : (t.next(s.value), await r());
    } catch (s) {
      t.throw(s);
    }
  }
  return r().catch(() => {
  }), t;
}
var Yr = Ht$1(k$1, le);
function Jr(e) {
  return Yr(e);
}
function Kr(e) {
  let t = [], n = -1, r = -1, s = e[x]();
  for (; ; ) try {
    let i = s.next();
    if (t.push(i.value), i.done) {
      r = t.length - 1;
      break;
    }
  } catch (i) {
    n = t.length, t.push(i);
  }
  return { v: t, t: n, d: r };
}
var Zr = Ut(x);
function Qr(e) {
  return Zr(e);
}
function es(e, t) {
  return { plugins: t.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (t.disabledFeatures || 0), refs: t.refs || /* @__PURE__ */ new Map(), depthLimit: t.depthLimit || 1e3 };
}
function ts(e, t) {
  e.marked.add(t);
}
function Dt(e, t) {
  let n = e.refs.size;
  return e.refs.set(t, n), n;
}
function pe(e, t) {
  let n = e.refs.get(t);
  return n != null ? (ts(e, n), { type: 1, value: ur(n) }) : { type: 0, value: Dt(e, t) };
}
function Ne$1(e, t) {
  let n = pe(e, t);
  return n.type === 1 ? n : Ct$1(t) ? { type: 2, value: pr(n.value, t) } : n;
}
function I$1(e, t) {
  let n = Ne$1(e, t);
  if (n.type !== 0) return n.value;
  if (t in kt$1) return fr(n.value, t);
  throw new ce(t);
}
function L$1(e, t) {
  let n = pe(e, Vr[t]);
  return n.type === 1 ? n.value : g(26, n.value, t, a, a, a, a, a, a, a, a);
}
function ns(e) {
  let t = pe(e, Br);
  return t.type === 1 ? t.value : g(27, t.value, a, a, a, a, a, a, I$1(e, x), a, a);
}
function rs(e) {
  let t = pe(e, Wr);
  return t.type === 1 ? t.value : g(29, t.value, a, a, a, a, a, [L$1(e, 1), I$1(e, k$1)], a, a, a);
}
function ss(e, t, n, r) {
  return g(n ? 11 : 10, e, a, a, a, r, a, a, a, a, Tt$1(t));
}
function as(e, t, n, r) {
  return g(8, t, a, a, a, a, { k: n, v: r }, a, L$1(e, 0), a, a);
}
function is(e, t, n) {
  return g(22, t, n, a, a, a, a, a, L$1(e, 1), a, a);
}
function os(e, t, n) {
  let r = new Uint8Array(n), s = "";
  for (let i = 0, o = r.length; i < o; i++) s += String.fromCharCode(r[i]);
  return g(19, t, A$1(btoa(s)), a, a, a, a, a, L$1(e, 5), a, a);
}
var us = ((e) => (e[e.Vanilla = 1] = "Vanilla", e[e.Cross = 2] = "Cross", e))(us || {});
function Mt(e, t) {
  for (let n = 0, r = t.length; n < r; n++) {
    let s = t[n];
    e.has(s) || (e.add(s), s.extends && Mt(e, s.extends));
  }
}
function Bt(e) {
  if (e) {
    let t = /* @__PURE__ */ new Set();
    return Mt(t, e), [...t];
  }
}
function cs(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new Or(e);
  }
}
var ls = 1e6, fs = 1e4, ps = 2e4;
function Wt(e, t) {
  switch (t) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var ds = 1e3;
function hs(e, t) {
  var n;
  return { mode: e, plugins: t.plugins, refs: t.refs || /* @__PURE__ */ new Map(), features: (n = t.features) != null ? n : 63 ^ (t.disabledFeatures || 0), depthLimit: t.depthLimit || ds };
}
function gs(e) {
  return { mode: 1, base: hs(1, e), child: a, state: { marked: new Set(e.markedRefs) } };
}
var ys = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  deserialize(e) {
    return m(this._p, this.depth, e);
  }
};
function Vt(e, t) {
  if (t < 0 || !Number.isFinite(t) || !Number.isInteger(t)) throw new C({ t: 4, i: t });
  if (e.refs.has(t)) throw new Error("Conflicted ref id: " + t);
}
function ms(e, t, n) {
  return Vt(e.base, t), e.state.marked.has(t) && e.base.refs.set(t, n), n;
}
function bs(e, t, n) {
  return Vt(e.base, t), e.base.refs.set(t, n), n;
}
function b$1(e, t, n) {
  return e.mode === 1 ? ms(e, t, n) : bs(e, t, n);
}
function Re(e, t, n) {
  if (Object.hasOwn(t, n)) return t[n];
  throw new C(e);
}
function ws(e, t) {
  return b$1(e, t.i, sr(N$1(t.s)));
}
function vs(e, t, n) {
  let r = n.a, s = r.length, i = b$1(e, n.i, new Array(s));
  for (let o = 0, u; o < s; o++) u = r[o], u && (i[o] = m(e, t, u));
  return Wt(i, n.o), i;
}
function Ss(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function Rs(e) {
  switch (e) {
    case k$1:
    case U:
    case H$1:
    case x:
      return true;
    default:
      return false;
  }
}
function We$1(e, t, n) {
  Ss(t) ? e[t] = n : Object.defineProperty(e, t, { value: n, configurable: true, enumerable: true, writable: true });
}
function Es(e, t, n, r, s) {
  if (typeof r == "string") We$1(n, r, m(e, t, s));
  else {
    let i = m(e, t, r);
    switch (typeof i) {
      case "string":
        We$1(n, i, m(e, t, s));
        break;
      case "symbol":
        Rs(i) && (n[i] = m(e, t, s));
        break;
      default:
        throw new C(r);
    }
  }
}
function Xt(e, t, n, r) {
  let s = n.k;
  if (s.length > 0) for (let i = 0, o = n.v, u = s.length; i < u; i++) Es(e, t, r, s[i], o[i]);
  return r;
}
function As(e, t, n) {
  let r = b$1(e, n.i, n.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return Xt(e, t, n.p, r), Wt(r, n.o), r;
}
function ks(e, t) {
  return b$1(e, t.i, new Date(t.s));
}
function xs(e, t) {
  if (e.base.features & 32) {
    let n = N$1(t.c);
    if (n.length > ps) throw new C(t);
    return b$1(e, t.i, new RegExp(n, t.m));
  }
  throw new P$1(t);
}
function _s(e, t, n) {
  let r = b$1(e, n.i, /* @__PURE__ */ new Set());
  for (let s = 0, i = n.a, o = i.length; s < o; s++) r.add(m(e, t, i[s]));
  return r;
}
function $s(e, t, n) {
  let r = b$1(e, n.i, /* @__PURE__ */ new Map());
  for (let s = 0, i = n.e.k, o = n.e.v, u = i.length; s < u; s++) r.set(m(e, t, i[s]), m(e, t, o[s]));
  return r;
}
function zs(e, t) {
  if (t.s.length > ls) throw new C(t);
  return b$1(e, t.i, qt(N$1(t.s)));
}
function Cs(e, t, n) {
  var r;
  let s = cs(n.c), i = m(e, t, n.f), o = (r = n.b) != null ? r : 0;
  if (o < 0 || o > i.byteLength) throw new C(n);
  return b$1(e, n.i, new s(i, o));
}
function Is(e, t, n) {
  var r;
  let s = m(e, t, n.f), i = (r = n.b) != null ? r : 0;
  if (i < 0 || i > s.byteLength) throw new C(n);
  return b$1(e, n.i, new DataView(s, i));
}
function Gt(e, t, n, r) {
  if (n.p) {
    let s = Xt(e, t, n.p, {});
    Object.defineProperties(r, Object.getOwnPropertyDescriptors(s));
  }
  return r;
}
function Ts(e, t, n) {
  let r = b$1(e, n.i, new AggregateError([], N$1(n.m)));
  return Gt(e, t, n, r);
}
function Os(e, t, n) {
  let r = Re(n, Vn, n.s), s = b$1(e, n.i, new r(N$1(n.m)));
  return Gt(e, t, n, s);
}
function Ns(e, t, n) {
  let r = le(), s = b$1(e, n.i, r.p), i = m(e, t, n.f);
  return n.s ? r.s(i) : r.f(i), s;
}
function Ps(e, t, n) {
  return b$1(e, n.i, Object(m(e, t, n.f)));
}
function Ls(e, t, n) {
  let r = e.base.plugins;
  if (r) {
    let s = N$1(n.c);
    for (let i = 0, o = r.length; i < o; i++) {
      let u = r[i];
      if (u.tag === s) return b$1(e, n.i, u.deserialize(n.s, new ys(e, t), { id: n.i }));
    }
  }
  throw new Lt$1(n.c);
}
function js(e, t) {
  return b$1(e, t.i, b$1(e, t.s, le()).p);
}
function Fs(e, t, n) {
  let r = e.base.refs.get(n.i);
  if (r) return r.s(m(e, t, n.a[1])), a;
  throw new Q$1("Promise");
}
function Us(e, t, n) {
  let r = e.base.refs.get(n.i);
  if (r) return r.f(m(e, t, n.a[1])), a;
  throw new Q$1("Promise");
}
function Hs(e, t, n) {
  m(e, t, n.a[0]);
  let r = m(e, t, n.a[1]);
  return Qr(r);
}
function qs(e, t, n) {
  m(e, t, n.a[0]);
  let r = m(e, t, n.a[1]);
  return Jr(r);
}
function Ds(e, t, n) {
  let r = b$1(e, n.i, ee()), s = n.a, i = s.length;
  if (i) for (let o = 0; o < i; o++) m(e, t, s[o]);
  return r;
}
function Ms(e, t, n) {
  let r = e.base.refs.get(n.i);
  if (r && fe(r)) return r.next(m(e, t, n.f)), a;
  throw new Q$1("Stream");
}
function Bs(e, t, n) {
  let r = e.base.refs.get(n.i);
  if (r && fe(r)) return r.throw(m(e, t, n.f)), a;
  throw new Q$1("Stream");
}
function Ws(e, t, n) {
  let r = e.base.refs.get(n.i);
  if (r && fe(r)) return r.return(m(e, t, n.f)), a;
  throw new Q$1("Stream");
}
function Vs(e, t, n) {
  return m(e, t, n.f), a;
}
function Xs(e, t, n) {
  return m(e, t, n.a[1]), a;
}
function m(e, t, n) {
  if (t > e.base.depthLimit) throw new jt$1(e.base.depthLimit);
  switch (t += 1, n.t) {
    case 2:
      return Re(n, Wn, n.s);
    case 0:
      return Number(n.s);
    case 1:
      return N$1(String(n.s));
    case 3:
      if (String(n.s).length > fs) throw new C(n);
      return BigInt(n.s);
    case 4:
      return e.base.refs.get(n.i);
    case 18:
      return ws(e, n);
    case 9:
      return vs(e, t, n);
    case 10:
    case 11:
      return As(e, t, n);
    case 5:
      return ks(e, n);
    case 6:
      return xs(e, n);
    case 7:
      return _s(e, t, n);
    case 8:
      return $s(e, t, n);
    case 19:
      return zs(e, n);
    case 16:
    case 15:
      return Cs(e, t, n);
    case 20:
      return Is(e, t, n);
    case 14:
      return Ts(e, t, n);
    case 13:
      return Os(e, t, n);
    case 12:
      return Ns(e, t, n);
    case 17:
      return Re(n, Mn, n.s);
    case 21:
      return Ps(e, t, n);
    case 25:
      return Ls(e, t, n);
    case 22:
      return js(e, n);
    case 23:
      return Fs(e, t, n);
    case 24:
      return Us(e, t, n);
    case 28:
      return Hs(e, t, n);
    case 30:
      return qs(e, t, n);
    case 31:
      return Ds(e, t, n);
    case 32:
      return Ms(e, t, n);
    case 33:
      return Bs(e, t, n);
    case 34:
      return Ws(e, t, n);
    case 27:
      return Vs(e, t, n);
    case 29:
      return Xs(e, t, n);
    default:
      throw new P$1(n);
  }
}
function Gs(e, t) {
  try {
    return m(e, 0, t);
  } catch (n) {
    throw new Cr(n);
  }
}
var Ys = () => T, Js = Ys.toString(), Yt = /=>/.test(Js);
function Jt(e, t) {
  return Yt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (t.startsWith("{") ? "(" + t + ")" : t) : "function(" + e.join(",") + "){return " + t + "}";
}
function Ks(e, t) {
  return Yt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + t + "}" : "function(" + e.join(",") + "){" + t + "}";
}
var Kt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", Ve$1 = Kt.length, Zt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Xe$1 = Zt.length;
function Zs(e) {
  let t = e % Ve$1, n = Kt[t];
  for (e = (e - t) / Ve$1; e > 0; ) t = e % Xe$1, n += Zt[t], e = (e - t) / Xe$1;
  return n;
}
var Qs = /^[$A-Z_][0-9A-Z_$]*$/i;
function Qt(e) {
  let t = e[0];
  return (t === "$" || t === "_" || t >= "A" && t <= "Z" || t >= "a" && t <= "z") && Qs.test(e);
}
function V(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function ea(e) {
  let t = [], n = e[0];
  for (let r = 1, s = e.length, i, o = n; r < s; r++) i = e[r], i.t === 0 && i.v === o.v ? n = { t: 0, s: i.s, k: a, v: V(n) } : i.t === 2 && i.s === o.s ? n = { t: 2, s: V(n), k: i.k, v: i.v } : i.t === 1 && i.s === o.s ? n = { t: 1, s: V(n), k: a, v: i.v } : i.t === 3 && i.s === o.s ? n = { t: 3, s: V(n), k: i.k, v: a } : (t.push(n), n = i), o = i;
  return t.push(n), t;
}
function en(e) {
  if (e.length) {
    let t = "", n = ea(e);
    for (let r = 0, s = n.length; r < s; r++) t += V(n[r]) + ",";
    return t;
  }
  return a;
}
var ta = "Object.create(null)", na = "new Set", ra = "new Map", sa = "Promise.resolve", aa = "Promise.reject", ia = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: a };
function oa(e, t) {
  return { mode: e, plugins: t.plugins, features: t.features, marked: new Set(t.markedRefs), stack: [], flags: [], assignments: [] };
}
function ua(e) {
  return { mode: 2, base: oa(2, e), state: e, child: a };
}
var ca = class {
  constructor(e) {
    this._p = e;
  }
  serialize(e) {
    return d(this._p, e);
  }
};
function la(e, t) {
  let n = e.valid.get(t);
  n == null && (n = e.valid.size, e.valid.set(t, n));
  let r = e.vars[n];
  return r == null && (r = Zs(n), e.vars[n] = r), r;
}
function fa(e) {
  return ie + "[" + e + "]";
}
function y(e, t) {
  return e.mode === 1 ? la(e.state, t) : fa(t);
}
function E$1(e, t) {
  e.marked.add(t);
}
function Ee(e, t) {
  return e.marked.has(t);
}
function Pe$1(e, t, n) {
  t !== 0 && (E$1(e.base, n), e.base.flags.push({ type: t, value: y(e, n) }));
}
function pa(e) {
  let t = "";
  for (let n = 0, r = e.flags, s = r.length; n < s; n++) {
    let i = r[n];
    t += ia[i.type] + "(" + i.value + "),";
  }
  return t;
}
function da(e) {
  let t = en(e.assignments), n = pa(e);
  return t ? n ? t + n : t : n;
}
function tn(e, t, n) {
  e.assignments.push({ t: 0, s: t, k: a, v: n });
}
function ha(e, t, n) {
  e.base.assignments.push({ t: 1, s: y(e, t), k: a, v: n });
}
function B$1(e, t, n, r) {
  e.base.assignments.push({ t: 2, s: y(e, t), k: n, v: r });
}
function Ge$1(e, t, n) {
  e.base.assignments.push({ t: 3, s: y(e, t), k: n, v: a });
}
function Y$1(e, t, n, r) {
  tn(e.base, y(e, t) + "[" + n + "]", r);
}
function Ae$1(e, t, n, r) {
  tn(e.base, y(e, t) + "." + n, r);
}
function $(e, t) {
  return t.t === 4 && e.stack.includes(t.i);
}
function M$1(e, t, n) {
  return e.mode === 1 && !Ee(e.base, t) ? n : y(e, t) + "=" + n;
}
function ga(e) {
  return W + '.get("' + e.s + '")';
}
function Ye$1(e, t, n, r) {
  return n ? $(e.base, n) ? (E$1(e.base, t), Y$1(e, t, r, y(e, n.i)), "") : d(e, n) : "";
}
function ya(e, t) {
  let n = t.i, r = t.a, s = r.length;
  if (s > 0) {
    e.base.stack.push(n);
    let i = Ye$1(e, n, r[0], 0), o = i === "";
    for (let u = 1, c; u < s; u++) c = Ye$1(e, n, r[u], u), i += "," + c, o = c === "";
    return e.base.stack.pop(), Pe$1(e, t.o, t.i), "[" + i + (o ? ",]" : "]");
  }
  return "[]";
}
function Je$1(e, t, n, r) {
  if (typeof n == "string") {
    let s = Number(n), i = s >= 0 && s.toString() === n || Qt(n);
    if ($(e.base, r)) {
      let o = y(e, r.i);
      return E$1(e.base, t.i), i && s !== s ? Ae$1(e, t.i, n, o) : Y$1(e, t.i, i ? n : '"' + n + '"', o), "";
    }
    return (i ? n : '"' + n + '"') + ":" + d(e, r);
  }
  return "[" + d(e, n) + "]:" + d(e, r);
}
function nn(e, t, n) {
  let r = n.k, s = r.length;
  if (s > 0) {
    let i = n.v;
    e.base.stack.push(t.i);
    let o = Je$1(e, t, r[0], i[0]);
    for (let u = 1, c = o; u < s; u++) c = Je$1(e, t, r[u], i[u]), o += (c && o && ",") + c;
    return e.base.stack.pop(), "{" + o + "}";
  }
  return "{}";
}
function ma(e, t) {
  return Pe$1(e, t.o, t.i), nn(e, t, t.p);
}
function ba(e, t, n, r) {
  let s = nn(e, t, n);
  return s !== "{}" ? "Object.assign(" + r + "," + s + ")" : r;
}
function wa(e, t, n, r, s) {
  let i = e.base, o = d(e, s), u = Number(r), c = u >= 0 && u.toString() === r || Qt(r);
  if ($(i, s)) c && u !== u ? Ae$1(e, t.i, r, o) : Y$1(e, t.i, c ? r : '"' + r + '"', o);
  else {
    let l = i.assignments;
    i.assignments = n, c && u !== u ? Ae$1(e, t.i, r, o) : Y$1(e, t.i, c ? r : '"' + r + '"', o), i.assignments = l;
  }
}
function va(e, t, n, r, s) {
  if (typeof r == "string") wa(e, t, n, r, s);
  else {
    let i = e.base, o = i.stack;
    i.stack = [];
    let u = d(e, s);
    i.stack = o;
    let c = i.assignments;
    i.assignments = n, Y$1(e, t.i, d(e, r), u), i.assignments = c;
  }
}
function Sa(e, t, n) {
  let r = n.k, s = r.length;
  if (s > 0) {
    let i = [], o = n.v;
    e.base.stack.push(t.i);
    for (let u = 0; u < s; u++) va(e, t, i, r[u], o[u]);
    return e.base.stack.pop(), en(i);
  }
  return a;
}
function Le$1(e, t, n) {
  if (t.p) {
    let r = e.base;
    if (r.features & 8) n = ba(e, t, t.p, n);
    else {
      E$1(r, t.i);
      let s = Sa(e, t, t.p);
      if (s) return "(" + M$1(e, t.i, n) + "," + s + y(e, t.i) + ")";
    }
  }
  return n;
}
function Ra(e, t) {
  return Pe$1(e, t.o, t.i), Le$1(e, t, ta);
}
function Ea(e) {
  return 'new Date("' + e.s + '")';
}
function Aa(e, t) {
  if (e.base.features & 32) return "/" + t.c + "/" + t.m;
  throw new P$1(t);
}
function Ke$1(e, t, n) {
  let r = e.base;
  return $(r, n) ? (E$1(r, t), ha(e, t, y(e, n.i)), "") : d(e, n);
}
function ka(e, t) {
  let n = na, r = t.a, s = r.length, i = t.i;
  if (s > 0) {
    e.base.stack.push(i);
    let o = Ke$1(e, i, r[0]);
    for (let u = 1, c = o; u < s; u++) c = Ke$1(e, i, r[u]), o += (c && o && ",") + c;
    e.base.stack.pop(), o && (n += "([" + o + "])");
  }
  return n;
}
function Ze$1(e, t, n, r, s) {
  let i = e.base;
  if ($(i, n)) {
    let o = y(e, n.i);
    if (E$1(i, t), $(i, r)) {
      let c = y(e, r.i);
      return B$1(e, t, o, c), "";
    }
    if (r.t !== 4 && r.i != null && Ee(i, r.i)) {
      let c = "(" + d(e, r) + ",[" + s + "," + s + "])";
      return B$1(e, t, o, y(e, r.i)), Ge$1(e, t, s), c;
    }
    let u = i.stack;
    return i.stack = [], B$1(e, t, o, d(e, r)), i.stack = u, "";
  }
  if ($(i, r)) {
    let o = y(e, r.i);
    if (E$1(i, t), n.t !== 4 && n.i != null && Ee(i, n.i)) {
      let c = "(" + d(e, n) + ",[" + s + "," + s + "])";
      return B$1(e, t, y(e, n.i), o), Ge$1(e, t, s), c;
    }
    let u = i.stack;
    return i.stack = [], B$1(e, t, d(e, n), o), i.stack = u, "";
  }
  return "[" + d(e, n) + "," + d(e, r) + "]";
}
function xa(e, t) {
  let n = ra, r = t.e.k, s = r.length, i = t.i, o = t.f, u = y(e, o.i), c = e.base;
  if (s > 0) {
    let l = t.e.v;
    c.stack.push(i);
    let p = Ze$1(e, i, r[0], l[0], u);
    for (let h = 1, v = p; h < s; h++) v = Ze$1(e, i, r[h], l[h], u), p += (v && p && ",") + v;
    c.stack.pop(), p && (n += "([" + p + "])");
  }
  return o.t === 26 && (E$1(c, o.i), n = "(" + d(e, o) + "," + n + ")"), n;
}
function _a(e, t) {
  return j(e, t.f) + '("' + t.s + '")';
}
function $a(e, t) {
  return "new " + t.c + "(" + d(e, t.f) + "," + t.b + ")";
}
function za(e, t) {
  return "new DataView(" + d(e, t.f) + "," + t.b + ")";
}
function Ca(e, t) {
  let n = t.i;
  e.base.stack.push(n);
  let r = Le$1(e, t, 'new AggregateError([],"' + t.m + '")');
  return e.base.stack.pop(), r;
}
function Ia(e, t) {
  return Le$1(e, t, "new " + xt$1[t.s] + '("' + t.m + '")');
}
function Ta(e, t) {
  let n, r = t.f, s = t.i, i = t.s ? sa : aa, o = e.base;
  if ($(o, r)) {
    let u = y(e, r.i);
    n = i + (t.s ? "().then(" + Jt([], u) + ")" : "().catch(" + Ks([], "throw " + u) + ")");
  } else {
    o.stack.push(s);
    let u = d(e, r);
    o.stack.pop(), n = i + "(" + u + ")";
  }
  return n;
}
function Oa(e, t) {
  return "Object(" + d(e, t.f) + ")";
}
function j(e, t) {
  let n = d(e, t);
  return t.t === 4 ? n : "(" + n + ")";
}
function Na(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return "(" + M$1(e, t.s, j(e, t.f) + "()") + ").p";
}
function Pa(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return j(e, t.a[0]) + "(" + y(e, t.i) + "," + d(e, t.a[1]) + ")";
}
function La(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return j(e, t.a[0]) + "(" + y(e, t.i) + "," + d(e, t.a[1]) + ")";
}
function ja(e, t) {
  let n = e.base.plugins;
  if (n) for (let r = 0, s = n.length; r < s; r++) {
    let i = n[r];
    if (i.tag === t.c) return e.child == null && (e.child = new ca(e)), i.serialize(t.s, e.child, { id: t.i });
  }
  throw new Lt$1(t.c);
}
function Fa(e, t) {
  let n = "", r = false;
  return t.f.t !== 4 && (E$1(e.base, t.f.i), n = "(" + d(e, t.f) + ",", r = true), n += M$1(e, t.i, "(" + qr + ")(" + y(e, t.f.i) + ")"), r && (n += ")"), n;
}
function Ua(e, t) {
  return j(e, t.a[0]) + "(" + d(e, t.a[1]) + ")";
}
function Ha(e, t) {
  let n = t.a[0], r = t.a[1], s = e.base, i = "";
  n.t !== 4 && (E$1(s, n.i), i += "(" + d(e, n)), r.t !== 4 && (E$1(s, r.i), i += (i ? "," : "(") + d(e, r)), i && (i += ",");
  let o = M$1(e, t.i, "(" + Dr + ")(" + y(e, r.i) + "," + y(e, n.i) + ")");
  return i ? i + o + ")" : o;
}
function qa(e, t) {
  return j(e, t.a[0]) + "(" + d(e, t.a[1]) + ")";
}
function Da(e, t) {
  let n = M$1(e, t.i, j(e, t.f) + "()"), r = t.a.length;
  if (r) {
    let s = d(e, t.a[0]);
    for (let i = 1; i < r; i++) s += "," + d(e, t.a[i]);
    return "(" + n + "," + s + "," + y(e, t.i) + ")";
  }
  return n;
}
function Ma(e, t) {
  return y(e, t.i) + ".next(" + d(e, t.f) + ")";
}
function Ba(e, t) {
  return y(e, t.i) + ".throw(" + d(e, t.f) + ")";
}
function Wa(e, t) {
  return y(e, t.i) + ".return(" + d(e, t.f) + ")";
}
function Va(e, t) {
  switch (t.t) {
    case 17:
      return Dn[t.s];
    case 18:
      return ga(t);
    case 9:
      return ya(e, t);
    case 10:
      return ma(e, t);
    case 11:
      return Ra(e, t);
    case 5:
      return Ea(t);
    case 6:
      return Aa(e, t);
    case 7:
      return ka(e, t);
    case 8:
      return xa(e, t);
    case 19:
      return _a(e, t);
    case 16:
    case 15:
      return $a(e, t);
    case 20:
      return za(e, t);
    case 14:
      return Ca(e, t);
    case 13:
      return Ia(e, t);
    case 12:
      return Ta(e, t);
    case 21:
      return Oa(e, t);
    case 22:
      return Na(e, t);
    case 25:
      return ja(e, t);
    case 26:
      return Xr[t.s];
    default:
      throw new P$1(t);
  }
}
function d(e, t) {
  switch (t.t) {
    case 2:
      return Bn[t.s];
    case 0:
      return "" + t.s;
    case 1:
      return '"' + t.s + '"';
    case 3:
      return t.s + "n";
    case 4:
      return y(e, t.i);
    case 23:
      return Pa(e, t);
    case 24:
      return La(e, t);
    case 27:
      return Fa(e, t);
    case 28:
      return Ua(e, t);
    case 29:
      return Ha(e, t);
    case 30:
      return qa(e, t);
    case 31:
      return Da(e, t);
    case 32:
      return Ma(e, t);
    case 33:
      return Ba(e, t);
    case 34:
      return Wa(e, t);
    default:
      return M$1(e, t.i, Va(e, t));
  }
}
function Xa(e, t) {
  let n = d(e, t), r = t.i;
  if (r == null) return n;
  let s = da(e.base), i = y(e, r), o = e.state.scopeId, u = o == null ? "" : ie, c = s ? "(" + n + "," + s + i + ")" : n;
  if (u === "") return t.t === 10 && !s ? "(" + c + ")" : c;
  let l = o == null ? "()" : "(" + ie + '["' + A$1(o) + '"])';
  return "(" + Jt([u], c) + ")" + l;
}
var Ga = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return S$1(this._p, this.depth, e);
  }
}, Ya = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return S$1(this._p, this.depth, e);
  }
  parseWithError(e) {
    return O$1(this._p, this.depth, e);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    He$1(this._p);
  }
  popPendingState() {
    J$1(this._p);
  }
  onParse(e) {
    q$1(this._p, e);
  }
  onError(e) {
    Fe$1(this._p, e);
  }
};
function Ja(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Ka(e) {
  return { type: 2, base: es(2, e), state: Ja(e) };
}
function Za(e, t, n) {
  let r = [];
  for (let s = 0, i = n.length; s < i; s++) s in n ? r[s] = S$1(e, t, n[s]) : r[s] = 0;
  return r;
}
function Qa(e, t, n, r) {
  return dr(n, r, Za(e, t, r));
}
function je$1(e, t, n) {
  let r = Object.entries(n), s = [], i = [];
  for (let o = 0, u = r.length; o < u; o++) s.push(A$1(r[o][0])), i.push(S$1(e, t, r[o][1]));
  return x in n && (s.push(I$1(e.base, x)), i.push(Sr(ns(e.base), S$1(e, t, Kr(n))))), k$1 in n && (s.push(I$1(e.base, k$1)), i.push(Rr(rs(e.base), S$1(e, t, e.type === 1 ? ee() : Gr(n))))), H$1 in n && (s.push(I$1(e.base, H$1)), i.push(Ot$1(n[H$1]))), U in n && (s.push(I$1(e.base, U)), i.push(n[U] ? _t$1 : $t$1)), { k: s, v: i };
}
function de(e, t, n, r, s) {
  return ss(n, r, s, je$1(e, t, r));
}
function ei(e, t, n, r) {
  return hr(n, S$1(e, t, r.valueOf()));
}
function ti(e, t, n, r) {
  return gr(n, r, S$1(e, t, r.buffer));
}
function ni(e, t, n, r) {
  return yr(n, r, S$1(e, t, r.buffer));
}
function ri(e, t, n, r) {
  return mr(n, r, S$1(e, t, r.buffer));
}
function Qe$1(e, t, n, r) {
  let s = It(r, e.base.features);
  return br(n, r, s ? je$1(e, t, s) : a);
}
function si(e, t, n, r) {
  let s = It(r, e.base.features);
  return wr(n, r, s ? je$1(e, t, s) : a);
}
function ai(e, t, n, r) {
  let s = [], i = [];
  for (let [o, u] of r.entries()) s.push(S$1(e, t, o)), i.push(S$1(e, t, u));
  return as(e.base, n, s, i);
}
function ii(e, t, n, r) {
  let s = [];
  for (let i of r.keys()) s.push(S$1(e, t, i));
  return vr(n, s);
}
function oi(e, t, n, r) {
  let s = Er(n, L$1(e.base, 4), []);
  return e.type === 1 || (He$1(e), r.on({ next: (i) => {
    if (e.state.alive) {
      let o = O$1(e, t, i);
      o && q$1(e, Ar(n, o));
    }
  }, throw: (i) => {
    if (e.state.alive) {
      let o = O$1(e, t, i);
      o && q$1(e, kr(n, o));
    }
    J$1(e);
  }, return: (i) => {
    if (e.state.alive) {
      let o = O$1(e, t, i);
      o && q$1(e, xr(n, o));
    }
    J$1(e);
  } })), s;
}
function ui(e, t, n) {
  if (this.state.alive) {
    let r = O$1(this, t, n);
    r && q$1(this, g(23, e, a, a, a, a, a, [L$1(this.base, 2), r], a, a, a)), J$1(this);
  }
}
function ci(e, t, n) {
  if (this.state.alive) {
    let r = O$1(this, t, n);
    r && q$1(this, g(24, e, a, a, a, a, a, [L$1(this.base, 3), r], a, a, a));
  }
  J$1(this);
}
function li(e, t, n, r) {
  let s = Dt(e.base, {});
  return e.type === 2 && (He$1(e), r.then(ui.bind(e, s, t), ci.bind(e, s, t))), is(e.base, n, s);
}
function fi(e, t, n, r, s) {
  for (let i = 0, o = s.length; i < o; i++) {
    let u = s[i];
    if (u.parse.sync && u.test(r)) return Nt$1(n, u.tag, u.parse.sync(r, new Ga(e, t), { id: n }));
  }
  return a;
}
function pi(e, t, n, r, s) {
  for (let i = 0, o = s.length; i < o; i++) {
    let u = s[i];
    if (u.parse.stream && u.test(r)) return Nt$1(n, u.tag, u.parse.stream(r, new Ya(e, t), { id: n }));
  }
  return a;
}
function rn(e, t, n, r) {
  let s = e.base.plugins;
  return s ? e.type === 1 ? fi(e, t, n, r, s) : pi(e, t, n, r, s) : a;
}
function di(e, t, n, r, s) {
  switch (s) {
    case Object:
      return de(e, t, n, r, false);
    case a:
      return de(e, t, n, r, true);
    case Date:
      return cr(n, r);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return Qe$1(e, t, n, r);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return ei(e, t, n, r);
    case ArrayBuffer:
      return os(e.base, n, r);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return ti(e, t, n, r);
    case DataView:
      return ri(e, t, n, r);
    case Map:
      return ai(e, t, n, r);
    case Set:
      return ii(e, t, n, r);
  }
  if (s === Promise || r instanceof Promise) return li(e, t, n, r);
  let i = e.base.features;
  if (i & 32 && s === RegExp) return lr(n, r);
  if (i & 16) switch (s) {
    case BigInt64Array:
    case BigUint64Array:
      return ni(e, t, n, r);
  }
  if (i & 1 && typeof AggregateError < "u" && (s === AggregateError || r instanceof AggregateError)) return si(e, t, n, r);
  if (r instanceof Error) return Qe$1(e, t, n, r);
  if (x in r || k$1 in r) return de(e, t, n, r, !!s);
  throw new ce(r);
}
function hi(e, t, n, r) {
  if (Array.isArray(r)) return Qa(e, t, n, r);
  if (fe(r)) return oi(e, t, n, r);
  let s = r.constructor;
  return s === Nr ? S$1(e, t, r.replacement) : rn(e, t, n, r) || di(e, t, n, r, s);
}
function gi(e, t, n) {
  let r = Ne$1(e.base, n);
  if (r.type !== 0) return r.value;
  let s = rn(e, t, r.value, n);
  if (s) return s;
  throw new ce(n);
}
function S$1(e, t, n) {
  if (t >= e.base.depthLimit) throw new jt$1(e.base.depthLimit);
  switch (typeof n) {
    case "boolean":
      return n ? _t$1 : $t$1;
    case "undefined":
      return Xn;
    case "string":
      return Ot$1(n);
    case "number":
      return ir(n);
    case "bigint":
      return or(n);
    case "object": {
      if (n) {
        let r = Ne$1(e.base, n);
        return r.type === 0 ? hi(e, t + 1, r.value, n) : r.value;
      }
      return Gn;
    }
    case "symbol":
      return I$1(e.base, n);
    case "function":
      return gi(e, t, n);
    default:
      throw new ce(n);
  }
}
function q$1(e, t) {
  e.state.initial ? e.state.buffer.push(t) : Ue$1(e, t, false);
}
function Fe$1(e, t) {
  if (e.state.onError) e.state.onError(t);
  else throw t instanceof Be$1 ? t : new Be$1(t);
}
function sn(e) {
  e.state.onDone && e.state.onDone();
}
function Ue$1(e, t, n) {
  try {
    e.state.onParse(t, n);
  } catch (r) {
    Fe$1(e, r);
  }
}
function He$1(e) {
  e.state.pending++;
}
function J$1(e) {
  --e.state.pending <= 0 && sn(e);
}
function O$1(e, t, n) {
  try {
    return S$1(e, t, n);
  } catch (r) {
    return Fe$1(e, r), a;
  }
}
function yi(e, t) {
  let n = O$1(e, 0, t);
  n && (Ue$1(e, n, true), e.state.initial = false, mi(e, e.state), e.state.pending <= 0 && an(e));
}
function mi(e, t) {
  for (let n = 0, r = t.buffer.length; n < r; n++) Ue$1(e, t.buffer[n], false);
}
function an(e) {
  e.state.alive && (sn(e), e.state.alive = false);
}
function bi(e, t) {
  let n = Bt(t.plugins), r = Ka({ plugins: n, refs: t.refs, disabledFeatures: t.disabledFeatures, onParse(s, i) {
    let o = ua({ plugins: n, features: r.base.features, scopeId: t.scopeId, markedRefs: r.base.marked }), u;
    try {
      u = Xa(o, s);
    } catch (c) {
      t.onError && t.onError(c);
      return;
    }
    t.onSerialize(u, i);
  }, onError: t.onError, onDone: t.onDone });
  return yi(r, e), an.bind(null, r);
}
function et$1(e, t = {}) {
  var n;
  let r = Bt(t.plugins), s = t.disabledFeatures || 0, i = (n = e.f) != null ? n : 63, o = gs({ plugins: r, markedRefs: e.m, features: i & ~s, disabledFeatures: s });
  return Gs(o, e.t);
}
function he(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var wi = { tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent > "u" ? false : e instanceof CustomEvent;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(he(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(he(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(he(e)) };
} }, serialize(e, t) {
  return "new CustomEvent(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new CustomEvent(t.deserialize(e.type), t.deserialize(e.options));
} }, ke$1 = wi, vi = { tag: "seroval-plugins/web/DOMException", test(e) {
  return typeof DOMException > "u" ? false : e instanceof DOMException;
}, parse: { sync(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
}, async async(e, t) {
  return { name: await t.parse(e.name), message: await t.parse(e.message) };
}, stream(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
} }, serialize(e, t) {
  return "new DOMException(" + t.serialize(e.message) + "," + t.serialize(e.name) + ")";
}, deserialize(e, t) {
  return new DOMException(t.deserialize(e.message), t.deserialize(e.name));
} }, xe = vi;
function ge(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var Si = { tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event > "u" ? false : e instanceof Event;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(ge(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(ge(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(ge(e)) };
} }, serialize(e, t) {
  return "new Event(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Event(t.deserialize(e.type), t.deserialize(e.options));
} }, _e$1 = Si, Ri = { tag: "seroval-plugins/web/File", test(e) {
  return typeof File > "u" ? false : e instanceof File;
}, parse: { async async(e, t) {
  return { name: await t.parse(e.name), options: await t.parse({ type: e.type, lastModified: e.lastModified }), buffer: await t.parse(await e.arrayBuffer()) };
} }, serialize(e, t) {
  return "new File([" + t.serialize(e.buffer) + "]," + t.serialize(e.name) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new File([t.deserialize(e.buffer)], t.deserialize(e.name), t.deserialize(e.options));
} }, Ei = Ri;
function ye(e) {
  let t = [];
  return e.forEach((n, r) => {
    t.push([r, n]);
  }), t;
}
var X = {}, on = (e, t = new FormData(), n = 0, r = e.length, s) => {
  for (; n < r; n++) s = e[n], t.append(s[0], s[1]);
  return t;
}, Ai = { tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === X;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize() {
  return on.toString();
}, deserialize() {
  return X;
} }, ki = { tag: "seroval-plugins/web/FormData", extends: [Ei, Ai], test(e) {
  return typeof FormData > "u" ? false : e instanceof FormData;
}, parse: { sync(e, t) {
  return { factory: t.parse(X), entries: t.parse(ye(e)) };
}, async async(e, t) {
  return { factory: await t.parse(X), entries: await t.parse(ye(e)) };
}, stream(e, t) {
  return { factory: t.parse(X), entries: t.parse(ye(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.entries) + ")";
}, deserialize(e, t) {
  return on(t.deserialize(e.entries));
} }, $e = ki;
function me(e) {
  let t = [];
  return e.forEach((n, r) => {
    t.push([r, n]);
  }), t;
}
var xi = { tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers > "u" ? false : e instanceof Headers;
}, parse: { sync(e, t) {
  return t.parse(me(e));
}, async async(e, t) {
  return await t.parse(me(e));
}, stream(e, t) {
  return t.parse(me(e));
} }, serialize(e, t) {
  return "new Headers(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new Headers(t.deserialize(e));
} }, K$1 = xi, G = {}, un = (e) => new ReadableStream({ start: (t) => {
  e.on({ next: (n) => {
    try {
      t.enqueue(n);
    } catch {
    }
  }, throw: (n) => {
    t.error(n);
  }, return: () => {
    try {
      t.close();
    } catch {
    }
  } });
} }), _i = { tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === G;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize() {
  return un.toString();
}, deserialize() {
  return G;
} };
function tt$1(e) {
  let t = ee(), n = e.getReader();
  async function r() {
    try {
      let s = await n.read();
      s.done ? t.return(s.value) : (t.next(s.value), await r());
    } catch (s) {
      t.throw(s);
    }
  }
  return r().catch(() => {
  }), t;
}
var $i = { tag: "seroval/plugins/web/ReadableStream", extends: [_i], test(e) {
  return typeof ReadableStream > "u" ? false : e instanceof ReadableStream;
}, parse: { sync(e, t) {
  return { factory: t.parse(G), stream: t.parse(ee()) };
}, async async(e, t) {
  return { factory: await t.parse(G), stream: await t.parse(tt$1(e)) };
}, stream(e, t) {
  return { factory: t.parse(G), stream: t.parse(tt$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
}, deserialize(e, t) {
  let n = t.deserialize(e.stream);
  return un(n);
} }, Z = $i;
function nt$1(e, t) {
  return { body: t, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var zi = { tag: "seroval-plugins/web/Request", extends: [Z, K$1], test(e) {
  return typeof Request > "u" ? false : e instanceof Request;
}, parse: { async async(e, t) {
  return { url: await t.parse(e.url), options: await t.parse(nt$1(e, e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null)) };
}, stream(e, t) {
  return { url: t.parse(e.url), options: t.parse(nt$1(e, e.body && !e.bodyUsed ? e.clone().body : null)) };
} }, serialize(e, t) {
  return "new Request(" + t.serialize(e.url) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Request(t.deserialize(e.url), t.deserialize(e.options));
} }, ze$1 = zi;
function rt$1(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var Ci = { tag: "seroval-plugins/web/Response", extends: [Z, K$1], test(e) {
  return typeof Response > "u" ? false : e instanceof Response;
}, parse: { async async(e, t) {
  return { body: await t.parse(e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null), options: await t.parse(rt$1(e)) };
}, stream(e, t) {
  return { body: t.parse(e.body && !e.bodyUsed ? e.clone().body : null), options: t.parse(rt$1(e)) };
} }, serialize(e, t) {
  return "new Response(" + t.serialize(e.body) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Response(t.deserialize(e.body), t.deserialize(e.options));
} }, Ce = Ci, Ii = { tag: "seroval-plugins/web/URL", test(e) {
  return typeof URL > "u" ? false : e instanceof URL;
}, parse: { sync(e, t) {
  return t.parse(e.href);
}, async async(e, t) {
  return await t.parse(e.href);
}, stream(e, t) {
  return t.parse(e.href);
} }, serialize(e, t) {
  return "new URL(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new URL(t.deserialize(e));
} }, Ie$1 = Ii, Ti = { tag: "seroval-plugins/web/URLSearchParams", test(e) {
  return typeof URLSearchParams > "u" ? false : e instanceof URLSearchParams;
}, parse: { sync(e, t) {
  return t.parse(e.toString());
}, async async(e, t) {
  return await t.parse(e.toString());
}, stream(e, t) {
  return t.parse(e.toString());
} }, serialize(e, t) {
  return "new URLSearchParams(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new URLSearchParams(t.deserialize(e));
} }, Te$1 = Ti;
function Oi(e = {}) {
  let t, n = false;
  const r = (o) => {
    if (t && t !== o) throw new Error("Context conflict");
  };
  let s;
  if (e.asyncContext) {
    const o = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? s = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const i = () => {
    if (s) {
      const o = s.getStore();
      if (o !== void 0) return o;
    }
    return t;
  };
  return { use: () => {
    const o = i();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => i(), set: (o, u) => {
    u || r(o), t = o, n = true;
  }, unset: () => {
    t = void 0, n = false;
  }, call: (o, u) => {
    r(o), t = o;
    try {
      return s ? s.run(o, u) : u();
    } finally {
      n || (t = void 0);
    }
  }, async callAsync(o, u) {
    t = o;
    const c = () => {
      t = o;
    }, l = () => t === o ? c : void 0;
    it$1.add(l);
    try {
      const p = s ? s.run(o, u) : u();
      return n || (t = void 0), await p;
    } finally {
      it$1.delete(l);
    }
  } };
}
function Ni(e = {}) {
  const t = {};
  return { get(n, r = {}) {
    return t[n] || (t[n] = Oi({ ...e, ...r })), t[n];
  } };
}
const oe = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, st$1 = "__unctx__", Pi = oe[st$1] || (oe[st$1] = Ni()), Li = (e, t = {}) => Pi.get(e, t), at = "__unctx_async_handlers__", it$1 = oe[at] || (oe[at] = /* @__PURE__ */ new Set());
function ji(e) {
  let t;
  const n = ln(e), r = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(n, { ...r, body: e.node.req.body }) : new Request(n, { ...r, get body() {
    return t || (t = Xi(e), t);
  } });
}
function Fi(e) {
  var _a2;
  return (_a2 = e.web) != null ? _a2 : e.web = { request: ji(e), url: ln(e) }, e.web.request;
}
function Ui() {
  return Ki();
}
const cn = Symbol("$HTTPEvent");
function Hi(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[cn]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function w(e) {
  return function(...t) {
    var _a2;
    let n = t[0];
    if (Hi(n)) t[0] = n instanceof H3Event || n.__is_event__ ? n : n[cn];
    else {
      if (!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (n = Ui(), !n) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(n);
    }
    return e(...t);
  };
}
const ln = w(getRequestURL), qi = w(getRequestIP), ue = w(setResponseStatus), ot$1 = w(getResponseStatus), Di = w(getResponseStatusText), se = w(getResponseHeaders), ut$1 = w(getResponseHeader), Mi = w(setResponseHeader), fn = w(appendResponseHeader), Bi = w(parseCookies), Wi = w(getCookie), Vi = w(setCookie), ae = w(setHeader), Xi = w(getRequestWebStream), Gi = w(removeResponseHeader), Yi = w(Fi);
function Ji() {
  var _a2;
  return Li("nitro-app", { asyncContext: !!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Ki() {
  return Ji().use().event;
}
const be = "Invariant Violation", { setPrototypeOf: Zi = function(e, t) {
  return e.__proto__ = t, e;
} } = Object;
let qe$1 = class qe extends Error {
  constructor(t = be) {
    super(typeof t == "number" ? `${be}: ${t} (see https://github.com/apollographql/invariant-packages)` : t);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", be);
    Zi(this, qe.prototype);
  }
};
function Qi(e, t) {
  if (!e) throw new qe$1(t);
}
const we = "solidFetchEvent";
function eo(e) {
  return { request: Yi(e), response: so(e), clientAddress: qi(e), locals: {}, nativeEvent: e };
}
function to(e) {
  return { ...e };
}
function no(e) {
  if (!e.context[we]) {
    const t = eo(e);
    e.context[we] = t;
  }
  return e.context[we];
}
function ct$1(e, t) {
  for (const [n, r] of t.entries()) fn(e, n, r);
}
class ro {
  constructor(t) {
    __publicField$1(this, "event");
    this.event = t;
  }
  get(t) {
    const n = ut$1(this.event, t);
    return Array.isArray(n) ? n.join(", ") : n || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, n) {
    return Mi(this.event, t, n);
  }
  delete(t) {
    return Gi(this.event, t);
  }
  append(t, n) {
    fn(this.event, t, n);
  }
  getSetCookie() {
    const t = ut$1(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(se(this.event)).forEach(([n, r]) => t(Array.isArray(r) ? r.join(", ") : r, n, this));
  }
  entries() {
    return Object.entries(se(this.event)).map(([t, n]) => [t, Array.isArray(n) ? n.join(", ") : n])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(se(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(se(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function so(e) {
  return { get status() {
    return ot$1(e);
  }, set status(t) {
    ue(e, t);
  }, get statusText() {
    return Di(e);
  }, set statusText(t) {
    ue(e, ot$1(e), t);
  }, headers: new ro(e) };
}
const D$1 = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function ao(e = {}) {
  const t = { options: e, rootNode: pn(), staticRoutesMap: {} }, n = (r) => e.strictTrailingSlash ? r : r.replace(/\/$/, "") || "/";
  if (e.routes) for (const r in e.routes) lt$1(t, n(r), e.routes[r]);
  return { ctx: t, lookup: (r) => io(t, n(r)), insert: (r, s) => lt$1(t, n(r), s), remove: (r) => oo(t, n(r)) };
}
function io(e, t) {
  const n = e.staticRoutesMap[t];
  if (n) return n.data;
  const r = t.split("/"), s = {};
  let i = false, o = null, u = e.rootNode, c = null;
  for (let l = 0; l < r.length; l++) {
    const p = r[l];
    u.wildcardChildNode !== null && (o = u.wildcardChildNode, c = r.slice(l).join("/"));
    const h = u.children.get(p);
    if (h === void 0) {
      if (u && u.placeholderChildren.length > 1) {
        const v = r.length - l;
        u = u.placeholderChildren.find((f) => f.maxDepth === v) || null;
      } else u = u.placeholderChildren[0] || null;
      if (!u) break;
      u.paramName && (s[u.paramName] = p), i = true;
    } else u = h;
  }
  return (u === null || u.data === null) && o !== null && (u = o, s[u.paramName || "_"] = c, i = true), u ? i ? { ...u.data, params: i ? s : void 0 } : u.data : null;
}
function lt$1(e, t, n) {
  let r = true;
  const s = t.split("/");
  let i = e.rootNode, o = 0;
  const u = [i];
  for (const c of s) {
    let l;
    if (l = i.children.get(c)) i = l;
    else {
      const p = uo(c);
      l = pn({ type: p, parent: i }), i.children.set(c, l), p === D$1.PLACEHOLDER ? (l.paramName = c === "*" ? `_${o++}` : c.slice(1), i.placeholderChildren.push(l), r = false) : p === D$1.WILDCARD && (i.wildcardChildNode = l, l.paramName = c.slice(3) || "_", r = false), u.push(l), i = l;
    }
  }
  for (const [c, l] of u.entries()) l.maxDepth = Math.max(u.length - c, l.maxDepth || 0);
  return i.data = n, r === true && (e.staticRoutesMap[t] = i), i;
}
function oo(e, t) {
  let n = false;
  const r = t.split("/");
  let s = e.rootNode;
  for (const i of r) if (s = s.children.get(i), !s) return n;
  if (s.data) {
    const i = r.at(-1) || "";
    s.data = null, Object.keys(s.children).length === 0 && s.parent && (s.parent.children.delete(i), s.parent.wildcardChildNode = null, s.parent.placeholderChildren = []), n = true;
  }
  return n;
}
function pn(e = {}) {
  return { type: e.type || D$1.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function uo(e) {
  return e.startsWith("**") ? D$1.WILDCARD : e[0] === ":" || e === "*" ? D$1.PLACEHOLDER : D$1.NORMAL;
}
const dn = [], co = lo(dn.filter((e) => e.page));
function lo(e) {
  function t(n, r, s, i) {
    const o = Object.values(n).find((u) => s.startsWith(u.id + "/"));
    return o ? (t(o.children || (o.children = []), r, s.slice(o.id.length)), n) : (n.push({ ...r, id: s, path: s.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), n);
  }
  return e.sort((n, r) => n.path.length - r.path.length).reduce((n, r) => t(n, r, r.path, r.path), []);
}
function fo(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
ao({ routes: dn.reduce((e, t) => {
  if (!fo(t)) return e;
  let n = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (r, s) => `**:${s}`).split("/").map((r) => r.startsWith(":") || r.startsWith("*") ? r : encodeURIComponent(r)).join("/");
  if (/:[^/]*\?/g.test(n)) throw new Error(`Optional parameters are not supported in API routes: ${n}`);
  if (e[n]) throw new Error(`Duplicate API routes for "${n}" found at "${e[n].route.path}" and "${t.path}"`);
  return e[n] = { route: t }, e;
}, {}) });
var ho = " ";
const go = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(ho), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function yo(e, t) {
  let { tag: n, attrs: { key: r, ...s } = { key: void 0 }, children: i } = e;
  return go[n]({ attrs: { ...s, nonce: t }, key: r, children: i });
}
function mo(e, t, n, r = "default") {
  return lazy(async () => {
    var _a2;
    {
      const i = (await e.import())[r], u = (await ((_a2 = t.inputs) == null ? void 0 : _a2[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...u.map((p) => yo(p)), createComponent(i, l)] };
    }
  });
}
function bo() {
  function e(n) {
    return { ...n, ...n.$$route ? n.$$route.require().route : void 0, info: { ...n.$$route ? n.$$route.require().route.info : {}, filesystem: true }, component: n.$component && mo(n.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: n.children ? n.children.map(e) : void 0 };
  }
  return co.map(e);
}
function wo(e) {
  const t = Wi(e.nativeEvent, "flash");
  if (t) try {
    let n = JSON.parse(t);
    if (!n || !n.result) return;
    const r = [...n.input.slice(0, -1), new Map(n.input[n.input.length - 1])], s = n.error ? new Error(n.result) : n.result;
    return { input: r, url: n.url, pending: false, result: n.thrown ? void 0 : s, error: n.thrown ? s : void 0 };
  } catch (n) {
    console.error(n);
  } finally {
    Vi(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function vo(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: wo(e) }, routes: bo(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const So = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Ro(e) {
  return e.status && So.has(e.status) ? e.status : 302;
}
const Eo = {};
function Ao(e) {
  const t = new TextEncoder().encode(e), n = t.length, r = n.toString(16), s = "00000000".substring(0, 8 - r.length) + r, i = new TextEncoder().encode(`;0x${s};`), o = new Uint8Array(12 + n);
  return o.set(i), o.set(t, 12), o;
}
function ft$1(e, t) {
  return new ReadableStream({ start(n) {
    bi(t, { scopeId: e, plugins: [ke$1, xe, _e$1, $e, K$1, Z, ze$1, Ce, Te$1, Ie$1], onSerialize(r, s) {
      n.enqueue(Ao(s ? `(${tr(e)},${r})` : r));
    }, onDone() {
      n.close();
    }, onError(r) {
      n.error(r);
    } });
  } });
}
async function ko(e) {
  const t = no(e), n = t.request, r = n.headers.get("X-Server-Id"), s = n.headers.get("X-Server-Instance"), i = n.headers.has("X-Single-Flight"), o = new URL(n.url);
  let u, c;
  if (r) Qi(typeof r == "string", "Invalid server function"), [u, c] = r.split("#");
  else if (u = o.searchParams.get("id"), c = o.searchParams.get("name"), !u || !c) return new Response(null, { status: 404 });
  const l = Eo[u];
  let p;
  if (!l) return new Response(null, { status: 404 });
  p = await l.importer();
  const h = p[l.functionName];
  let v = [];
  if (!s || e.method === "GET") {
    const f = o.searchParams.get("args");
    if (f) {
      const R = JSON.parse(f);
      (R.t ? et$1(R, { plugins: [ke$1, xe, _e$1, $e, K$1, Z, ze$1, Ce, Te$1, Ie$1] }) : R).forEach((te) => v.push(te));
    }
  }
  if (e.method === "POST") {
    const f = n.headers.get("content-type"), R = e.node.req, te = R instanceof ReadableStream, hn = R.body instanceof ReadableStream, De = te && R.locked || hn && R.body.locked, Me = te ? R : R.body;
    if ((f == null ? void 0 : f.startsWith("multipart/form-data")) || (f == null ? void 0 : f.startsWith("application/x-www-form-urlencoded"))) v.push(await (De ? n : new Request(n, { ...n, body: Me })).formData());
    else if (f == null ? void 0 : f.startsWith("application/json")) {
      const gn = De ? n : new Request(n, { ...n, body: Me });
      v = et$1(await gn.json(), { plugins: [ke$1, xe, _e$1, $e, K$1, Z, ze$1, Ce, Te$1, Ie$1] });
    }
  }
  try {
    let f = await provideRequestEvent(t, async () => (sharedConfig.context = { event: t }, t.locals.serverFunctionMeta = { id: u + "#" + c }, h(...v)));
    if (i && s && (f = await dt$1(t, f)), f instanceof Response) {
      if (f.headers && f.headers.has("X-Content-Raw")) return f;
      s && (f.headers && ct$1(e, f.headers), f.status && (f.status < 300 || f.status >= 400) && ue(e, f.status), f.customBody ? f = await f.customBody() : f.body == null && (f = null));
    }
    return s ? (ae(e, "content-type", "text/javascript"), ft$1(s, f)) : pt$1(f, n, v);
  } catch (f) {
    if (f instanceof Response) i && s && (f = await dt$1(t, f)), f.headers && ct$1(e, f.headers), f.status && (!s || f.status < 300 || f.status >= 400) && ue(e, f.status), f.customBody ? f = f.customBody() : f.body == null && (f = null), ae(e, "X-Error", "true");
    else if (s) {
      const R = f instanceof Error ? f.message : typeof f == "string" ? f : "true";
      ae(e, "X-Error", R.replace(/[\r\n]+/g, ""));
    } else f = pt$1(f, n, v, true);
    return s ? (ae(e, "content-type", "text/javascript"), ft$1(s, f)) : f;
  }
}
function pt$1(e, t, n, r) {
  const s = new URL(t.url), i = e instanceof Error;
  let o = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), s.origin + "").toString()), o = Ro(e))) : u = new Headers({ Location: new URL(t.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: s.pathname + s.search, result: i ? e.message : e, thrown: r, error: i, input: [...n.slice(0, -1), [...n[n.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: o, headers: u });
}
let ve;
function xo(e) {
  var _a2;
  const t = new Headers(e.request.headers), n = Bi(e.nativeEvent), r = e.response.headers.getSetCookie();
  t.delete("cookie");
  let s = false;
  return ((_a2 = e.nativeEvent.node) == null ? void 0 : _a2.req) && (s = true, e.nativeEvent.node.req.headers.cookie = ""), r.forEach((i) => {
    if (!i) return;
    const { maxAge: o, expires: u, name: c, value: l } = Un(i);
    if (o != null && o <= 0) {
      delete n[c];
      return;
    }
    if (u != null && u.getTime() <= Date.now()) {
      delete n[c];
      return;
    }
    n[c] = l;
  }), Object.entries(n).forEach(([i, o]) => {
    t.append("cookie", `${i}=${o}`), s && (e.nativeEvent.node.req.headers.cookie += `${i}=${o};`);
  }), t;
}
async function dt$1(e, t) {
  let n, r = new URL(e.request.headers.get("referer")).toString();
  t instanceof Response && (t.headers.has("X-Revalidate") && (n = t.headers.get("X-Revalidate").split(",")), t.headers.has("Location") && (r = new URL(t.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const s = to(e);
  return s.request = new Request(r, { headers: xo(e) }), await provideRequestEvent(s, async () => {
    await vo(s), ve || (ve = (await import('./chunks/build/app-kJ4QPmu3.mjs')).default), s.router.dataOnly = n || true, s.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = s, ve();
      });
    } catch (u) {
      console.log(u);
    }
    const i = s.router.data;
    if (!i) return t;
    let o = false;
    for (const u in i) i[u] === void 0 ? delete i[u] : o = true;
    return o && (t instanceof Response ? t.customBody && (i._$value = t.customBody()) : (i._$value = t, t = new Response(null, { status: 200 })), t.customBody = () => i, t.headers.set("X-Single-Flight", "true")), t;
  });
}
const Po = eventHandler(ko);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function Te(e = {}) {
  let t, s = false;
  const n = (o) => {
    if (t && t !== o) throw new Error("Context conflict");
  };
  let i;
  if (e.asyncContext) {
    const o = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? i = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (i) {
      const o = i.getStore();
      if (o !== void 0) return o;
    }
    return t;
  };
  return { use: () => {
    const o = a();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => a(), set: (o, r) => {
    r || n(o), t = o, s = true;
  }, unset: () => {
    t = void 0, s = false;
  }, call: (o, r) => {
    n(o), t = o;
    try {
      return i ? i.run(o, r) : r();
    } finally {
      s || (t = void 0);
    }
  }, async callAsync(o, r) {
    t = o;
    const l = () => {
      t = o;
    }, d = () => t === o ? l : void 0;
    L.add(d);
    try {
      const u = i ? i.run(o, r) : r();
      return s || (t = void 0), await u;
    } finally {
      L.delete(d);
    }
  } };
}
function Ae(e = {}) {
  const t = {};
  return { get(s, n = {}) {
    return t[s] || (t[s] = Te({ ...e, ...n })), t[s];
  } };
}
const R = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, k = "__unctx__", _e = R[k] || (R[k] = Ae()), He = (e, t = {}) => _e.get(e, t), N = "__unctx_async_handlers__", L = R[N] || (R[N] = /* @__PURE__ */ new Set());
function je(e) {
  let t;
  const s = z(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...n, body: e.node.req.body }) : new Request(s, { ...n, get body() {
    return t || (t = We(e), t);
  } });
}
function ke(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: je(e), url: z(e) }, e.web.request;
}
function Ne() {
  return ze();
}
const B = Symbol("$HTTPEvent");
function Le(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[B]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function c(e) {
  return function(...t) {
    var _a;
    let s = t[0];
    if (Le(s)) t[0] = s instanceof H3Event || s.__is_event__ ? s : s[B];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = Ne(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(s);
    }
    return e(...t);
  };
}
const z = c(getRequestURL), Pe = c(getRequestIP), A = c(setResponseStatus), P = c(getResponseStatus), Ie = c(getResponseStatusText), S = c(getResponseHeaders), I = c(getResponseHeader), qe = c(setResponseHeader), Me = c(appendResponseHeader), q = c(sendRedirect), De = c(getCookie), Oe = c(setCookie), Fe = c(setHeader), We = c(getRequestWebStream), Ue = c(removeResponseHeader), Ge = c(ke);
function Be() {
  var _a;
  return He("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function ze() {
  return Be().use().event;
}
const b = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function Ke(e = {}) {
  const t = { options: e, rootNode: K(), staticRoutesMap: {} }, s = (n) => e.strictTrailingSlash ? n : n.replace(/\/$/, "") || "/";
  if (e.routes) for (const n in e.routes) M(t, s(n), e.routes[n]);
  return { ctx: t, lookup: (n) => Je(t, s(n)), insert: (n, i) => M(t, s(n), i), remove: (n) => Ye(t, s(n)) };
}
function Je(e, t) {
  const s = e.staticRoutesMap[t];
  if (s) return s.data;
  const n = t.split("/"), i = {};
  let a = false, o = null, r = e.rootNode, l = null;
  for (let d = 0; d < n.length; d++) {
    const u = n[d];
    r.wildcardChildNode !== null && (o = r.wildcardChildNode, l = n.slice(d).join("/"));
    const y = r.children.get(u);
    if (y === void 0) {
      if (r && r.placeholderChildren.length > 1) {
        const $ = n.length - d;
        r = r.placeholderChildren.find((p) => p.maxDepth === $) || null;
      } else r = r.placeholderChildren[0] || null;
      if (!r) break;
      r.paramName && (i[r.paramName] = u), a = true;
    } else r = y;
  }
  return (r === null || r.data === null) && o !== null && (r = o, i[r.paramName || "_"] = l, a = true), r ? a ? { ...r.data, params: a ? i : void 0 } : r.data : null;
}
function M(e, t, s) {
  let n = true;
  const i = t.split("/");
  let a = e.rootNode, o = 0;
  const r = [a];
  for (const l of i) {
    let d;
    if (d = a.children.get(l)) a = d;
    else {
      const u = Qe(l);
      d = K({ type: u, parent: a }), a.children.set(l, d), u === b.PLACEHOLDER ? (d.paramName = l === "*" ? `_${o++}` : l.slice(1), a.placeholderChildren.push(d), n = false) : u === b.WILDCARD && (a.wildcardChildNode = d, d.paramName = l.slice(3) || "_", n = false), r.push(d), a = d;
    }
  }
  for (const [l, d] of r.entries()) d.maxDepth = Math.max(r.length - l, d.maxDepth || 0);
  return a.data = s, n === true && (e.staticRoutesMap[t] = a), a;
}
function Ye(e, t) {
  let s = false;
  const n = t.split("/");
  let i = e.rootNode;
  for (const a of n) if (i = i.children.get(a), !i) return s;
  if (i.data) {
    const a = n.at(-1) || "";
    i.data = null, Object.keys(i.children).length === 0 && i.parent && (i.parent.children.delete(a), i.parent.wildcardChildNode = null, i.parent.placeholderChildren = []), s = true;
  }
  return s;
}
function K(e = {}) {
  return { type: e.type || b.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Qe(e) {
  return e.startsWith("**") ? b.WILDCARD : e[0] === ":" || e === "*" ? b.PLACEHOLDER : b.NORMAL;
}
const J = [], Ve = Xe(J.filter((e) => e.page));
function Xe(e) {
  function t(s, n, i, a) {
    const o = Object.values(s).find((r) => i.startsWith(r.id + "/"));
    return o ? (t(o.children || (o.children = []), n, i.slice(o.id.length)), s) : (s.push({ ...n, id: i, path: i.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), s);
  }
  return e.sort((s, n) => s.path.length - n.path.length).reduce((s, n) => t(s, n, n.path, n.path), []);
}
function Ze(e, t) {
  const s = tt.lookup(e);
  if (s && s.route) {
    const n = s.route, i = t === "HEAD" ? n.$HEAD || n.$GET : n[`$${t}`];
    if (i === void 0) return;
    const a = n.page === true && n.$component !== void 0;
    return { handler: i, params: s.params, isPage: a };
  }
}
function et(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const tt = Ke({ routes: J.reduce((e, t) => {
  if (!et(t)) return e;
  let s = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, i) => `**:${i}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(s)) throw new Error(`Optional parameters are not supported in API routes: ${s}`);
  if (e[s]) throw new Error(`Duplicate API routes for "${s}" found at "${e[s].route.path}" and "${t.path}"`);
  return e[s] = { route: t }, e;
}, {}) }), E = "solidFetchEvent";
function st(e) {
  return { request: Ge(e), response: it(e), clientAddress: Pe(e), locals: {}, nativeEvent: e };
}
function nt(e) {
  if (!e.context[E]) {
    const t = st(e);
    e.context[E] = t;
  }
  return e.context[E];
}
class rt {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const s = I(this.event, t);
    return Array.isArray(s) ? s.join(", ") : s || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, s) {
    return qe(this.event, t, s);
  }
  delete(t) {
    return Ue(this.event, t);
  }
  append(t, s) {
    Me(this.event, t, s);
  }
  getSetCookie() {
    const t = I(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(S(this.event)).forEach(([s, n]) => t(Array.isArray(n) ? n.join(", ") : n, s, this));
  }
  entries() {
    return Object.entries(S(this.event)).map(([t, s]) => [t, Array.isArray(s) ? s.join(", ") : s])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(S(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(S(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function it(e) {
  return { get status() {
    return P(e);
  }, set status(t) {
    A(e, t);
  }, get statusText() {
    return Ie(e);
  }, set statusText(t) {
    A(e, P(e), t);
  }, headers: new rt(e) };
}
var ot = " ";
const lt = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(ot), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function _(e, t) {
  let { tag: s, attrs: { key: n, ...i } = { key: void 0 }, children: a } = e;
  return lt[s]({ attrs: { ...i, nonce: t }, key: n, children: a });
}
function dt(e, t, s, n = "default") {
  return lazy(async () => {
    var _a;
    {
      const a = (await e.import())[n], r = (await ((_a = t.inputs) == null ? void 0 : _a[e.src].assets())).filter((d) => d.tag === "style" || d.attrs.rel === "stylesheet");
      return { default: (d) => [...r.map((u) => _(u)), createComponent(a, d)] };
    }
  });
}
function ct() {
  function e(s) {
    return { ...s, ...s.$$route ? s.$$route.require().route : void 0, info: { ...s.$$route ? s.$$route.require().route.info : {}, filesystem: true }, component: s.$component && dt(s.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: s.children ? s.children.map(e) : void 0 };
  }
  return Ve.map(e);
}
function ut(e) {
  const t = De(e.nativeEvent, "flash");
  if (t) try {
    let s = JSON.parse(t);
    if (!s || !s.result) return;
    const n = [...s.input.slice(0, -1), new Map(s.input[s.input.length - 1])], i = s.error ? new Error(s.result) : s.result;
    return { input: n, url: s.url, pending: false, result: s.thrown ? void 0 : i, error: s.thrown ? i : void 0 };
  } catch (s) {
    console.error(s);
  } finally {
    Oe(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function ft(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: ut(e) }, routes: ct(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const vt = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function H(e) {
  return e.status && vt.has(e.status) ? e.status : 302;
}
function pt(e, t, s = {}, n) {
  return eventHandler({ handler: (i) => {
    const a = nt(i);
    return provideRequestEvent(a, async () => {
      const o = Ze(new URL(a.request.url).pathname, a.request.method);
      if (o) {
        const p = await o.handler.import(), h = a.request.method === "HEAD" ? p.HEAD || p.GET : p[a.request.method];
        a.params = o.params || {}, sharedConfig.context = { event: a };
        const j = await h(a);
        if (j !== void 0) return j;
        if (a.request.method !== "GET") throw new Error(`API handler for ${a.request.method} "${a.request.url}" did not return a response.`);
        if (!o.isPage) return;
      }
      const r = await t(a), l = typeof s == "function" ? await s(r) : { ...s }, d = l.mode || "stream";
      if (l.nonce && (r.nonce = l.nonce), d === "sync") {
        const p = renderToString(() => (sharedConfig.context.event = r, e(r)), l);
        if (r.complete = true, r.response && r.response.headers.get("Location")) {
          const h = H(r.response);
          return q(i, r.response.headers.get("Location"), h);
        }
        return p;
      }
      if (l.onCompleteAll) {
        const p = l.onCompleteAll;
        l.onCompleteAll = (h) => {
          O(r)(h), p(h);
        };
      } else l.onCompleteAll = O(r);
      if (l.onCompleteShell) {
        const p = l.onCompleteShell;
        l.onCompleteShell = (h) => {
          D(r, i)(), p(h);
        };
      } else l.onCompleteShell = D(r, i);
      const u = renderToStream(() => (sharedConfig.context.event = r, e(r)), l);
      if (r.response && r.response.headers.get("Location")) {
        const p = H(r.response);
        return q(i, r.response.headers.get("Location"), p);
      }
      if (d === "async") return u;
      const { writable: y, readable: $ } = new TransformStream();
      return u.pipeTo(y), $;
    });
  } });
}
function D(e, t) {
  return () => {
    if (e.response && e.response.headers.get("Location")) {
      const s = H(e.response);
      A(t, s), Fe(t, "Location", e.response.headers.get("Location"));
    }
  };
}
function O(e) {
  return ({ write: t }) => {
    e.complete = true;
    const s = e.response && e.response.headers.get("Location");
    s && t(`<script>window.location="${s}"<\/script>`);
  };
}
function gt(e, t, s) {
  return pt(e, ft, t);
}
var mt = ["<div", ` class="flex flex-col w-full h-full justify-center items-center p-4"><div class="w-66 md:w-88 max-w-full"><div class="text-xl md:text-2xl w-full">Hi, I'm</div><div class="text-4xl md:text-5xl font-bold w-full text-secondary">Matthew Bland</div><div class="text-md md:text-lg italic w-full">Fullstack Developer</div></div></div>`];
function ht() {
  return ssr(mt, ssrHydrationKey());
}
var bt = ["<div", ' class="flex w-full h-full justify-center items-center gap-2 p-4"><button class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost">arrow_back_ios</button><div id="skills_carousel" class="carousel carousel-horizontal carousel-center w-72 max-w-full"><div class="carousel-item w-full flex flex-col gap-4"><div class="text-xl w-full text-center">Languages</div><div class="w-full p-2"><div class="flex justify-between w-full"><div>Rust</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>C#</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>C++</div><div class="my-auto badge badge-secondary badge-soft">intermediate</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>TypeScript</div><div class="my-auto badge badge-secondary badge-soft">intermediate</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Go</div><div class="my-auto badge badge-info badge-soft">beginning</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Zig</div><div class="my-auto badge badge-info badge-soft">beginning</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Python</div><div class="my-auto badge badge-info badge-soft">beginning</div></div></div></div><div class="carousel-item w-full flex flex-col gap-4"><div class="text-xl w-full text-center">Systems Engineering</div><div class="w-full p-2"><div class="flex justify-between w-full"><div>Interop/FFI</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>IPC</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Microservice Architecture</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>SQL/State Transfer</div><div class="my-auto badge badge-secondary badge-soft">intermediate</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>TLS</div><div class="my-auto badge badge-secondary badge-soft">intermediate</div></div></div></div><div class="carousel-item w-full flex flex-col gap-4"><div class="text-xl w-full text-center">Frontend/Backend</div><div class="w-full p-2"><div class="flex justify-between w-full"><div>React</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Svelte</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>REST</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>UI/UX</div><div class="my-auto badge badge-secondary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Dioxus (multiplatform)</div><div class="my-auto badge badge-secondary badge-soft">enterprise</div></div></div></div><div class="carousel-item w-full flex flex-col gap-4"><div class="text-xl w-full text-center">Miscellaneous</div><div class="w-full p-2"><div class="flex justify-between w-full"><div>Linux</div><div class="my-auto badge badge-accent badge-soft">daily-drive</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>NPM/Vite</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>CCR+DSS</div><div class="my-auto badge badge-primary badge-soft">enterprise</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Terminal UI Design</div><div class="my-auto badge badge-primary badge-soft">advanced</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Nats/Kafka</div><div class="my-auto badge badge-secondary badge-soft">intermediate</div></div><div class="divider"></div><div class="flex justify-between w-full"><div>Kubernetes</div><div class="my-auto badge badge-info badge-soft">beginning</div></div></div></div></div><button class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost">arrow_forward_ios</button></div>'];
function yt() {
  return ssr(bt, ssrHydrationKey());
}
var wt = ["<div", ' class="flex flex-col w-full justify-center items-center gap-2 p-4"><div class="text-xl">Projects</div><div class="flex justify-center items-center gap-2 p-4"><button class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost">arrow_back_ios</button><div id="projects_carousel" class="carousel w-96 max-w-full"><div class="carousel-item w-full"><div class="w-full p-2"><div class="card w-full bg-base-200"><figure><img src="./curlplusplus.png"></figure><div class="card-body"><div class="card-title">Curl++</div>A minimal, elegant, functional HTTP client with a terminal UI, written with Rust and Ratatui<div class="card-actions justify-end"><button class="btn btn-primary btn-soft">GitHub</button></div></div></div></div></div><div class="carousel-item w-full"><div class="w-full p-2"><div class="card w-full bg-base-200"><figure><img src="./aster.png"></figure><div class="card-body"><div class="card-title">Aster</div>A scalable point-of-sale software stack for cash-only transactions with pricebook and user account support<div class="card-actions justify-end"><button class="btn btn-primary btn-soft">GitHub</button></div></div></div></div></div><div class="carousel-item w-full"><div class="w-full p-2"><div class="card w-full bg-base-200"><figure><img src="./knocktwice.png"></figure><div class="card-body"><div class="card-title">KnockTwice</div>A custom Shopify storefront for KnockTwice, focused on marketing unique items<div class="card-actions justify-end"><button class="btn btn-primary btn-soft">GitHub</button></div></div></div></div></div></div><button class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost">arrow_forward_ios</button></div></div>'];
function xt() {
  return ssr(wt, ssrHydrationKey());
}
var St = ["<div", ' role="tablist" class="sticky top-0 left-0 flex w-full gap-2 justify-center tabs"><a role="tab" class="tab text-lg" href="#skills">Skills</a><a role="tab" class="tab text-lg" href="#projects">Projects</a><a role="tab" class="tab text-lg" href="#contact">Contact</a></div>'], Rt = ["<div", ' class="carousel carousel-vertical w-full h-[calc(100%-40px)]"><div id="intro" class="carousel-item w-full h-full">', '</div><div id="skills" class="carousel-item w-full h-full">', '</div><div id="projects" class="carousel-item w-full h-full">', "</div></div>"];
function $t() {
  const [e, t] = createSignal(0);
  return [ssr(St, ssrHydrationKey()), ssr(Rt, ssrHydrationKey(), escape(createComponent$1(ht, {})), escape(createComponent$1(yt, {})), escape(createComponent$1(xt, {})))];
}
const Y = isServer ? (e) => {
  const t = getRequestEvent();
  return t.response.status = e.code, t.response.statusText = e.text, onCleanup(() => !t.nativeEvent.handled && !t.complete && (t.response.status = 200)), null;
} : (e) => null;
var Ct = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">', "</span>"], Et = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const Tt = (e) => {
  const t = isServer ? "500 | Internal Server Error" : "Error | Uncaught Client Exception";
  return createComponent$1(ErrorBoundary, { fallback: (s) => (console.error(s), [ssr(Ct, ssrHydrationKey(), escape(t)), createComponent$1(Y, { code: 500 })]), get children() {
    return e.children;
  } });
}, At = (e) => {
  let t = false;
  const s = catchError(() => e.children, (n) => {
    console.error(n), t = !!n;
  });
  return t ? [ssr(Et, ssrHydrationKey()), createComponent$1(Y, { code: 500 })] : s;
};
var F = ["<script", ">", "<\/script>"], _t = ["<script", ' type="module"', " async", "><\/script>"], Ht = ["<script", ' type="module" async', "><\/script>"];
const jt = ssr("<!DOCTYPE html>");
function Q(e, t, s = []) {
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    if (i.path !== e[0].path) continue;
    let a = [...s, i];
    if (i.children) {
      const o = e.slice(1);
      if (o.length === 0 || (a = Q(o, i.children, a), !a)) continue;
    }
    return a;
  }
}
function kt(e) {
  const t = getRequestEvent(), s = t.nonce;
  let n = [];
  return Promise.resolve().then(async () => {
    let i = [];
    if (t.router && t.router.matches) {
      const a = [...t.router.matches];
      for (; a.length && (!a[0].info || !a[0].info.filesystem); ) a.shift();
      const o = a.length && Q(a, t.routes);
      if (o) {
        const r = globalThis.MANIFEST.client.inputs;
        for (let l = 0; l < o.length; l++) {
          const d = o[l], u = r[d.$component.src];
          i.push(u.assets());
        }
      }
    }
    n = await Promise.all(i).then((a) => [...new Map(a.flat().map((o) => [o.attrs.key, o])).values()].filter((o) => o.attrs.rel === "modulepreload" && !t.assets.find((r) => r.attrs.key === o.attrs.key)));
  }), useAssets(() => n.length ? n.map((i) => _(i)) : void 0), createComponent$1(NoHydration, { get children() {
    return [jt, createComponent$1(At, { get children() {
      return createComponent$1(e.document, { get assets() {
        return [createComponent$1(HydrationScript, {}), t.assets.map((i) => _(i, s))];
      }, get scripts() {
        return s ? [ssr(F, ssrHydrationKey() + ssrAttribute("nonce", escape(s, true), false), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(_t, ssrHydrationKey(), ssrAttribute("nonce", escape(s, true), false), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(F, ssrHydrationKey(), `window.manifest = ${JSON.stringify(t.manifest)}`), ssr(Ht, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      }, get children() {
        return createComponent$1(Hydration, { get children() {
          return createComponent$1(Tt, { get children() {
            return createComponent$1($t, {});
          } });
        } });
      } });
    } })];
  } });
}
var Nt = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;icon_names=arrow_back_ios,arrow_forward_ios">', "</head>"], Lt = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const Ot = gt(() => createComponent$1(kt, { document: ({ assets: e, children: t, scripts: s }) => ssr(Lt, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(Nt, escape(e));
} }), escape(t), escape(s)) }));

const handlers = [
  { route: '', handler: _AccgMX, lazy: false, middleware: true, method: undefined },
  { route: '/_server', handler: Po, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: Ot, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$2(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { nodeServer as default };
//# sourceMappingURL=index.mjs.map
