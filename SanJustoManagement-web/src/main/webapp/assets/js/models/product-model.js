define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Product = Backbone.Model.extend({

        defaults: {
            id: null,
            name: null,
            description: null,
            quantity: null,
            unit: null
        }
    });

    return Product;

});