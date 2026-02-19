"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — public API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBoundaryCoverage = exports.createTrustBoundary = exports.exportMarkdown = exports.importJSON = exports.exportJSON = exports.createRecord = exports.verifyTrace = exports.GENESIS_PREVIOUS_HASH = exports.TraceBuilder = exports.createTrace = void 0;
var trace_1 = require("./core/trace");
Object.defineProperty(exports, "createTrace", { enumerable: true, get: function () { return trace_1.createTrace; } });
Object.defineProperty(exports, "TraceBuilder", { enumerable: true, get: function () { return trace_1.TraceBuilder; } });
Object.defineProperty(exports, "GENESIS_PREVIOUS_HASH", { enumerable: true, get: function () { return trace_1.GENESIS_PREVIOUS_HASH; } });
var verify_1 = require("./core/verify");
Object.defineProperty(exports, "verifyTrace", { enumerable: true, get: function () { return verify_1.verifyTrace; } });
var record_1 = require("./core/record");
Object.defineProperty(exports, "createRecord", { enumerable: true, get: function () { return record_1.createRecord; } });
var json_1 = require("./export/json");
Object.defineProperty(exports, "exportJSON", { enumerable: true, get: function () { return json_1.exportJSON; } });
Object.defineProperty(exports, "importJSON", { enumerable: true, get: function () { return json_1.importJSON; } });
var markdown_1 = require("./export/markdown");
Object.defineProperty(exports, "exportMarkdown", { enumerable: true, get: function () { return markdown_1.exportMarkdown; } });
var trust_1 = require("./boundaries/trust");
Object.defineProperty(exports, "createTrustBoundary", { enumerable: true, get: function () { return trust_1.createTrustBoundary; } });
Object.defineProperty(exports, "validateBoundaryCoverage", { enumerable: true, get: function () { return trust_1.validateBoundaryCoverage; } });
//# sourceMappingURL=index.js.map