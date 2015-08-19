/*global define*/
define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/home-template.html",
    "text!templates/customerMode-template.html",
    "text!templates/footer-template.html",
    "text!templates/errorModal-template.html",
    "text!templates/searchUsers-template.html",
    "text!templates/webCloseModal-template.html",
    "text!templates/eulaModal-template.html",
    "text!templates/customerModeModal-template.html",
    "config",
    "services/StarMeUpServices",
    "typeahead",
    "jquery.ui.totop"
], function ($, _, Backbone, homeTemplate, customerModeTemplate, footerTemplate, errorModalTemplate, searchUsersTemplate, webCloseTemplate, EulaModalTemplate, CustomerModeModalTemplate,Config, smuServices, typeahead) {

    "use strict";

    /**
     * Singleton Pattern
     */
    var instance = null;

    Config.setUp();

    require(["bootstrap-switch", "moment","hello"], function (bootstrapSwitch) {

    });

    var HomeView = Backbone.View.extend({
        el: '#app',
        className: 'row',
        template: _.template(homeTemplate),
        customerTemplate: _.template(customerModeTemplate),
        footer: _.template(footerTemplate),
        errorModalTemplate: _.template(errorModalTemplate),
        searchTemplate : _.template(searchUsersTemplate),
        webCloseModalTemplate : _.template(webCloseTemplate),
        eulaModalTemplate : _.template(EulaModalTemplate),
        cmModalTemplate : _.template(CustomerModeModalTemplate),
        starsCollection: {},
        givenStarPanelView: {},
        activityFeedView: {},
        leaderBoardView: {},
        suggestionView: {},
        profileInfoView: {},
        homeProfileInfoView: {},
        notificationView: {},
        summaryView: {},
        languageView : {},
        talentsView : {},
        coreStarsDetailView : {},
        rolesAdministrationView : {},
        analyticsView : {},
        currentUser: {},
        currentUserIsSuperAdmin : false,
        currentUserIsAdmin: false,
        activeDashBoard: false,
        activeReports : false,
        activeAnalytic : false,
        activeCustomerMode : false,
        typeaheadCallback: {},
        selectedUser: {},
        selectedLanguage : {},
        leaderBoardReportView: {},
        adminPanelView: {},
        dashBoardPanelView: {},
        reportsPanelView : {},
        SettingsView: {},
        remainingStars: 0,
        maxStarsToGive: 0,
        userSettingsView: {},
        currentLocation : 'meHome',
        activityIdSelected : null,
        additionalInfo: {},
        eulaText : {},

        // render flags
        currentUserReady: false,
        remainingStarsReady: false,
        maxStarsToGiveReady: false,
        stylesLoaded: false,
        stylesLoading : false,
        
        initialize: function () {

            //Setup HomeView as the Errors Handler
            smuServices.setUpErrorsHandler(this);         

            this.$main = this.$('#mainView');
            this.$footer = this.$('#footerView');
            $(document).ready(function() {
                $().UItoTop();        
            });
        },

        events: {
            "click .meProfile": "internalNavigation",
            "click .js-editProfile": "internalNavigation",
            "click .js-animation": "animation",
            "click .js-adminPanel": "internalNavigation",
            "click .js-rolesPanel": "internalNavigation",
            "click .js-dashBoard": "internalNavigation",
            "click .js-reports": "internalNavigation",
            "click .js-analytics" : "internalNavigation",
            "click .js-customerMode" : "switchToCM",
            "click .meHome": "internalNavigation",
            "click #goHome": "internalNavigation",
            "click .summaryTab" : "internalNavigation",
            "click .activityTab" : "internalNavigation",
            "click .leaderBoard": "internalNavigation",
            "typeahead:selected #generalSearch": "selectionInGeneralSearch"
        },

        ready: function () {
            return this.currentUserReady && this.remainingStarsReady && this.maxStarsToGiveReady;
        },

        clearUserData: function() {
            this.currentUserReady = false;
            this.remainingStarsReady = false;
            this.maxStarsToGiveReady = false;            
        },

        loadUserData: function () {
            /*
             * Dirty hack, the idea is to render the view *once*, first we need all the data
             * in place, then render, i'm using a counter, and as fast as i get a service response,
             * check if everything is loaded, if true, render.
             *
             * Hopefully this will remove a lot of glitches
             *
             * Marcos
             * */
             var that = this;
             var counter = 3;


            /*
             * Wraps the service response error handling, it's not needed to check the same
             * in every callback
             *
             * */
            var wrapper = function (result, status, message, callback, additionalInfo) {
                if (status === 'OK') {
                    if (result != null) {
                        /* Everything is fine, store local data */
                        if(additionalInfo != null){
                            callback(result, additionalInfo);
                        }
                        else{
                            callback(result);
                        }

                        /*
                         * Decrease the counter flag, if everything is loaded, render the view
                         * Log the process progress
                         * */
                        counter--;
                        var _msg_log = '>>> HomeView.loadUserData: counter flag: ' + counter;
                        if (counter === 0) {
                            _msg_log = '>>> HomeView.loadUserData: render';
                            if (smuServices.getDomain() !== 'starmeup') {
                                $('head').append('<link rel="stylesheet jquery" href="'+ smuServices.getDomain() + "/css/main.css" +'" type="text/css" />');
                            }
                            that.render();
                        }
                    }
                }
                else if (message === 'NO_RIGHTS' || message === 'Invalid Credentials') {
                    /* Logout and redirect */
                    smuServices.logout();
                    Backbone.history.navigate('/login', {trigger: true, replace: true});
                }
                else {
                    /* ToDo: Check what to do in this case */
                    console.error('>>> HomeView.loadUserData: ' + message);
                }
            }

            /* Load user data */
            smuServices.getUserByToken(function (result, status, message, additionalInfo) {
                wrapper(result, status, message, function (result, additionalInfo) {
                    that.currentUser = result;
                    that.currentUser.profileImageUrl = smuServices.getProfileImage(result.profileImageId)
                    that.currentUserIsSuperAdmin = smuServices.userHasRights('SuperAdmin');
                    that.currentUserIsAdmin = smuServices.userHasRights('AdminPanel');
                    that.activeDashBoard = smuServices.userHasRights('DashBoard');
                    that.activeReports = smuServices.userHasRights('Reports');
                    that.activeAnalytic = smuServices.userHasRights('Analytic');
                    that.activeCustomerMode = smuServices.userHasRights('CustomerMode');

                    that.currentUserReady = true;
                    that.additionalInfo = additionalInfo;             
                }, additionalInfo);               
            });

            /* Load remaining stars */
            smuServices.getRemainingStars(function (result, status, message) {
                wrapper(result, status, message, function (result) {
                    that.remainingStars = result;
                    that.remainingStarsReady = true;
                });
            });

            /* get limit */
            smuServices.getMaxStarsToGive(function (result, status, message) {
                wrapper(result, status, message, function (result) {
                    that.maxStarsToGive = result;
                    that.maxStarsToGiveReady = true;
                });
            });

        },

        render: function () {
            $('#mainView').html('');
            $('#footerView').html('');

            /*
            * If we are not ready to render, load the user data, then render.
            * */
            if (!this.ready()) {
                this.loadUserData();
                return;
            }
            
            //Talents Tree Initialization

            if (smuServices.isTalentModuleEnabled()) {
                smuServices.initializeTalentTree();
            }
            
            //Internationalization
            this.selectedLanguage = smuServices.getUserLanguage();
            smuServices.initializeHomeLanguage();
            
            /*
            * Old render function
            * */
            smuServices.intializeServerNotifications(_.bind(this.serverNotification, this));

            var model = {
                currentUserIsAdmin: this.currentUserIsAdmin,
                activeDashBoard: this.activeDashBoard,
                activeReports : this.activeReports,
                activeAnalytic : this.activeAnalytic,
                activeCustomerMode : this.activeCustomerMode,
                privateMode : this.additionalInfo.organization.privateModeEnabled,
                webCloseNot : this.additionalInfo.organization.messageWebOff
            };
            this.$footer.html(this.footer());
            this.$main.html(this.template({
                model: model
            }));
            
            this.renderGivenStarPanel();
            this.renderActivityFeedView();
            this.renderLeaderBoardView();
            this.renderSuggestionView();
            this.renderHomeProfileInfoView();
            this.renderNotificationListView();
            this.renderLanguageView();
            
            //General Search initialization
            $('#generalSearch .typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 2
                },
                {
                    name: 'users',
                    source: _.bind(this.searchUsers, this),
                    engine: _,
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                            $.t("translation:home.giveStarModal.unableFind"), 
                            '</div>'
                        ].join('\n'),
                        suggestion : _.bind(function(data){
                            var image = smuServices.getProfileImage(data.profileImageId);
                            var model = {
                                image : image,
                                firstName : data.firstName,
                                lastName : data.lastName,
                                email : data.email
                            };      

                            return this.searchTemplate({model:model});                                  
                          }, this)
                    }
                });
            $('#generalSearch').on('blur', _.bind(this.generalSearchBlur, this));

            //General error modal
            var errorModalModel = {
                prefix: 'generalError'
            };
            this.$main.append(this.errorModalTemplate({
                model: errorModalModel
            }));

            //webCloseModal
            var $modal = $('#webCloseModal');
            var webCloseModel = {
            };
            $modal.html(this.webCloseModalTemplate({
                model: webCloseModel
            }));
            if(smuServices.webNotify() && this.additionalInfo.organization.messageWebOff){
                $modal.find('#webClose-modal').modal('show');
                smuServices.webNotify(false);
            }

            //EULA
            if(!this.additionalInfo.eulaAgreement){
                smuServices.getEulaText(_.bind(function(result, status, message){
                    if (status === 'OK') {
                        this.eulaText = result;
                        this.rendeEulaMessage();         
                    }
                }, this));                       
            }


            //Fix scroll bar when modal is closed and prevent body sliding
            _.beautifyModal('#generalErrorModal');

            //Activity Feed Paging
            $(window).scroll(_.bind(function () {
                var lastLimit = $(document).height() - $(window).height();
                var firstLimit = lastLimit - lastLimit / ((this.activityFeedView.activityFeedPage + 1) * 2);


                if (($(window).scrollTop() > firstLimit && $(window).scrollTop() < (firstLimit + 100)) || $(window).scrollTop() === lastLimit) {
                    if ($('#newsFeed').is(":visible")) {
                        this.activityFeedView.loadNextPage();
                    }
                }
            }, this));

            $('body').removeClass('bg-login');
            $('#footerView').show();
            $(this.$main).i18n($.i18n.options);
            $(this.$footer).i18n($.i18n.options);
        },

        refreshHomeView : function(){
            this.clearUserData();
            this.render();
        },

        error: function (message) {
            console.log(message);
            if ($('#generalErrorModal').data('bs.modal') == null || !$('#generalErrorModal').data('bs.modal').isShown) {
                $('#generalErrorModal').modal('show');
            }
        },

        animation: function (event) {
            window.open("#animation", '_blank');
        },

        switchToCM : function (event){
            event.preventDefault();
            var $customerMode = $('#switchToCmModal');
            var userSelected = {};
            var model = {};      
            $customerMode.html(this.cmModalTemplate({
                model : model
            }));
            $('#customerUser').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 2
                },
                {
                    name: 'users',
                    source: _.bind(this.searchUsers, this),
                    engine: _,
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                            $.t("translation:home.giveStarModal.unableFind"), 
                            '</div>'
                        ].join('\n'),
                        suggestion : _.bind(function(data){
                            var image = smuServices.getProfileImage(data.profileImageId);
                            var model = {
                                image : image,
                                firstName : data.firstName,
                                lastName : data.lastName,
                                email : data.email
                            };      

                            return this.searchTemplate({model:model});                                  
                          }, this)
                    }
            });            
            $customerMode.find('#customerMode-Modal').modal({backdrop: 'static'});       
            $customerMode.find('#customerMode-Modal').modal('show');
            $customerMode.find('#customerUser').on('typeahead:selected',_.bind(function(jqobj, item, srcname){
                var image = smuServices.getProfileImage(item.profileImageId); 
                userSelected = item;          
              
                $customerMode.find('#modalSelectedUserImage').attr('src', image);
                $customerMode.find('#modalSelectedUserNameLabel').text(item.firstName + ' ' + item.lastName);
                $customerMode.find('#modalSelectedUserSeniorityLabel').text(item.email);
                $customerMode.find('#selectedUserSection').show();
                $customerMode.find('#giveStarModalErrorMessage').hide();
                $customerMode.find('#usertoGiveStarSection').hide();
                $customerMode.find('.js-accept').removeClass("disabled");  
            },this));
            $customerMode.find('.js-accept').on('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                if(userSelected){
                    smuServices.switchToCustomerMode(userSelected.id);
                } else {
                    console.log("U have to select one user!")
                }
            });
        },

        rendeEulaMessage : function(){
            var $eula = $('#eulaModal');
            var accept = false;
            var eulaModel = {
                text : this.eulaText
            }
            $eula.html(this.eulaModalTemplate({
                model : eulaModel
            }));
            $eula.find('#eula-Modal').modal({backdrop: 'static'});       
            $eula.find('#eula-Modal').modal('show');            
            $eula.find('#eulaText').scroll(function(){
                if($eula.find('#eulaText').scrollTop() + $eula.find('#eulaText').height() 
                   === $eula.find('#eulaText')[0].scrollHeight){                    
                    $eula.find('#chkAgree')[0].disabled = false;                
                }           
            });
            $eula.find('#chkAgree').change(_.bind(function(){
                if($eula.find('#chkAgree')[0].checked){
                    $eula.find('.js-accept').removeClass("disabled");
                } else {
                    $eula.find('.js-accept').addClass("disabled");
                }                
            }, this));
            $eula.find('.js-accept').click(_.bind(function(e){
                e.preventDefault();
                if($eula.find('#chkAgree')[0].checked){                
                    smuServices.setTosRead(_.bind(function(result, status, message){
                        if(status === 'OK'){
                            accept = true;
                            $eula.find('#eula-Modal').modal('hide');    
                        }
                    }, this));
                }
            }, this));
            
            $eula.find('#eula-Modal').on('hidden.bs.modal', _.bind(function(){
                if(!accept){
                    Backbone.history.navigate('/logout',{trigger: true, replace: true});
                }
            },this));
        },

        internalNavigation: function (event) {
            var cssClass = $(event.target).attr('class');

            $('.bg-search').show();

            smuServices.stopStarCountNotifications();
            if (cssClass === 'meProfile') {
                this.meProfile(event);
                this.activityIdSelected = null;
                this.currentLocation = 'meProfile';
                return;
            };
            if (cssClass === 'js-editProfile') {
                this.editProfile(event);
                this.activityIdSelected = null;
                this.currentLocation = 'editProfile';
                return;
            };
            if (cssClass === 'js-adminPanel') {
                $('.bg-search').hide();
                this.activityIdSelected = null;
                this.currentLocation = 'adminPanel';
                this.adminPanel(event);
                return;
            };
            if (cssClass === 'js-rolesPanel') {
                $('.bg-search').hide();
                this.activityIdSelected = null;
                this.currentLocation = 'rolesPanel';
                this.rolesPanel(event);
                return;
            };
            if (cssClass === 'js-dashBoard') {
                this.activityIdSelected = null;
                this.currentLocation = 'dashBoard';
                this.dashBoard(event);
                return;
            };
            if (cssClass === 'js-reports') {
                $('.bg-search').hide();
                this.activityIdSelected = null;
                this.currentLocation = 'reports';
                this.reports(event);
                return;
            };
            if (cssClass === 'js-analytics') {
                $('.bg-search').hide();
                this.activityIdSelected = null;
                this.currentLocation = 'analytics';
                this.analytics(event);
                return;
            };
            if (cssClass === 'meHome') {
                this.currentLocation = 'meHome';
                this.activityIdSelected = null;
                this.meHome(event);
                return;
            };
            if ($(event.target).attr('id') === 'goHome') {
                this.meHome(event);
                return;
            };
            if (cssClass === 'leaderBoard') {
                this.activityIdSelected = null;
                this.currentLocation = 'leaderBoard';
                this.leaderBoard(event);
                //Backbone.history.navigate('/leader',{trigger: true, replace: false});
                return;
            };
            if (cssClass === 'activityTab') {
                var tabNav = 'activityTab';
                this.activityIdSelected = null;
                this.profileNavTab(tabNav);
                return;
            };
            if (cssClass === 'summaryTab') {
                var tabNav = 'summaryTab';
                this.activityIdSelected = null;
                this.profileNavTab(tabNav);
                return;
            };
        },

        renderGivenStarPanel: function () {
            require(['views/HomeView', 'views/GiveStarPanelView', 'backbone'], function (HomeView, GiveStarView, Backbone) {
                HomeView.givenStarPanelView = new GiveStarView('giveStarPanel', HomeView.currentUser, false, HomeView.remainingStars, HomeView.additionalInfo.values);
                HomeView.givenStarPanelView.on('starGivenEvent', HomeView.starGiven, HomeView);
                HomeView.givenStarPanelView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.givenStarPanelView.render();
            });
        },

        starGiven: function () {
            this.remainingStarsReady = false;
            this.maxStarsToGiveReady = false;
            
            smuServices.getRemainingStars(_.bind(this.fillRemainingStarsWhenStarIsGiven, this));
            smuServices.getMaxStarsToGive(_.bind(this.fillMaxStarsToGiveWhenStarIsGiven, this));
        },

        changeMaxStar : function (){
             this.maxStarsToGiveReady = true;
             smuServices.getMaxStarsToGive(_.bind(this.fillMaxStarsToGiveWhenStarIsGiven, this));
        },

        fillRemainingStarsWhenStarIsGiven: function (result, status, message) {
            if (status === "OK") {
                if (result != null) {
                    this.remainingStars = result;
                    this.remainingStarsReady = true;
                    this.renderWhenStarIsGiven();
                }
            } else if (message == "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        fillMaxStarsToGiveWhenStarIsGiven: function (result, status, message) {
            if (status === "OK") {
                if (result != null) {
                    this.maxStarsToGive = result;
                    this.maxStarsToGiveReady = true;
                    this.renderWhenStarIsGiven();
                }
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        renderWhenStarIsGiven: function () {
            if (!(this.currentUserReady && this.remainingStarsReady && this.maxStarsToGiveReady)) {
                return;
            }

            this.renderLeaderBoardView();
            this.renderSuggestionView();
            this.renderHomeProfileInfoView();
            this.renderActivityFeedView();
            this.renderNotificationListView();
            this.renderGivenStarPanel();
        },

        renderActivityFeedView: function () {
            require(['views/HomeView', 'views/ActivityFeedView', 'backbone'], function (HomeView, ActivityFeedView, Backbone) {
                HomeView.activityFeedView = new ActivityFeedView('newsFeed', HomeView.currentUser, HomeView.currentUser, "HOME-ACTIVITY", HomeView.currentUserIsAdmin,HomeView.additionalInfo);
                HomeView.activityFeedView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.activityFeedView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);                
            });
        },

        renderMeSelectedActivityFeedView: function(){
            require(['views/HomeView', 'views/ActivityFeedView', 'backbone'], function (HomeView, ActivityFeedView, Backbone) {
                HomeView.activityFeedView = new ActivityFeedView('newsFeed', HomeView.currentUser, HomeView.currentUser, "ME-ACTIVITY", HomeView.currentUserIsAdmin,HomeView.additionalInfo, HomeView.activityIdSelected);
                HomeView.activityFeedView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.activityFeedView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);                
            });
        },

        renderMeActivityFeedView: function () {
            require(['views/HomeView', 'views/ActivityFeedView', 'backbone'], function (HomeView, ActivityFeedView, Backbone) {
                HomeView.activityFeedView = new ActivityFeedView('newsFeed', HomeView.currentUser, HomeView.currentUser, "ME-ACTIVITY", HomeView.currentUserIsAdmin,HomeView.additionalInfo);
                HomeView.activityFeedView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.activityFeedView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.activityFeedView.render();
            });
        },

        renderOtherActivityFeedView: function (user) {
            require(['views/HomeView', 'views/ActivityFeedView', 'backbone'], function (HomeView, ActivityFeedView, Backbone) {
                HomeView.activityFeedView = new ActivityFeedView('newsFeed', user, HomeView.currentUser, "OTHER-ACTIVITY", HomeView.currentUserIsAdmin,HomeView.additionalInfo);
                HomeView.activityFeedView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.activityFeedView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.activityFeedView.render();
            });
        },

        renderLeaderBoardView: function () {
            require(['views/HomeView', 'views/LeaderBoardView', 'backbone'], function (HomeView, LeaderBoardView, Backbone) {
                HomeView.leaderBoardView = new LeaderBoardView('leaderBoard');
                HomeView.leaderBoardView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.leaderBoardView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.leaderBoardView.render();
            });
        },

        renderSuggestionView: function () {
            require(['views/HomeView', 'views/SuggestionView', 'backbone'], function (HomeView, SuggestionView, Backbone){
                HomeView.suggestionView = new SuggestionView('suggestion', HomeView.currentUser, HomeView.remainingStars, HomeView.additionalInfo.values);
                HomeView.suggestionView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.suggestionView.on('starGiven', HomeView.starGivenFromSuggestions, HomeView)
                HomeView.suggestionView.listenTo(Backbone, 'NO_RIGHTS', HomeView.errorFunc);
            });
        },

        renderMeProfileInfoView: function () {
            require(['views/HomeView', 'views/ProfileInfoView', 'backbone'], function (HomeView, ProfileInfoView, Backbone) {
                HomeView.profileInfoView = new ProfileInfoView('leftPanel', HomeView.currentUser, HomeView.currentUser, HomeView.remainingStars, HomeView.additionalInfo.values);
                HomeView.profileInfoView.on('profileImageEvent', HomeView.profileImageChanged, HomeView);
                HomeView.profileInfoView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderHomeProfileInfoView: function () {
            this.renderMeProfileInfoView();
        },

        renderOtherProfileInfoView: function (user) {
            require(['views/HomeView', 'views/ProfileInfoView', 'backbone'], function (HomeView, ProfileInfoView, Backbone) {
                HomeView.profileInfoView = new ProfileInfoView('leftPanel', user, HomeView.currentUser, HomeView.remainingStars, HomeView.additionalInfo.values);
                HomeView.profileInfoView.on('profileImageEvent', HomeView.profileImageChanged, HomeView);
                HomeView.profileInfoView.on('starGiven', HomeView.starGivenFromProfileView, HomeView);
                HomeView.profileInfoView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);                
            });
        },

        renderNotificationListView: function () {
            require(['views/HomeView', 'views/NotificationListView', 'backbone'], function (HomeView, NotificationListView, Backbone) {
                if (HomeView.notificationView.container!=null && HomeView.notificationView.container!=="undefined") {
                    HomeView.notificationView.initialize('notifications');
                } else {
                    HomeView.notificationView = new NotificationListView('notifications');
                }
                HomeView.notificationView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.notificationView.on('oneNotificationRemove',HomeView.renderNotificationListView, HomeView);
                HomeView.notificationView.on('activitySelected', HomeView.activitySelectedInNotifications, HomeView);
            });
        },

        renderLeaderBoardReport: function () {
            require(['views/HomeView', 'views/LeaderBoardReportView', 'backbone'], function (HomeView, LeaderBoardReportView, Backbone) {
                HomeView.leaderBoardReportView = new LeaderBoardReportView('leaderBoardFilter', 'leaderBoardContent', HomeView.additionalInfo.values);
                HomeView.leaderBoardReportView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.leaderBoardReportView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.leaderBoardReportView.render();
            });
        },

        renderEditProfileView: function () {
            require(['services/SocialNetworkServices',
                'hello'], function (snServices, hello) {
                snServices.initialize();
            });

            require(['views/HomeView', 'views/UserSettingsView', 'backbone'], function (HomeView, UserSettingsView, Backbone) {
                HomeView.userSettingsView = new UserSettingsView('editProfilePanel', HomeView.currentUser, HomeView.additionalInfo.emailSettingEnabled);
                HomeView.userSettingsView.on('profileImageEvent', HomeView.profileImageChanged, HomeView);
                HomeView.userSettingsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
                HomeView.userSettingsView.render();
            });
        },

        renderAdminPanelView: function () {
            require(['views/HomeView', 'views/AdminPanelView', 'backbone'], function (HomeView, AdminPanelView, Backbone) {
                HomeView.adminPanelView = new AdminPanelView('adminPanelView', HomeView.maxStarsToGive, HomeView.additionalInfo.organization.id, HomeView.additionalInfo.organization.privateModeEnabled, HomeView.additionalInfo.emailSettingEnabled);
                HomeView.adminPanelView.on('changeMaxStarToGive', HomeView.changeMaxStar, HomeView);
                HomeView.adminPanelView.on('privateMode', HomeView.refreshHomeView, HomeView);
                HomeView.adminPanelView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderRolesPanelView : function () {
            require(['views/HomeView', 'views/RolesAdministrationView', 'backbone'], function (HomeView, RolesPanelView, Backbone) {
                HomeView.rolesAdministrationView = new RolesPanelView('rolesAdministrationPanel', 'rolesFilters', HomeView.currentUser, HomeView.currentUserIsSuperAdmin);                
                HomeView.rolesAdministrationView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);               
            });
        },

        renderDashBoardPanelView: function () {         
            require(['views/HomeView', 'views/DashBoardPanelView', 'backbone'], function (HomeView, DashBoardPanelView, Backbone) {
                HomeView.dashBoardPanelView = new DashBoardPanelView('dashBoardPanelView','dashBoardFilterPanelView');
                HomeView.dashBoardPanelView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.dashBoardPanelView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderReportsPanelView : function (){
             require(['views/HomeView', 'views/ReportsPanelView', 'backbone'], function (HomeView, ReportsPanelView, Backbone) {
                HomeView.reportsPanelView = new ReportsPanelView('reportsPanelView','reportsFilterPanelView', HomeView.additionalInfo.values);
                HomeView.reportsPanelView.on('userSelection', HomeView.selectionInLeaderBoard, HomeView);
                HomeView.reportsPanelView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderAnalitycsView : function (){
             require(['views/HomeView', 'views/AnalyticsView', 'backbone'], function (HomeView, AnalyticsView, Backbone) {
                HomeView.analyticsView = new AnalyticsView('analyticsView', 'analyticsFilterView');               
                HomeView.analyticsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderLanguageView : function (){ 
            require(['views/HomeView', 'views/LanguageView', 'backbone'], function (HomeView, LanguageView, Backbone) {
                HomeView.languageView = new LanguageView('languageList', HomeView.selectedLanguage);
                HomeView.languageView.on('languageChanged', HomeView.refreshHomeView, HomeView);
                HomeView.languageView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderMyTalentsView : function (currentUser){
            require(['views/HomeView', 'views/TalentsView', 'backbone'], function (HomeView, TalentsView, Backbone) {
                HomeView.talentsView = new TalentsView('talentContainer', currentUser, true, HomeView.starsGiven, HomeView.maxStarsToGive);                               
                HomeView.talentsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderOtherTalentsView : function (currentUser){
            require(['views/HomeView', 'views/TalentsView', 'backbone'], function (HomeView, TalentsView, Backbone) {
                HomeView.talentsView = new TalentsView('talentContainer', currentUser, false, HomeView.starsGiven, HomeView.maxStarsToGive);               
                HomeView.talentsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        renderCoreStarsDetailView : function(currentUser){
            require(['views/HomeView', 'views/CoreStarsDetailView', 'backbone'], function (HomeView, CoreStarsDetailView, Backbone) {
                HomeView.coreStarsDetailView = new CoreStarsDetailView('coreStarsDetail', currentUser, true, HomeView.additionalInfo.values);                              
                HomeView.coreStarsDetailView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        starGivenFromProfileView: function () {
            this.remainingStarsReady = false;
            this.maxStarsToGiveReady = false;

            smuServices.getRemainingStars(_.bind(this.fillRemainingStarsWhenStarIsGivenInOtherProfile, this));
            smuServices.getMaxStarsToGive(_.bind(this.fillMaxStarsToGiveWhenStarIsGivenInOtherProfile, this));            
        },
        
        fillRemainingStarsWhenStarIsGivenInOtherProfile: function (result, status, message) {
            if (status === "OK") {
                if (result != null) {
                    this.remainingStars = result;
                    this.remainingStarsReady = true;
                    this.renderCurrentView();
                }
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        fillMaxStarsToGiveWhenStarIsGivenInOtherProfile: function (result, status, message) {
            if (status === "OK") {
                if (result != null) {
                    this.maxStarsToGive = result;
                    this.maxStarsToGiveReady = true;
                    this.renderCurrentView();
                }
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        starGivenFromSuggestions : function (){
            this.remainingStarsReady = false;
            this.maxStarsToGiveReady = false;

            smuServices.getRemainingStars(_.bind(this.fillRemainingStarsWhenStarIsGivenInOtherProfile, this));
            smuServices.getMaxStarsToGive(_.bind(this.fillMaxStarsToGiveWhenStarIsGivenInOtherProfile, this));       
        },

        renderCurrentView : function(){
            if(this.currentLocation === 'meProfile'){
                this.meProfile();
            } else if(this.currentLocation === 'meHome'){
                this.meHome();
            } else if(this.currentLocation === 'otherProfile'){
                this.otherProfile(this.selectedUser);
            }           
        },

        profileImageChanged: function (newImageId) {
            this.currentUser.profileImageId = newImageId;
            this.currentUser.profileImageUrl = smuServices.getProfileImage(newImageId);
            this.renderHomeProfileInfoView();
            this.renderLeaderBoardView();
            this.renderSuggestionView();
            this.renderActivityFeedView();
            this.renderLeaderBoardReport();
            this.renderEditProfileView();
        },

        meProfile: function (evt) {
            if(evt){
                evt.preventDefault();
            }
            $('#leaderBoardFilter').html('');
            $('#leaderBoardContent').html('');
            $('#leftPanel').removeClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#rightPanel').removeClass("hide");
            $('#commentStarPanelContainer').removeClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#coreStarsDetail').removeClass('hide');
            $('#talentContainer').removeClass('hide');
            $('#centerPanel').removeClass("col-lg-9");
            $('#centerPanel').removeClass("col-lg-12");
            $('#centerPanel').addClass("col-lg-6");
            $("#starPanelContainer").addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#adminContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#rolesContainer').addClass("hide");
            $(".meProfile").parent().addClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $(".js-search-people").removeClass("hide");
            $('#searchSection').removeClass("hide");
            $('#searchSection').css('display', 'block');
            $('#generalSearchInput').val('');
            if(this.activityIdSelected != null){
                this.renderMeSelectedActivityFeedView();
            } else {
                this.renderMeActivityFeedView();
            }
            this.renderSuggestionView();
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderMeProfileInfoView();
                this.renderLeaderBoardView();
                this.renderCoreStarsDetailView(this.currentUser);
                if (smuServices.isTalentModuleEnabled()){
                    this.renderMyTalentsView(this.currentUser);
                }
            }
            this.selectedUser = null;
        },

        meHome: function (evt) {
            if(evt){
                evt.preventDefault();
            }
            $('#leaderBoardFilter').html('');
            $('#leaderBoardContent').html('');
            $('#leftPanel').removeClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#rightPanel').removeClass("hide");            
            $('#commentStarPanelContainer').removeClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-9");
            $('#centerPanel').removeClass("col-lg-12");
            $('#centerPanel').addClass("col-lg-6");
            $("#starPanelContainer").removeClass("hide");
            $('#adminContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            $('#talentContainer').addClass('hide');
            $('#rolesContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().addClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $(".js-search-people").removeClass("hide");
            $("#newsFeed").removeClass("hide");
            this.renderActivityFeedView();
            this.renderHomeProfileInfoView();
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderLeaderBoardView();
            }
            this.renderSuggestionView();
            this.renderGivenStarPanel();  
            $('#searchSection').removeClass("hide");
            $('#generalSearchInput').val('');
            this.selectedUser = null;
        },

        leaderBoard: function (evt) {
            if(evt){
                evt.preventDefault();
            }
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $('#leftPanel').removeClass("hide");
            $(".leaderBoard").parent().addClass("active");
            $('#rightPanel').addClass("hide");
            $('#starPanelContainer').addClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-12");
            $('#centerPanel').addClass("col-lg-9");
            $('#rightBottomContainer').removeClass("hide");
            $('#adminContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            $('#giveStarPanel').html('');
            $('#newsFeed').html('');
            $('#leaderBoard').html('');
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').removeClass("hide");
            $(".js-search-people").removeClass("hide");
            this.renderHomeProfileInfoView();
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderLeaderBoardReport();
            }
            $('#generalSearchInput').val('');
            this.selectedUser = null;
        },

        reports: function (evt) {
            if(evt){
                evt.preventDefault();
            }
            $("#reportsContainer").removeClass("hide");
            $('#rightPanel').addClass("hide");
            $('#leftPanel').addClass("hide");
            $('#starPanelContainer').addClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-9");
            $('#centerPanel').addClass("col-lg-12");
            $('#rightBottomContainer').addClass("hide");
            $('#adminContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            $('#rolesContainer').addClass('hide');
            $('#giveStarPanel').html('');
            $('#newsFeed').html('');
            $('#leaderBoardFilter').html('');
            $('#leaderBoardContent').html('');
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').addClass("hide");
            this.renderReportsPanelView();
            this.selectedUser = null;
        }, 

        otherProfile: function (user) {
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $('#rightPanel').removeClass("hide");
            $('#leftPanel').removeClass("hide");
            $('#talentContainer').removeClass("hide");
            $('#commentStarPanelContainer').removeClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-9");
            $('#centerPanel').removeClass("col-lg-12");
            $('#coreStarsDetail').removeClass('hide');
            $('#centerPanel').addClass("col-lg-6");
            $('#rolesContainer').addClass('hide');
            $('#rightBottomContainer').addClass("hide");         
            $('#adminContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#leaderBoardFilter').html('');
            $('#leaderBoardContent').html('');
            $("#starPanelContainer").addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active"); 
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').removeClass("hide");
            $(".js-search-people").removeClass("hide");
            $('#searchSection').css('display', 'block');
            this.renderOtherActivityFeedView(user);
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderLeaderBoardView(user);
                this.renderCoreStarsDetailView(user);
                if (smuServices.isTalentModuleEnabled()){
                    this.renderOtherTalentsView(user);
                }
            }
            this.renderOtherProfileInfoView(user);
            this.renderSuggestionView(user);
        },

        editProfile: function (evt) {
            $('#rightPanel').removeClass("hide");
            $('#leftPanel').addClass("hide");
            $('#adminContainer').addClass("hide");
            $('#rolesContainer').addClass('hide');
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $("#starPanelContainer").addClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").removeClass("hide");           
            $('#searchSection').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            this.renderEditProfileView();
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderLeaderBoardView();
            }
            this.renderSuggestionView();
        },

        adminPanel: function (evt) {
            $('#rightPanel').addClass("hide");
            $('#leftPanel').addClass("hide");
            $('#adminContainer').removeClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $('#rolesContainer').addClass('hide');
            $("#starPanelContainer").addClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-9");
            $('#centerPanel').addClass("col-lg-12");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            this.renderAdminPanelView();
        },

        rolesPanel: function (evt) {
            $('#rightPanel').addClass("hide");
            $('#leftPanel').addClass("hide");
            $('#adminContainer').addClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $("#starPanelContainer").addClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-9");
            $('#rolesContainer').removeClass('hide');
            $('#centerPanel').addClass("col-lg-12");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            this.renderRolesPanelView();
        },


        analytics: function (evt) {
            $('#rightPanel').addClass("hide");
            $('#leftPanel').addClass("hide");
            $('#analyticsContainer').removeClass("hide");
            $('#adminContainer').addClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $("#starPanelContainer").addClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#dashBoardContainer').addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-9");
            $('#rolesContainer').addClass('hide');
            $('#centerPanel').addClass("col-lg-12");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $("#editProfilePanel").addClass("hide");
            $('#searchSection').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            this.renderAnalitycsView();
        },

        dashBoard: function (evt) {
            $('#rightPanel').addClass("hide");           
            $('#leftPanel').removeClass("hide");
            $('#starRemaining').addClass("hide");
            $('.info-user').addClass("hide");
            $('#dashBoardContainer').removeClass("hide");
            $('#commentStarPanelContainer').addClass("hide");
            $("#starPanelContainer").addClass("hide");
            $('#reportsContainer').addClass("hide");
            $('#rightBottomContainer').addClass("hide");
            $('#rolesContainer').addClass('hide');
            $('#adminContainer').addClass("hide");
            $('#analyticsContainer').addClass("hide");
            $("#editProfilePanel").addClass("hide");
            $('#talentContainer').addClass("hide");
            $('#centerPanel').removeClass("hide");
            $('#centerPanel').removeClass("col-lg-6");
            $('#centerPanel').removeClass("col-lg-12");
            $('#centerPanel').addClass("col-lg-9");
            $(".meProfile").parent().removeClass("active");
            $(".meHome").parent().removeClass("active");
            $(".leaderBoard").parent().removeClass("active");
            $('#searchSection').addClass("hide");
            $('#coreStarsDetail').addClass('hide');
            this.selectedUser = null;
            this.renderDashBoardPanelView();
            if (!this.additionalInfo.organization.privateModeEnabled) {
                this.renderMeProfileInfoView();
            }
        },

        searchUsers: function (query, callback) {
            this.typeaheadCallback = callback;
            smuServices.locateUsers(_.bind(this.usersAreLocated, this), '%' + query + '%');
        },

        usersAreLocated: function (result, status, message) {
            if (status === "OK") {
                this.typeaheadCallback(result);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        selectionInGeneralSearch: function (jqobj, item, srcname) {
            this.selectedUser = item;
            this.otherProfile(item);
            this.currentLocation = 'otherProfile';
        },

        generalSearchBlur: function () {
            if (this.selectedUser != null && this.selectedUser.nickname !== $('#generalSearch').val()) {
                $('#generalSearch').val('');
                this.selectedUser = null;
            }
        },

        selectionInLeaderBoard: function (user) {
            this.selectedUser = user;
            if(this.selectedUser.id === this.currentUser.id){
                if (!this.additionalInfo.organization.privateModeEnabled) {
                    this.meProfile();
                } else {
                    this.meHome();
                }
            } else {
            this.otherProfile(user);
            }
            this.currentLocation = 'otherProfile';
        },

        activitySelectedInNotifications: function (activityId){
            this.activityIdSelected = activityId;
            this.renderNotificationListView();
            this.meProfile();
        },

        serverNotification: function (notifications) {
            if (notifications != null && notifications.starGiven === "true") {
                this.lastRefreshByServerNotifications = parseInt(notifications.lastStarGiven);
                this.renderLeaderBoardView();
                this.renderSuggestionView();
                this.renderNotificationListView();
                this.renderActivityFeedView();
            }
        },

        errorFunc : function(){
            smuServices.clearCookies();            
            Backbone.history.navigate('/login',{trigger: true, replace: true});
        }
    });

    HomeView.getInstance = function () {
        if (instance === null) {
            instance = new HomeView();
        }
        return instance;
    }

    return HomeView.getInstance();
});
