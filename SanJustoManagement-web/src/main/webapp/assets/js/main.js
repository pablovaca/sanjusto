/*global require*/
'use strict';
require([
    'backbone',
    'routers/router',
    'config'
    ], function (Backbone, AppRouter, Config) {
    Config.setUp();
    var router = new AppRouter();
    Backbone.history.start();
});
