/*global require*/
'use strict';
require([
    'backbone',
    'routers/router',
    'config'
    ], function (Backbone, AppRouter, Config) {
    var ref = $(location).attr('href').split("/");
    var domainUrl = ref[ref.length-1];


    $(document).ready(function() {
        $("#mainLink").attr("href","assets/content/css/main.css");
    });

    Config.setUp();
    var router = new AppRouter();
    Backbone.history.start();
});
