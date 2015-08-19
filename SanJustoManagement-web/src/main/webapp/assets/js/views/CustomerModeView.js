/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/customerMode-template.html',
	'config',
	'common',
    'services/StarMeUpServices'   
], function ($, _, Backbone, CustomerModeTemplate, Config, Common, smuServices) {
	'use strict';

    Config.setUp();

	var CustomerModeView = Backbone.View.extend({
	    el : '#app',
        className : 'row',
		template : _.template(CustomerModeTemplate),
		giveCustomerStarView : {},
		galaxyUsersView : {},
		currentUserReady : false,
		remainingStarsReady : false,
		maxStarsToGiveReady : false,
		currentUser : {},
		selectedUser : {},        
		additionalInfo : {},
		remainingStars : {},
		maxStarsToGive : {},

		initialize : function() {		
			this.$main = this.$('#mainView');
            this.$footer = this.$('#footerView');
		},

        clearUserData: function() {
            this.currentUserReady = false;
            this.remainingStarsReady = false;
            this.maxStarsToGiveReady = false;            
        },

		ready: function () {
            return this.currentUserReady && this.remainingStarsReady && this.maxStarsToGiveReady;
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

		render : function() {
			$('#mainView').html('');
			$('#footerView').html('');
			if (!this.ready()) {
                this.loadUserData();
                return;
            }
			var model = {					    			    
			};

			this.$main.html(this.template({
				model : model
			}));

			//Internationalization
            this.selectedLanguage = smuServices.getUserLanguage();
            smuServices.initializeHomeLanguage();                        
            
            //this.galaxyHome();
            var userSelectedId = smuServices.getCUSelected();
            if(userSelectedId){
                smuServices.locateUserById(_.bind(function(result, status, message){
                    if(status === 'OK'){                        
                        this.selectedUser = result;
                        this.giveCustomerStar();
                    } else {
                        Backbone.trigger('NO_RIGHTS');
                    }
                }, this), userSelectedId);
            } 
            //Count clicks on smuLogo to get out

            var numberOfClicks= [];
            var alertTime = 0;
            this.$main.find("#goHome").click(function(event){
                event.preventDefault();
                if(numberOfClicks.length < 5){
                   numberOfClicks.push(new Date().getTime());
                }else{                    
                    var diff = numberOfClicks[numberOfClicks.length -1] - numberOfClicks[0] - alertTime;                    
                    if(diff < 5000){
                        var beforeAlert = new Date().getTime();
                        alert("Good Bye!");                        
                        var afterAlert = new Date().getTime();
                        alertTime = afterAlert - beforeAlert;
                        Backbone.history.navigate('/logout',{trigger: true, replace: true});
                     }
                    numberOfClicks.shift();
                    numberOfClicks.push(new Date().getTime());                   
                }
            });           

			$('body').removeClass('bg-login');
            $('#footerView').show();
            $(this.$main).i18n($.i18n.options);
            $(this.$footer).i18n($.i18n.options);
		},

		renderGalaxyUsersView: function () {
            require(['views/CustomerModeView', 'views/GalaxyUsersView', 'backbone'], function (CustomerModeView, GalaxyUsersView, Backbone) {
                CustomerModeView.galaxyUsersView = new GalaxyUsersView('galaxySection');
                CustomerModeView.galaxyUsersView.on('userSelection', CustomerModeView.userSelected, CustomerModeView);
                CustomerModeView.galaxyUsersView.on('goHome', CustomerModeView.galaxyHome, CustomerModeView);
                CustomerModeView.galaxyUsersView.listenTo(Backbone,'NO_RIGHTS',CustomerModeView.errorFunc);
            });
        },

		renderGiveCustomerStarView : function() {
			require(['views/CustomerModeView', 'views/GiveCustomerStarView', 'backbone'], function (CustomerModeView, GiveCustomerStarView, Backbone) {
                CustomerModeView.giveCustomerStarView = new GiveCustomerStarView('giveStarSection', CustomerModeView.selectedUser, CustomerModeView.additionalInfo.values);
                CustomerModeView.giveCustomerStarView.on('starGivenEvent', CustomerModeView.starGiven, CustomerModeView);
                CustomerModeView.giveCustomerStarView.listenTo(Backbone,'NO_RIGHTS',CustomerModeView.errorFunc);
            });
		},        

        userSelected: function (user) {
            this.selectedUser = user;            
            this.giveCustomerStar();           
        },

        galaxyHome : function(event) {
        	if(event){
        	   	event.preventDefault();
        	}        	
        	$('#galaxySection').show();
        	$('#giveStarSection').hide();
        	this.renderGalaxyUsersView();
        	this.currentUser = null;     		
        },

        starGiven : function(event){
        	if (event){
        		event.preventDefault();
        	}
        	//this.galaxyHome();
            this.giveCustomerStar();
        },

        giveCustomerStar : function(event) {
        	if(event){
        	   	event.preventDefault();
        	}        	
        	$('#galaxySection').hide();
        	$('#giveStarSection').show();
        	this.renderGiveCustomerStarView();
        },

        errorFunc : function(){           
            smuServices.clearCookies();            
            Backbone.history.navigate('/login',{trigger: true, replace: true});
        }

	});

	return new CustomerModeView();
});