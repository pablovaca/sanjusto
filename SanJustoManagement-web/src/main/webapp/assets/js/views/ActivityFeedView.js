/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/activity-feed-template.html',
    'text!templates/noActivity-feed-template.html',
    'config',
    'collections/activity-feed-collection',
    'views/ActivityView',
    'services/StarMeUpServices',
    'utils/StellarFunctions',
    'services/SocialNetworkServices'
], function ($, _, Backbone, activityFeedTemplate, noActivityFeedTemplate, Config, ActivityFeedCollection, ActivityView, Smu, Global, snServices) {
    'use strict';

    Config.setUp();

    var ActivityFeedView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(activityFeedTemplate),
        activityFeedCollection : {},
        currentUser : {},
        connectedUser : {},
        container : '',
        orientation : 'DESC',
        home : 'HOME-ACTIVITY',
        homeFilter : false,
        profileFilter : 'ALL',
        connectedUserIsAdmin : false,
        activityFeedPage : 0,
        activitiesDisplayed : [],
        lastStarId : 0,
        selectedActivityId: null,
        additionalInfo : {},

        initialize : function(container,user, connectedUser, home, isAdmin, additionalInfo, selectedActivityId, orientation, homeFilter, profileFilter) {
            this.$main = this.$('#' + container);
            this.currentUser = user;
            this.connectedUser = connectedUser;
            this.connectedUserIsAdmin = isAdmin;
            this.container = container;
            this.activityFeedCollection = new ActivityFeedCollection();
            this.home = home;
            this.firstStarId = 0;
            this.selectedActivityId = selectedActivityId;
            this.additionalInfo = additionalInfo;

            if (orientation) {
                this.orientation = orientation;
            }

            if (homeFilter) {
                this.homeFilter = homeFilter;
            }

            if (profileFilter) {
                this.profileFilter = profileFilter;
            }

            var userId = 0;

            if(this.home=="OTHER-ACTIVITY"){
                userId = this.currentUser.id;
            }
            else if (this.home=="ME-ACTIVITY") {
                userId = this.connectedUser.id;
            }
            if(this.selectedActivityId != null){
                this.activityFeedCollection.selectedActivityInNotification(userId, selectedActivityId, this.profileFilter);
            } else {
            if (this.orientation == "DESC") {
                this.activityFeedCollection.allFillCollectionDesc(userId, this.firstStarId, this.profileFilter, this.activityFeedPage);
            } else {
                this.activityFeedCollection.allFillCollectionAsc(userId, this.firstStarId, this.profileFilter, this.activityFeedPage);
            }
            }
            this.listenTo(this.activityFeedCollection, 'ready', this.render);

            this.activityFeedPage = 0;
            this.activitiesDisplayed = [];
        },

        render : function() {
            if (!this.activityFeedCollection.isReady) {
                return;
            }
            if(this.selectedActivityId != null){
                var model = {
                    activities : this.activityFeedCollection.toJSON()
                };
                this.$main.html(this.template({model:{}}));
                this.renderActivity(model.activities[0]);

                $('#homeSection').hide();
                $('#profileSection').show();

            } else {
                if(this.activityFeedPage == 0)
                {
                    if (this.activityFeedCollection.length>0) {
                        var model = {
                            activities : this.activityFeedCollection.toJSON()
                        };

                        this.$main.html(this.template({model:{}}));
                        _.each(model.activities, function (activity) {
                            this.renderActivity(activity);
                        }, this);
                    } else {
                        this.template = _.template(noActivityFeedTemplate);
                        this.$main.html(this.template());
                    }

                    $('#homeSortSelect').on('change',_.bind(this.sortActivityFeed,this));
                    $('#profileFilterSelect').on('change',_.bind(this.profileFilterActivityFeed,this));
                    $('#profileSortSelect').on('change',_.bind(this.sortActivityFeed,this));

                    if(this.home == 'HOME-ACTIVITY'){
                        $('#homeSection').show();
                        $('#profileSection').hide();
                    }
                    else if(this.home == 'ME-ACTIVITY'){
                        $('#homeSection').hide();
                        $('#profileSection').show();
                    }
                    else{
                        $('#homeSection').hide();
                        $('#profileSection').show();
                    }

                    //Home Sorting
                    if(this.orientation == 'DESC'){
                        $('#homeSortSelect').val(0);
                    }
                    else{
                        $('#homeSortSelect').val(1);
                    }

                    //Profile Filter
                    if(this.profileFilter == 'ALL'){
                        $('#profileFilterSelect').val(0);
                    }
                    else if(this.profileFilter == 'SENT'){
                        $('#profileFilterSelect').val(1);
                    }
                    else{
                        $('#profileFilterSelect').val(2);
                    }
                    //Profile Sorting
                    if(this.orientation == 'DESC'){
                        $('#profileSortSelect').val(0);
                    }
                    else{
                        $('#profileSortSelect').val(1);
                    }

                }
                else
                {
                    var originalLastStarId = this.lastStarId;

                    var model = {
                            activities : this.activityFeedCollection.toJSON()
                        };

                        _.each(model.activities, function (activity) {
                            var activityDisplayed = false;
                            _.each(this.activitiesDisplayed, function(item, index){
                                if(activity.id == item){
                                    activityDisplayed = true;
                                    return;
                                }
                            }, this);

                            if(!activityDisplayed){
                                this.renderActivity(activity);
                            }
                        }, this);

                }

                snServices.initialize();
            }

            $(this.$main).i18n($.i18n.options);
        },

        renderActivity : function(activity){
            this.activitiesDisplayed.push(activity.id);

            if (this.firstStarId==0) {
                this.firstStarId = activity.id;
            }

            var activityView=new ActivityView(activity, this.currentUser, this.connectedUser,this.connectedUserIsAdmin,this.additionalInfo);
            this.$main.append(activityView.$el);
            activityView.render();
            activityView.on('userSelection', _.bind(function(selectedUser){this.trigger('userSelection', selectedUser);}, this));
        },

        sortActivityFeed : function(evt) {

            if(evt.target.selectedOptions[0] != null && evt.target.selectedOptions[0].value == "0"){
                this.orientation = "DESC";
            }

            if(evt.target.selectedOptions[0] != null && evt.target.selectedOptions[0].value == "1"){
                this.orientation = "ASC";
            }

            this.initialize(this.container,this.currentUser,this.connectedUser,this.home, this.connectedUser.isAdmin, this.orientation, this.homeFilter, this.profileFilter);
        },

        profileFilterActivityFeed : function(evt) {

            if(evt.target.selectedOptions[0] != null && evt.target.selectedOptions[0].value == "0"){
                this.profileFilter = 'ALL';
            }

            if(evt.target.selectedOptions[0] != null && evt.target.selectedOptions[0].value == "1"){
                this.profileFilter = 'SENT';
            }

            if(evt.target.selectedOptions[0] != null && evt.target.selectedOptions[0].value == "2"){
                this.profileFilter = 'RECEIVED';
            }

            this.initialize(this.container, this.currentUser, his.connectedUser, this.home, this.connectedUser.isAdmin, this.orientation, this.homeFilter, this.profileFilter);
        },

        loadNextPage :  function(){
            this.activityFeedPage++;
            var userId = 0;

            if(this.home=="OTHER-ACTIVITY"){
                userId = this.currentUser.id;
            }
            else if (this.home=="ME-ACTIVITY") {
                userId = this.connectedUser.id;
            }

            if (this.orientation == "DESC") {
                this.activityFeedCollection.allFillCollectionDesc(userId, this.firstStarId, this.profileFilter, this.activityFeedPage);
            } else {
                this.activityFeedCollection.allFillCollectionAsc(userId, this.firstStarId, this.profileFilter, this.activityFeedPage);
            }
        }


    });

    return ActivityFeedView;
});
