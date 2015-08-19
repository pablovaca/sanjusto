/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/notification-template.html',
    'config',
    'collections/notification-collection',
    'views/NotificationView',
    'services/StarMeUpServices',
    'utils/StellarFunctions'
], function ($, _, Backbone, notificationTemplate, Config, NotificationCollection, NotificationView, Smu, Global) {
    'use strict';

    Config.setUp();

    var NotificationListView = Backbone.View.extend({
        el : '#app',
        className : '',
        template : _.template(notificationTemplate),
        notificationCollection : {},
        container : '',
        totalUnread : 0,
        totalUnclear : 0,
        notification : {},
        lastNotificationRead : {},

        initialize : function(container) {
            this.container = container;
            this.$main = this.$('#' + container);
            this.notificationCollection = new NotificationCollection();
            this.off("activitySelected");
            this.off("ready");
            this.off("oneNotificationRemove");
            this.listenTo(this.notificationCollection, 'ready', _.bind(this.render,this));
        },

        events: {
            'click #readAllNotifications' : 'readAllNotifications',
            'click #clearAllNotifications' : 'clearAllNotifications',
            'click #notificationPanel': 'showNotificationList'
        },

        render : function() {
            if (!this.notificationCollection.isReady) {
                return;
            }
            var notificationToRead = 0;
            //this.totalUnread = this.notificationCollection.length;
            this.totalUnclear = this.notificationCollection.length;
            //$("#notificationList").removeClass("open");
            if (this.notificationCollection.length>0) {
                var model = {
                    notifications : this.notificationCollection.toJSON()
                };
                this.$main.html('');
                this.$main.html(this.template());
                _.each(model.notifications, function (notification) {
                    if(!notification.isView){
                       notificationToRead ++;
                    }
                    this.renderNotification(notification);
                }, this);
            }
            if(notificationToRead > 0){
                $("#totalNotifications").removeClass("hide");
                if(notificationToRead > 99){
                    $("#totalNotifications").html("+99").css("font-size", "11px");
                } else {
                    $("#totalNotifications").html(notificationToRead);
                }
            } else {
                $("#totalNotifications").addClass("hide");
                $("#totalNotifications").html(0);
            }
            $(this.$main).i18n($.i18n.options);
            this.totalUnread = notificationToRead;
        },

        renderNotification : function(notification){
            var notificationView=new NotificationView(notification);
            this.listenTo(notificationView, 'activitySelected', this.activityNavigation);
            this.listenTo(notificationView, 'oneNotificationRemove', this.oneNotificationRemove);
            this.$main.append(notificationView.$el);
            notificationView.render();
        },

        showNotificationList : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            if (!$("#notificationList").hasClass("open")) {
                if (this.totalUnclear > 0) {
                    Smu.markAllNotificationsView();
                    $("#totalNotifications").addClass("hide");
                    $("#totalNotifications").html(0);
                    $("#notificationList").addClass("open");
                    $("#settingListId").removeClass("open");
                    $("#languageList").removeClass("open");
                } else if(this.totalUnclear == 0) {
                    this.$main.html("<li id='emptyNotifications'><div style='text-align:center;'><h4 style='margin:0 0 0 0;' data-i18n=\"[html]translation:notification.noNotification\" >You haven't got any new notifications.</h4></div></li>");
                    $("#notificationList").addClass("open");
                    $("#settingListId").removeClass("open");
                    $("#languageList").removeClass("open");
                }
            }
            else{
                $("#notificationList").removeClass("open");
            }
            $(this.$main).i18n($.i18n.options);
        },

        blurNotifications : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
        },

        notificationsRead : function(result,status,message) {
            if (status=="OK") {
                $("#totalNotifications").addClass("hide");
                if(this.totalUnread > 0){
                    this.notificationCollection = new NotificationCollection();
                    this.listenTo(this.notificationCollection, 'ready', _.bind(this.render,this));
                }
                this.totalUnread = 0;
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        notificationsClear : function(result,status,message) {
            if (status=="OK") {
                $("#totalNotifications").addClass("hide");
                $("#notificationList").removeClass("open");
                this.totalUnclear = 0;
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        readAllNotifications : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            Smu.markAllNotificationsRead(_.bind(this.notificationsRead,this));
        },

        clearAllNotifications : function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            Smu.markAllNotificationsRemoved(_.bind(this.notificationsClear,this));
        },

        activityNavigation : function(activityId){
            $("#notificationList").removeClass("open");
            this.trigger('activitySelected', activityId);
        },

        oneNotificationRemove : function(){
            this.trigger('oneNotificationRemove');
        }

    });

    return NotificationListView;
});
