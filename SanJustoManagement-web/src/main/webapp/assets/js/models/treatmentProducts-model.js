define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var TreatmentProducts = Backbone.Model.extend({

        defaults: {
            id: null,
            productName: null,
            quantity: null,
            unitName: null
        }
    });

    return TreatmentProducts;

});