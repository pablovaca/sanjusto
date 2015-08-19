define([
    "underscore",
    "jquery",
    "backbone",
    "services/StarMeUpServices"
], function (_,$, Backbone, smuServices) {
    "use strict";
    var AppRouter = Backbone.Router.extend({
            routes: {
                "": "home",
                "features" : "features",
                "whatis" : "whatis",
                "customer" : "customerMode",
                "logout": "logout",
                "login(/:domain)": "login",
                "animation" : "animation",
                "*path": "path"
            },       

            logout: function(){
                smuServices.clearCookies();
                if(smuServices.getCurrentUserMode() === 'nm' || smuServices.getCurrentUserMode() === ''){     
                    require(['views/HomeView'], function (HomeView) {                            
                        HomeView.clearUserData();                            
                    });
                }
                if(smuServices.getCurrentUserMode() === 'cm'){
                    require(['views/CustomerModeView'], function (CustomerModeView) {
                        CustomerModeView.clearUserData();
                    });
                }
                Backbone.history.navigate('/login',{trigger: true, replace: true});                   
            },

            path: function(domain){
                var that = this;

                if(!smuServices.isLoggedIn()){
                    smuServices.setDomain(function(result, status, message) {
                        if(status == 'OK'){
                            that.home(domain);
                        }
                        else{
                            window.location.replace('pages/errors/404.html');
                        }
                    }, domain);
                }
                else
                {
                    Backbone.history.navigate('/',{trigger: true, replace: true});
                }
            },

            login: function(path){                
                smuServices.webNotify(true);
                if(!smuServices.isLoggedIn()){
                    require(['views/LoginView'], function (LoginView) {
                           LoginView.render(path);
                    });
                }
                else{
                    Backbone.history.navigate('/',{trigger: true, replace: true});
                }                
            },

            home: function(path){
                var that = this;
                if(!smuServices.isLoggedIn()){                      
                    if(path){
                        Backbone.history.navigate('/login',{trigger: true, replace: true});
                    }
                    else{
                        window.location.replace('landing.html');
                    }
                } else {
                    if(smuServices.getCurrentUserMode() === 'nm' || smuServices.getCurrentUserMode() === ''){
                        require(['views/HomeView'], function (HomeView) {                        
                            HomeView.render();
                        });
                    } 
                    if(smuServices.getCurrentUserMode() === 'cm'){
                        require(['views/CustomerModeView'], function (CustomerModeView) {
                            CustomerModeView.render();
                        });
                    }
                }
            },
            
            animation: function(path){
                var that = this;
                if(!smuServices.isLoggedIn()){                      
                    if(path){
                        Backbone.history.navigate('/login',{trigger: true, replace: true});
                    }
                    else{
                        window.location.replace('landing.html');
                    }
                } else {
                    require(['views/AnimationView', 'backbone', 'services/StarMeUpServices'], function (AnimationView, Backbone, smuServices) {
                        smuServices.initializeLoginLanguage();
                        $('body').css('display','none');
                        $('body').css('overflow','hidden');
                        var animationView = new AnimationView('app');
                    });
                }
            },

            customerMode : function (path) {
                var that = this;
                if(!smuServices.isLoggedIn()){                      
                    if(path){
                        Backbone.history.navigate('/login',{trigger: true, replace: true});
                    }
                    else{
                        window.location.replace('landing.html');
                    }
                } else {
                    if(smuServices.getCurrentUserMode() === 'nm' || smuServices.getCurrentUserMode() === ''){
                        require(['views/HomeView'], function (HomeView) {                        
                            HomeView.render();
                        });
                    } 
                    if(smuServices.getCurrentUserMode() === 'cm'){
                        require(['views/CustomerModeView'], function (CustomerModeView) {
                            CustomerModeView.render();
                        });
                    }
                }
            }
    });
    return AppRouter;
});
