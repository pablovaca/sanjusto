define([
    'jquery',
    'underscore',
    'backbone',
    'models/activity-model',
    'services/StarMeUpServices'
], function($, _, Backbone, ActivityModel, smuServices){
    var Activities = Backbone.Collection.extend({
        size : 10,

        defaults: {
            isReady:false
        },

        initialize: function(element){
        },

        allFillCollectionDesc: function (userId, firstStarId, filter, page) {
            smuServices.allActivityFeed(_.bind(this.fillCollection, this), userId, firstStarId, page, this.size, "DESC", filter,0);
        },

        allFillCollectionDescForAnimation: function (userId, firstStarId, filter, page) {
            smuServices.allActivityFeed(_.bind(this.fillCollection, this), userId, firstStarId, page, this.size * 50, "DESC", filter,0);
        },

        allFillCollectionAsc: function (userId, firstStarId,  filter, page) {
            smuServices.allActivityFeed(_.bind(this.fillCollection, this), userId, firstStarId, page, this.size, "ASC", filter,0);
        },

        selectedActivityInNotification: function (userId, activityId, filter){
            smuServices.allActivityFeed(_.bind(this.fillCollection, this), userId, null, 0, 1, "ASC", filter, activityId);
        },
        
        fillCollection: function(result, status, message){
            if (status=="OK") {
                if(result && result.total >= 0 && result.content.length >= 0){
                    _.each(result.content,function(element,index){
                    if(element.starMeUpOrganizationStar != null){
                        element.starMeUpOrganizationStar.imageUrl = smuServices.getStarImage(element.starMeUpOrganizationStar.imageId);
                    }

                      this.add(new ActivityModel({
                            id: element.id,
                            from: element.from,
                            to: element.to,
                            star:  element.starMeUpOrganizationStar,
                            date: element.date,
                            lastUpdate: element.lastUpdate,
                            notes: element.notes,
                            comments: element.comments,
                            enabled: element.enabled
                        }))
                    }, this);
                }
                this.isReady = true;
                this.trigger('ready');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        }
    });

    return Activities;
  
});