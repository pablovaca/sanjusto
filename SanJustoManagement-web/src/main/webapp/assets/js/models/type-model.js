define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Type = Backbone.Model.extend({

        defaults: {
            id: null,
            type: null,
            shortName: null,
            description: null,
            enabled: null
        }
    });

    return Type;

});