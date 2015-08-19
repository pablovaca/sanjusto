/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/notification-item-template.html',
    'config',
    'models/notification-model',
    'services/StarMeUpServices'
], function ($, _, Backbone, notificationTemplate, Config, NotificationModel, smuServices) {
    Config.setUp();
    var NotificationView = Backbone.View.extend({
        template : _.template(notificationTemplate),
        notification : {},

        initialize : function(notification) {
            this.notification = notification;
        },

        render : function() {
            this.notification.from.profileImageId = smuServices.getProfileImage(this.notification.from.profileImageId);
            var model = {
                notification : this.notification
            };
            this.$el.html(this.template({
                model : model
            }));
            if(!this.notification.isRead){
                this.$el.find('.js-activity-navigate').addClass('unread');
            }
            this.$el.find('.js-activity-navigate').on('click', _.bind(this.activityNavigation, this));
            this.$el.find('.js-remove-notification').on('click', _.bind(this.removeNotification, this));
        },

        removeNotification : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            smuServices.markOneNotificationsRemoved(_.bind(this.removeNotificationReady,this),this.notification.id);
        },

        removeNotificationReady : function() {
            this.trigger("oneNotificationRemove");
        },

        activityNavigation : function(event){
            event.preventDefault();
            event.stopPropagation();
            if(!this.notification.isRead){
                smuServices.markOneNotificationsRead(_.bind(this.notificationWasRead, this),this.notification.id);
            } else {
                this.notificationWasRead();
            }
        },

        notificationWasRead : function (){
            this.trigger('activitySelected', this.notification.starId);
        }
    });
    return NotificationView;
});
