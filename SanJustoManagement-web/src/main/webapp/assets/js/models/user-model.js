define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var User = Backbone.Model.extend({

        defaults: {
            id: null,
            firstName: null,
            lastName: null,
            email: null,
            username: null,
            fullName: null
        }
    });

    return User;

});