define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Customer = Backbone.Model.extend({

        defaults: {
            id: null,
            name: null,
            startDate: null,
            address: null,
            neighborhood: null,
            city: null,
            phone: null,
            email: null
        }
    });

    return Customer;

});