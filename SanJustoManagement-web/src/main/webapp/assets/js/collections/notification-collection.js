define([
    'jquery',
    'underscore',
    'backbone',
    'models/notification-model',
    'services/StarMeUpServices'
], function($, _, Backbone, NotificationModel, smuServices){
    var Notifications = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        // specify Base Widget model
        // model: Star
        initialize: function(){
            // we use the smuService as a re
            smuServices.getNotifications(_.bind(this.fillCollection, this));
        },
        
        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.length > 0){
                    _.each(result,function(element,index){
                        this.add(new NotificationModel({
                            id: element.id,
                            title: element.title,
                            message: element.notification,
                            date: element.dateNotification,
                            from: element.from,
                            starId: element.starId,
                            isRead: element.isRead,
                            isView: element.isView
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

    return Notifications;
  
});