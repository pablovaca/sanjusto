/*global define*/
define([ 
'jquery', 
'underscore', 
'backbone',
'text!templates/login-template.html',
'config', 
'common',
'services/APIServices'
],
function($, _, Backbone, loginTemplate, Config, Common, api) {
    'use strict';
    var instance = null;

    Config.setUp();
    
    var LoginView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        $loginModal : '',
        template : _.template(loginTemplate),
        status : 'Login',

        initialize : function() {
            this.$main = this.$('#mainView');
            api.initializeLanguage();
        },

        events : {
            'submit .js-login-form' : 'onFormSubmit'
        },

        render : function(loadCss) {
            var model = {
            };

            this.$main.html(this.template({
                model : model
            }));

            this.status = 'Login';
            this.$main.find('#username').focus();
        },

        goToHome : function(result, status, message) {
            if (status == "OK") {
                Backbone.history.navigate('/',{trigger: true, replace: true});
            } else {
                console.log("not login");
            }
        },

        onFormSubmit : function(event) {
            event.preventDefault();
            if (this.status == "Login") {
                $("#loginError").html('');
                $('.loading').css('display' ,'block');
                var username = $("#username").val();
                var password = $("#password").val();

                if(username == null || username.length == 0){
                    var model = {};
                    this.$main.html('');
                    this.$main.html(this.template({
                        model : model
                    }));

                    $('#loginError').removeClass('show-waiting').addClass('show-error').html('Debe ingresar el usuario');
                    return false;
                }

                if(password == null || password.length == 0){
                    var model = {
                            username : username
                    };
                    this.$main.html('');
                    this.$main.html(this.template({
                        model : model
                    }));

                    $(this.$main).i18n($.i18n.options);

                    $('#loginError').removeClass('show-waiting').addClass('show-error').html('Debe ingresar la contraseña');
                    return false;
                }

                api.login(_.bind(this.goToHome, this), username, password);
                return false;
            } else {
                this.render();
            }
        }
    });

    LoginView.getInstance = function(){
        if(instance === null){
            instance = new LoginView();
        }
        return instance;
    }

    return LoginView.getInstance();
});


