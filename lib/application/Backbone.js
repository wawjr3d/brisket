"use strict";

var Backbone = require("backbone").noConflict();
var $ = require("../application/jquery");
var Environment = require("../environment/Environment");

if (Environment.clientDebuggingEnabled() && window.__backboneAgent) {
    window.__backboneAgent.handleBackbone(Backbone);
}

if (Environment.isServer()) {

    Backbone.View.prototype._createElement = function(tagName) {
        return Backbone.$('<' + tagName + '>');
    };

    Backbone.View.prototype._realEnsureElement = Backbone.View.prototype._ensureElement;

    Backbone.View.prototype.hasEl = false;

    Backbone.View.prototype._ensureElement = function() {
        var view = this;
        view._el = null;
        view._$el = null;

        function restore() {
            Object.defineProperty(view, "el", {
                get: function() {
                    return this._el;
                },
                set: function(value) {
                    this._el = value;
                }
            });
            Object.defineProperty(view, "$el", {
                get: function() {
                    return this._$el;
                },
                set: function(value) {
                    this._$el = value;
                }
            });

            view._realEnsureElement();
            view.hasEl = true;
        }

        Object.defineProperty(view, "el", {
            configurable: true,
            get: function() {
                restore();
                return this._el;
            },
            set: function(value) {
                restore();
                this._el = value;
            }
        });

        Object.defineProperty(view, "$el", {
            configurable: true,
            get: function() {
                restore();
                return this._$el;
            },
            set: function(value) {
                restore();
                this._$el = value;
            }
        });
    }

}

Backbone.$ = $;

module.exports = Backbone;

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
