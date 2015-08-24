define([
    "underscore",
    "jquery",
    "backbone",
    "services/APIServices"
], function (_,$, Backbone, api) {
    "use strict";
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "home",
            "logout": "logout",
            "login": "login"
        },

        logout: function(){
            api.clearCookies();
            Backbone.history.navigate('/login',{trigger: true, replace: true});
        },

        login: function(){
            if(!api.isLoggedIn()){
                require(['views/LoginView'], function (LoginView) {
                    LoginView.render();
                });
            }
            else{
                Backbone.history.navigate('/',{trigger: true, replace: true});
            }
        },

        home: function(){
            var that = this;
            if(!api.isLoggedIn()){
                Backbone.history.navigate('/login',{trigger: true, replace: true});
            } else {
                console.log("home view featured");
            }
        }
    });
    return AppRouter;
});
