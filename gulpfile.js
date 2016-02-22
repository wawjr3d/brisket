"use strict";

var gulp = require("gulp");
var beautifyJs = require("./build_tools/beautifyJs");
var lintJs = require("./build_tools/lintJs");
var bundle = require("./build_tools/bundle");
var sequence = require("./build_tools/sequence");
var clientSideJasmine = require("./build_tools/clientSideJasmine");
var serverSideJasmine = require("./build_tools/serverSideJasmine");
var benchmark = require("./build_tools/benchmark");

var LIB = "./lib/**/*.js";
var REST = "./*.js";
var BUILD_TOOLS = "./build_tools/*.js";
var TEST_HELPERS = "./spec/helpers/**/*.js";
var CLIENT_TESTS = "./spec/client/**/*.js";
var CLIENT_TEST_BUNDLE = "./spec/build/lib.js";
var DEBUG_MODE_TEST_BUNDLE = "./spec/build/debugModeSpec.js";
var CONFIGURE_CLIENT_TEST = "./spec/configureClientTesting.js";
var DEBUG_MODE_TEST = "./spec/debug_mode/debugModeSpec.js";
var SERVER_TESTS = "./spec/server/**/*.js";
var CONFIGURE_SERVER_TEST = "./spec/configureServerTesting.js";
var BENCHMARKS = "./benchmarks/a.js";
var ALL_TEST_CODE = "./spec/**/*.js";
var NOT_BUILD_DIRECTORY_THOUGH = "!./spec/build/**/*.js";

var ALL_CODE = [
    BUILD_TOOLS,
    LIB,
    REST,
    ALL_TEST_CODE,
    DEBUG_MODE_TEST,
    NOT_BUILD_DIRECTORY_THOUGH
];

gulp.task("beautifyJs", function() {
    return beautifyJs(ALL_CODE);
});

gulp.task("lintJs", function() {
    return lintJs(ALL_CODE);
});

gulp.task("test-on-server", function() {
    return serverSideJasmine([
        CONFIGURE_SERVER_TEST,
        TEST_HELPERS,
        SERVER_TESTS
    ]);
});

gulp.task("benchmarks", function() {
    return benchmark(BENCHMARKS);
});

gulp.task("bundle-for-debug-mode", function() {
    return bundle({
        src: DEBUG_MODE_TEST,
        dest: DEBUG_MODE_TEST_BUNDLE
    });
});

// wawjr3d [1/31/2016]: test debug mode separately because the code in Backbone module
//  can only be spied on before executing the module.
gulp.task("test-debug-mode", ["bundle-for-debug-mode"], function() {
    return clientSideJasmine({
        src: DEBUG_MODE_TEST_BUNDLE
    });
});

gulp.task("bundle-for-client", function() {
    return bundle({
        src: LIB,
        dest: CLIENT_TEST_BUNDLE,
        alias: {
            "backbone": "./node_modules/backbone/backbone.js",
            "underscore": "./node_modules/underscore/underscore.js",
            "bluebird": "./node_modules/bluebird/js/release/bluebird.js",
            "jquery": "./node_modules/jquery/dist/jquery.js",
            "cookie": "./node_modules/cookie/index.js"
        },
        mapDirectories: {
            "lib": "./lib",
            "mock": "./spec/mock"
        },
        ignore: "./lib/server/**/*.js",
        debug: true
    });
});

gulp.task("test-on-client", ["bundle-for-client"], function() {
    return clientSideJasmine({
        src: CLIENT_TEST_BUNDLE,
        specs: [
            CONFIGURE_CLIENT_TEST,
            TEST_HELPERS,
            CLIENT_TESTS
        ],
        vendor: "build_tools/vendor/es5-shim.js"
    });
});

gulp.task("default", sequence(
    "beautifyJs", [
        "lintJs",
        "test-on-server",
        "test-debug-mode",
        "test-on-client"
    ]
));

// ----------------------------------------------------------------------------
// Copyright (C) 2016 Bloomberg Finance L.P.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------- END-OF-FILE ----------------------------------
