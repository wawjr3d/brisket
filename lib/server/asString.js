var Model = require("../modeling/Model");
var View = require("../viewing/View");
var TemplateAdapter = require("../templating/TemplateAdapter");
var _ = require("underscore");
var $ = require("../application/jquery");
var cssToXPath = require('css-to-xpath');

var ChildView = View.extend({
    beforeRender: function() {
        // this.createChildView(View)
        //     .andAppendIt();
    }
});

function asString(view) {
    // if (view.hasEl) {
    //     return view.render().el.outerHTML;
    // }

    var renderedtemplate;

    establishIdentity(view);

    view.beforeRender();
    generateViewPlaceholders(view);

    renderedtemplate = renderTemplate(view);

    // if (view.hasEl) {
    //     view.el.innerHTML = renderedtemplate;
    // }

    renderedtemplate = renderUnrenderedChildViews(view, renderedtemplate);

    view.afterRender();

    // if (view.hasEl) {
    //     return view.el.outerHTML;
    // }

    return outerHtml(view, renderedtemplate);
}

function establishIdentity(view) {
    view.attributes = view.attributes || {};
    view.attributes["data-view-uid"] = view.uid;
}

function generateViewPlaceholders(view) {
    // [wawjr3d] Do this before return so data.views is always an object
    view.viewPlaceholders = {};

    view.foreachChildView(function(viewRelationship, identifier, i) {
        if (viewRelationship.hasBeenPlaced()) {
            return;
        }

        view.viewPlaceholders[identifier] = viewPlaceholder(viewRelationship);
    });
}

function renderUnrenderedChildViews(view, renderedtemplate) {
    var updated = renderedtemplate;
    if (!view.unrenderedChildViews) {
        return updated;
    }

    for (var i = 0, len = view.unrenderedChildViews.length; i < len; i++) {
        var viewRelationship = view.unrenderedChildViews[i];

        updated = renderInto(viewRelationship, updated);
    }

    view.unrenderedChildViews.length = 0;

    return updated;
}

function renderInto(viewRelationship, renderedtemplate) {
    viewRelationship.instantiateChildView();

    var updated = renderedtemplate;

    var renderedView = asString(viewRelationship.childView);

    switch(viewRelationship.placementStrategy) {
        case "prepend":
            updated = renderedView + updated;
            break;

        case "append":
            updated += renderedView;
            break;

        case "replaceWith":
            var doc = require("libxmljs").parseHtmlFragment("<div>" + updated + "</div>");
            var selector = cssToXPath(viewRelationship.destination);
            var match = doc.get(selector);
            match.replace(renderedView);
            updated = doc.toString();
            break;

        default:
            break;
    }

    return updated;
}

function viewPlaceholder(viewRelationship) {
    return {
        toString() {
            viewRelationship.instantiateChildView();

            return asString(viewRelationship.childView);
        }
    }
}

function renderTemplate(view) {
    if (!view.template) {
        return "";
    }

    if (!view.templateAdapter) {
        throw new Error(
            "You must specify a templateAdapter for a View. " + view + " is missing a templateAdapter"
        );
    }

    if (!TemplateAdapter.isPrototypeOf(view.templateAdapter)) {
        throw new Error(
            view + " templateAdapter must extend from Brisket.Templating.TemplateAdapter."
        );
    }

    return view.templateAdapter.templateToHTML(
        view.template,
        view.templateData(),
        view.partials
    );
}

function outerHtml(view, innerHTML) {
    var nodeName = _.result(view, "tagName");
    var attrs = _.extend({}, _.result(view, 'attributes'));
    if (view.id) attrs.id = _.result(view, 'id');
    if (view.className) attrs['class'] = _.result(view, 'className');

    var output = "";

   for(var key in attrs) {
     output += key + "=\"" + attrs[key] + "\" ";
   }

   var outer = "<" + nodeName + " " + output + ">" + innerHTML + "</" + nodeName + ">";

    return outer;
}
var model = new Model();
model.set("burp", "burp");
var BurpView = View.extend({
    template: function(data) {
        return "<div class='other-el'></div><div class='child'></div>";
    },

    // tagName: "iframe",
    // // attributes: {
    // //     src: "http://www.burp.com"
    // // },
    // // className: "burp",
    // // id: "my-id",
    beforeRender: function() {
        this.child = new ChildView();

        // this.createChildView("child", this.child);

        // this.createChildView(ChildView)
        //     .andAppendIt();

        // this.createChildView(ChildView)
        //     .andPrependIt();

        this.createChildView(ChildView)
            .andReplace(".child");
    }

});
module.exports = function() {

var view = new BurpView(
    // { model: model }
    );

    return asString(view);
};

console.log(module.exports());
