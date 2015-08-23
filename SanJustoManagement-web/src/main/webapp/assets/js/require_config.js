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
        'bootstrap-switch' : {
            deps :['bootstrap']
        },
        'jquery.fileupload' : {
            deps :[
                   'jquery',
                   'jquery.ui.widget'
                   ]
        },
        'jquery.fileupload-imaget' : {
            deps :['jquery.fileupload']
        },
        'jquery.fileupload-process' : {
            deps :['jquery.fileupload']
        },
        'jquery.ui.totop' : {
            deps :['jquery']
        },
        'jquery.fileupload-validate' : {
            deps :['jquery.fileupload']
        },
        'load-image' : {
            deps :['jquery.fileupload']
        },
        'load-image-meta' : {
            deps :['load-image']
        },
        'load-image-exif' : {
            deps :['load-image-meta']
        },
        'load-image-exif-map' : {
            deps :['load-image-meta']
        },
        'load-image-ios' : {
            deps :['load-image-meta']
        },
        'load-image-orientation' : {
            deps :['load-image-meta']
        },
        'typeahead' : {
            deps :['jquery']
        },
        hello : {
            deps :['jquery']
        },
        datePicker : {
            deps :['jquery','moment']
        },
        'i18next' : {
            deps :['jquery']
        },

        'radar-custom' : {
            deps :['d3']
        },

        c3 : {
            deps:['d3']
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
        'bootstrap-switch': './libs/bootstrap-switch.min',
        typeahead: './libs/typeahead.bundle',
        utils: 'utils',
        'jquery.fileupload': './libs/jquery.fileupload',
        'jquery.ui.widget': './libs/jquery.ui.widget',
        'jquery.fileupload-imaget': './libs/jquery.fileupload-image',
        'jquery.fileupload-process': './libs/jquery.fileupload-process',
        'jquery.fileupload-validate': './libs/jquery.fileupload-validate',
        'jquery.ui.totop' : './libs/jquery.ui.totop',

        'load-image': './libs/load-image',
        'load-image-exif': './libs/load-image-exif',
        'load-image-exif-map': './libs/load-image-exif-map',
        'load-image-ios': './libs/load-image-ios',
        'load-image-meta': './libs/load-image-meta',
        'load-image-orientation': './libs/load-image-orientation',

        'canvas-to-blob': './libs/canvas-to-blob',
        hello: './libs/hello',
        gapi: './libs/gapi',
        d3 : './libs/d3',
        c3 : './libs/c3.min',
        datePicker: './libs/bootstrap-datetimepicker',
        moment: './libs/moment.min',
        'i18next': './libs/i18next-1.7.7.min',

        'select2' : './libs/select2',
        'radar-custom' : './libs/radar-custom'

    }
});

