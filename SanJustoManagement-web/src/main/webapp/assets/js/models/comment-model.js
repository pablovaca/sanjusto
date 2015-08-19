/*
 * Backbonbe Model object to handle course
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Comment = Backbone.Model.extend({
        
        defaults: {
    		starId: null,
    		type: null,
    		comment: null,
    		enabled : true
        }
    });

    return Comment;
  
});