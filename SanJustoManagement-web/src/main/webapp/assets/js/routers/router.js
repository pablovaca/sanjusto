define([
    "underscore",
    "jquery",
    "backbone",
    "services/APIServices"
], function (_,$, Backbone, api) {
    "use strict";
    var AppRouter = Backbone.Router.extend({
        routes: {
        }
    });
    return AppRouter;
});
