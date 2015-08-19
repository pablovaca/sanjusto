/*
 * Backbonbe Model object to handle course
 */

define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Activity = Backbone.Model.extend({

        defaults: {
            id: null,
            from: null,
            to: null,
            star: null,
            date: null,
            dateSpan: null,
            lastUpdate: null,
            lastUpdateSpan: null,
            comments: null,
            enabled:true,
            notes:'',
            notesCharsView:140,
            notesLinesView:1
        },

        constructor: function(params, options){
            if(params != null){
                if(params.date != null){
                    params.dateSpan = _.toTimeSpan(params.date);
                }

                if(params.lastUpdate != null){
                    params.lastUpdateSpan = _.toTimeSpan(params.lastUpdate);
                }

                if(params.comments != null){
                    _.each(params.comments, function(comment, commentIndex){
                        comment.dateCommentSpan = _.toTimeSpan(comment.dateComment);
                    }, this);
                }
            }

            Backbone.Model.prototype.constructor.call(this, params);
        }
    });

    return Activity;
});