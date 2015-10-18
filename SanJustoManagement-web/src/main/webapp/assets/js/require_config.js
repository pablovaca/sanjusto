/*global require*/
'use strict';
// Require.js allows us to configure shortcut alias
require.config({
        urlArgs: "bust=" + (new Date()).getTime(),//avoids cache
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
        deps: ['main'], 
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
            'underscore',
            'jquery',
            'bootstrap',
            'i18next'
            ],
            exports: 'Backbone'
        },
        bootstrap : {
            deps :['jquery']
        },
        'i18next' : {
            deps :['jquery']
        }
    },
    baseUrl: 'assets/js',
    paths: {
        jquery: './libs/jquery-1.11.1.min',
        underscore: './libs/underscore',
        backbone: './libs/backbone',
        services: 'services',
        text: './libs/text',
        models: 'models',
        views: 'views',
        collections: 'collections',
        bootstrap: './libs/bootstrap',
        'i18next': './libs/i18next-1.7.7.min'
    }
});

