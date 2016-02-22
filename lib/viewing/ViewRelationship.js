"use strict";

var ViewsFromServer = require("../viewing/ViewsFromServer");

var ViewRelationship = function(ChildView, parentView) {
    this.ChildView = ChildView;
    this.parentView = parentView;
};

ViewRelationship.prototype = {
    parentView: null,
    ChildView: null,
    childView: null,
    options: null,
    destination: null,
    placementStrategy: null,
    uid: null,

    setUid: function(uid) {
        this.uid = uid;
    },

    instantiateChildView: function() {
        if (!this.childView) {
            this.childView = new this.ChildView(this.options);
        }

        if (this.childView.setUid && !this.childView.hasValidUid()) {
            this.childView.setUid(this.uid);
        }
    },

    hasBeenPlaced: function() {
        return !!this.placementStrategy;
    },

    enterDOM: function() {
        if (!this.childView.enterDOM) {
            return;
        }

        if (!this.parentView.isInDOM) {
            return;
        }

        return this.childView.enterDOM.apply(this.childView, arguments);
    },

    reattach: function() {
        if (!this.childView.reattach) {
            return;
        }

        return this.childView.reattach.apply(this.childView, arguments);
    },

    withOptions: function(options) {
        this.options = options;
        return this;
    },

    andAppendIt: function() {
        return this.andPlace(null, "append");
    },

    andPrependIt: function() {
        return this.andPlace(null, "prepend");
    },

    andInsertInto: function(destination) {
        return this.andPlace(destination, "html");
    },

    andInsertAfter: function(destination) {
        return this.andPlace(destination, "after");
    },

    andReplace: function(destination) {
        return this.andPlace(destination, "replaceWith");
    },

    andAppendItTo: function(destination) {
        return this.andPlace(destination, "append");
    },

    andPrependItTo: function(destination) {
        return this.andPlace(destination, "prepend");
    },

    andInsertBefore: function(destination) {
        return this.andPlace(destination, "before");
    },

    andPlace: function(destination, placementStrategy) {
        this.instantiateChildView();

        this.destination = destination;
        this.placementStrategy = placementStrategy;

        if (this.parentView.hasNotBeenRendered()) {
            this.parentView.addUnrenderedChildView(this);
            return this;
        }

        if (this.parentView.isNotAlreadyAttachedToDOM() || childViewCannotReattach(this)) {
            this.renderChildViewIntoParent();
            return this;
        }

        this.childView.reattach();

        if (this.childView.isAttached) {
            this.childView.render();
            this.enterDOM();
        } else {
            this.renderChildViewIntoParent();
        }

        return this;
    },

    renderChildViewIntoParent: function() {
        var $destination = this.parentView.$el;

        if (this.destination) {
            $destination = this.parentView.$(this.destination);
        }

        $destination[this.placementStrategy](this.childView.render().el);

        this.enterDOM();
    },

    close: function() {
        if (this.childView && this.childView.close) {
            this.childView.close();
        }

        clearParentChildRelationship(this);
    },

    closeAsChild: function() {
        if (this.childView && this.childView.closeAsChild) {
            this.childView.closeAsChild();
        }

        clearParentChildRelationship(this);
    },

    lazyAttach: function() {
        var search = "[" + ViewsFromServer.IDENTITY_ATTRIBUTE + "='" + this.uid + "']";
        var childView = this.childView;
        var parentView = this.parentView;
        var _el = childView.el;
        var _$el = childView.$el;

        // console.log(search);

        Object.defineProperty(childView, "el", {
            get: function() {
                Object.defineProperty(childView, "el", {
                    get: function() {
                        return _el;
                    },

                    set: function(value) {
                        _el = value;
                    }
                });
                childView.setElement(parentView.$(search));
                return _el;
            }
        });

        Object.defineProperty(childView, "$el", {
            get: function() {
                Object.defineProperty(childView, "$el", {
                    get: function() {
                        return _$el;
                    },

                    set: function(value) {
                        _$el = value;
                    }
                });
                // console.log(parentView.$(search));
                childView.setElement(parentView.$(search));
                return _$el;
            }
        });
    }

};

function clearParentChildRelationship(relationship) {
    relationship.childView = null;
    relationship.parentView = null;
    relationship.ChildView = null;
}

function childViewCannotReattach(viewRelationship) {
    return typeof viewRelationship.childView.reattach !== "function";
}

module.exports = ViewRelationship;

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
