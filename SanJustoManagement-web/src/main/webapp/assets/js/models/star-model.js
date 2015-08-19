/*
 * Backbonbe Model object to handle course
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Star = Backbone.Model.extend({
        
        defaults: {
            id:null,
            name: '',
            nameShowed: '',
            imageId: 0,
            description: '',
            descriptionShowed: '',
            enabled:null,
            imageUrl: ''            
        }
    });

    return Star;
  
});