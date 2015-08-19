/*
 * Backbonbe Model object to handle course
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var PeriodStar = Backbone.Model.extend({
        
        defaults: {
            id: null,
            organization: null,
            maxStarToGive: null,
            startDatePeriod: null,
            startDateToShow: null,
            periodValue: null,
            periodUnit: null
        }
    });

    return PeriodStar;
  
});