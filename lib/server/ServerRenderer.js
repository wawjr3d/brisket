"use strict";

var AjaxCallsForCurrentRequest = require("./AjaxCallsForCurrentRequest");
var titleForRouteFrom = require("../util/titleForRouteFrom");
var escapeHtml = require("escape-html");
var Layout = require("../viewing/Layout");

var INITIAL_REQUEST_ID = 1;
var HTML_TITLE = /(<title[^>]*>)([^<]*)(<\/title>)/mi;
var HEAD_ENDING = /(<\/head>)/mi;
var DEBUG_MODE_SCRIPT = "<script>window.Brisket={debug:true};</script>";

var ServerRenderer = {

    render: function(layout, view, environmentConfig, serverRequest) {
        var titleForRoute = titleForRouteFrom(layout, view);
        var metatags = typeof view.getMetatags === "function" ? view.getMetatags() : null;
        var config = environmentConfig || {};
        var appRoot = config.appRoot || "";

        if (view.setUid) {
            view.setUid(layout.generateChildUid(INITIAL_REQUEST_ID));
        }

        var html = layout.asHtml();

        if (layout.contentWasPlaced) {
            var layoutParts = html.split(Layout.CONTENT_PLACEHOLDER);

            html = layoutParts[0] + view.render().el.outerHTML + layoutParts[1];
        } else {
            layout.setContent(view);
        }

        var clientStartScript = makeClientStartScript(
            stringifyData(config),
            escapeClosingSlashes(stringifyData(getBootstrappedDataForRequest()))
        );

        clientStartScript = stripIllegalCharacters(clientStartScript);


        html = injectDebugMode(html, config);
        html = injectTitleTag(html, titleForRoute);
        html = injectMetaTags(html, metatags);
        html = injectScriptAtBottomOfBody(html, clientStartScript);
        html = injectBaseTag(html, appRoot, serverRequest);

        return html;
    }

};

function getBootstrappedDataForRequest() {
    return AjaxCallsForCurrentRequest.all();
}

function stringifyData(data) {
    return JSON.stringify(data || {});
}

function escapeClosingSlashes(string) {
    return string.replace(/<\/script/g, "<\\/script");
}

function injectScriptAtBottomOfBody(html, script) {
    return html.replace(/<\/body>\s*<\/html>\s*$/i, script + "</body></html>");
}

function makeClientStartScript(environmentConfig, bootstrappedData) {
    return "<script type=\"text/javascript\">\n" +
        "var b = window.Brisket = window.Brisket || {};\n" +
        "b.version = '" + require("../../version.json").version + "';\n" +
        "b.startConfig = {\n" +
        "environmentConfig: " + environmentConfig + ",\n" +
        "bootstrappedData: " + bootstrappedData + "\n" +
        "};\n" +
        "</script>";
}

function baseTagFrom(appRoot, serverRequest) {
    var host = serverRequest.host;
    var hostAndPath = appRoot ? host + appRoot : host;

    return "<base href='" + serverRequest.protocol + "://" + hostAndPath + "/'>";
}

function injectBaseTag(html, appRoot, serverRequest) {
    var existingBaseTag = /<base[^>]*>/;
    var brisketBaseTag = baseTagFrom(appRoot, serverRequest);

    var htmlWithoutExistingBaseTag = html.replace(existingBaseTag, "");
    var htmlWithBrisketBaseTag = htmlWithoutExistingBaseTag.replace(/<head[^>]*>/, "<head>\n" + brisketBaseTag);

    return htmlWithBrisketBaseTag;
}

function stripIllegalCharacters(input) {
    return input.replace(/\u2028|\u2029/g, '');
}

function injectMetaTags(html, metatagsFromRoute) {
    var metatags = metatagsFromRoute;

    if (!metatags) {
        return html;
    }

    if (!Array.isArray(metatags)) {
        metatags = [metatags];
    }

    return html.replace(HEAD_ENDING, function(match, headEnding) {
        var metatagsHtml = "";

        for (var i = 0, len = metatags.length; i < len; i++) {
            metatagsHtml += metatags[i].asHtml(escapeHtml);
        }

        return metatagsHtml + headEnding;
    });
}

function injectTitleTag(html, titleForRoute) {
    if (!titleForRoute) {
        return html;
    }

    return html.replace(HTML_TITLE, function(match, titleOpen, oldTitle, titleClose) {
        var escapedTitle = escapeHtml(titleForRoute);

        return titleOpen + escapedTitle + titleClose;
    });
}

function injectDebugMode(html, config) {
    if (!config.debug) {
        return html;
    }

    return html.replace(HEAD_ENDING, function(match, headEnding) {
        return DEBUG_MODE_SCRIPT + headEnding;
    });
}

module.exports = ServerRenderer;

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
