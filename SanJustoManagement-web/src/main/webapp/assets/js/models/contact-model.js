define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Contact = Backbone.Model.extend({

        defaults: {
            id : null,
            firstName : null,
            middleName : null,
            lastName : null,
            phone : null,
            email : null,
            enabled : null,
            customerId : null,
            customerName : null
        }
    });

    return Contact;

});