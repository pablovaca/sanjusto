define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Branch = Backbone.Model.extend({

        defaults: {
            id: null,
            name: null,
            startDate: null,
            address: null,
            neighborhood: null,
            city: null,
            phone: null,
            customerId: null,
            customerName: null
        }
    });

    return Branch;

});