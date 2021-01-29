(self["webpackChunk_feature_hub_demos"] = self["webpackChunk_feature_hub_demos"] || []).push([["src_module-loader-federation_feature-app_tsx-webpack_sharing_consume_default_react-dom_react--cb62f0"],{

/***/ "./src/module-loader-federation/feature-app.tsx":
/*!******************************************************!*\
  !*** ./src/module-loader-federation/feature-app.tsx ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @blueprintjs/core */ "../../node_modules/@blueprintjs/core/lib/esm/index.js");
const React = __importStar(__webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react?5a18"));
const featureAppDefinition = {
    dependencies: {
        externals: { react: '^16.7.0' },
    },
    create: () => ({
        render: () => (React.createElement(core_1.Card, { style: { margin: '20px' } },
            React.createElement(core_1.Text, null, "Hello, World!"))),
    }),
};
exports.default = featureAppDefinition;


/***/ })

}]);