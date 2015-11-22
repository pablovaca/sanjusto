define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var BranchDTO = Backbone.Model.extend({

        defaults: {
            id: null,
            name: null
        }
    });

    return BranchDTO;

});