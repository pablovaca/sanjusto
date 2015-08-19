/*
 * Backbonbe Model object to handle course
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Notification = Backbone.Model.extend({
        
        defaults: {
            id: null,
            title: null,
            message: null,
            date: null,
            from: null,
            isRead:false
        }
    });

    return Notification;
  
});