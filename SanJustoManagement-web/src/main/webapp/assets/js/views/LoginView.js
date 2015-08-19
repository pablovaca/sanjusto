/*global define*/
define([ 
'jquery', 
'underscore', 
'backbone',
'text!templates/login-template.html',
'text!templates/trial-template.html',
'config', 
'common',
'services/StarMeUpServices'
],
function($, _, Backbone, loginTemplate, trialTemplate, Config, Common, smuService) {
    'use strict';

     /**
     * Singleton Pattern
     */
    var instance = null;

    Config.setUp();
    
    var LoginView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        $trialContainer : '',
        $loginModal : '',
        template : _.template(loginTemplate),
        trialTemplate : _.template(trialTemplate),
        status : 'Login',
        googleApiKey : 'AIzaSyCbot5JdIAYZU3eLjx7Wf6ij9g2CNya-hI',
        googleClientId : '227731822866-2hjdjienfgvv1k256i7fka6c9qska9ec.apps.googleusercontent.com',

        initialize : function() {
            this.$main = this.$('#mainView');
        },

        events : {
            'submit .js-login-form' : 'onFormSubmit',
            'click .js-forgot' : 'forgotPassword',
            'click #link-cancelForgot' : 'cancelForgotPassword',
            'click #tryMe' : 'trial',
            'click #link-cancelTrial' : 'cancelTrial'
        },

        render : function(loadCss) {
            //Internationalization
            smuService.initializeLoginLanguage();
            
            require(["gapi"], function (gapi) {
            	
            	var timmer = window.setTimeout(_.bind(function(){
            		if(gapi && gapi.client && gapi.client.setApiKey){
            			gapi.client.setApiKey(this.googleApiKey);
            			clearTimeout(timmer);
            		}
            	},this),100);
            });
            
            var username = smuService.getRememberMe("rememberUsername");

            if (loadCss) {
                $('head').append('<link rel="stylesheet jquery" href="'+ smuService.getDomain() + "/css/main.css" +'" type="text/css" />');
            }
            var model = {
                username : username,
                typeLogin : smuService.getTypeLogin()
            };

            this.$main.html(this.template({
                model : model
            }));

            $(document).ready(function() {
                $("#mainLink").attr("href",smuService.getDomain() + "/css/main.css");
            });

            $('body').addClass('bg-login');
            $('#footerView').hide();

            this.status = 'Login';

            $(this.$main).i18n($.i18n.options);

            var username = $('#username').val();
            if(username == null || username.length == 0){
                this.$main.find('#username').focus();
            }
            else{
                this.$main.find('#password').focus();
            }
            
            this.$main.find('#googleSignInButton').on('click',_.bind(this.googleSignIn, this));
        },
        
        googleSignIn : function(event){
            event.preventDefault();
            
            //Login with Access Token
            /*gapi.auth.authorize({client_id: this.googleClientId, 
            					scope: 'email', 
            					immediate: true}, 
            	_.bind(function(authResponse){
	            	if(authResponse && !authResponse.error){
	            		var rememberMe = false;
	                    if($("#rememberMe").is(":checked")==true){
	                        rememberMe = true;
	                    }
	                	
	                    smuService.authenticateUserFromExternalToken(_.bind(this.goToHome, this), authResponse.access_token,rememberMe);
	            	} else {
	                  // Error occurs during login
	                    console.log("Error occours during login: " + authResponse);
	                }
            	},this));*/
            
            //Login with Authorization Code
            gapi.auth.authorize({client_id: this.googleClientId, 
				scope: 'https://www.googleapis.com/auth/plus.login email', 
				immediate: false,
				response_type:'code',
				redirect_uri: 'postmessage', 
				access_type: 'offline', 
				approval_prompt: 'force'}, 
				_.bind(function(authResponse){
					if(authResponse && !authResponse.error){
						var rememberMe = false;
				        if($("#rememberMe").is(":checked")==true){
				            rememberMe = true;
				        }
				    	
				        smuService.authenticateUserFromAuthorizationCode(_.bind(this.goToHome, this), authResponse.code,rememberMe);
					} else {
				      // Error occurs during login
				        console.log("Error occours during login: " + authResponse);
				    }
				},this));
        },
        
        goToHome : function(result, status, message) {
            if (status == "OK") {

                if(rememberMe){
                    smuService.setRememberMe('rememberUsername', $("#username").val(),'72');
                } else {
                    smuService.setRememberMe('rememberUsername', '','72');

                }
                if(result.customerMode){
                    smuService.setCurrentUserMode('cm');                    
                    Backbone.history.navigate('/customer', {trigger: true, replace: true});
                } else {
                    smuService.setCurrentUserMode('nm');
                    Backbone.history.navigate('/',{trigger: true, replace: true});
                }
            } else {
                var rememberMe = false;

                if($("#rememberMe").is(":checked")==true){
                    rememberMe = true;
                }

                var model = {
                    username : username.value
                };
                this.$main.html('');
                this.$main.html(this.template({
                    model : model
                }));

                $(this.$main).i18n($.i18n.options);

                if(!rememberMe){
                    smuService.setRememberMe('rememberUsername', '','72');
                    smuService.setRememberMe('rememberPassword', '','72');
                    $('#rememberMe').prop("checked",false);
                }
                else{
                    $('#rememberMe').prop("checked",true);
                }
                $('#password').val('');
                $('#loginError').removeClass('show-waiting').addClass('show-error').html(message);
                
                this.$main.find('#googleSignInButton').on('click',_.bind(this.googleSignIn, this));
            }
        },

        onFormSubmit : function(event) {
            event.preventDefault();
            if (this.status == "Login") {
                $("#loginError").html('');
                $('.loading').css('display' ,'block');
                var username = $("#username").val();
                var password = $("#password").val();
                var rememberMe = false;
                if($("#rememberMe").is(":checked")==true){
                    rememberMe = true;
                }

                if(username == null || username.length == 0){
                    var model = {};
                    this.$main.html('');
                    this.$main.html(this.template({
                        model : model
                    }));

                    $(this.$main).i18n($.i18n.options);

                    $('#loginError').removeClass('show-waiting').addClass('show-error').html($.t('login.form.enterEmailAddress'));
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

                    $('#loginError').removeClass('show-waiting').addClass('show-error').html($.t('login.form.invalidCredentials'));
                    return false;
                }

                smuService.login(_.bind(this.goToHome, this), username, password,rememberMe);
                return false;
            } else if (this.status == "Reset Password") {
                var username = $("#username").val();
                $("#btn-submit").addClass("disabled");
                smuService.resetPassword(_.bind(this.afterForgotPassword,this), username);
                return false;
            } else if(this.status == 'trial') {
                $("#loginError").html('');
                $('.loading').css('display' ,'block');
                var firstName = $("#firstName").val();
                var lastName = $("#lastName").val();
                var username = $("#usernameTrial").val();
                var password = $("#passwordTrial").val();

                if(firstName == null || firstName.length == 0){
                    var model = {};
                    this.$trialContainer.html('');
                    this.$trialContainer.html(this.trialTemplate({
                        model : model
                    }));

                    this.$trialContainer.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.trial.enterFirstName'));
                    return false;
                }

                if(lastName == null || lastName.length == 0){
                    var model = {};
                    this.$trialContainer.html('');
                    this.$trialContainer.html(this.trialTemplate({
                        model : model
                    }));

                    this.$trialContainer.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.trial.enterLastName'));
                    return false;
                }

                if(username == null || username.length == 0){
                    var model = {};
                    this.$trialContainer.html('');
                    this.$trialContainer.html(this.trialTemplate({
                        model : model
                    }));

                    this.$trialContainer.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.enterEmailAddress'));
                    return false;
                }

                if(password == null || password.length == 0){
                    var model = {
                            username : username
                    };
                    this.$trialContainer.html('');
                    this.$trialContainer.html(this.trialTemplate({
                        model : model
                    }));

                    this.$trialContainer.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.invalidCredentials'));
                    return false;
                }
                smuService.trial(_.bind(function(result, status, message){
                    if(status == "OK"){
                        smuService.login(_.bind(this.goToHome, this), username, password, false);
                    } else if(status == "FAIL"){
                        this.$trialContainer.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html(message);
                        this.$trialContainer.find('#usernameTrial').addClass('error');
                        $('.loading').css('display' ,'none');
                    } else {
                        console.log(message);
                    }
                }, this), firstName, lastName, username, password);
                $(this.$main).i18n($.i18n.options);
                return false;
            } else {
                this.render();
            }
        },

        trial : function(event){
            event.preventDefault();
            var location = window.location.protocol + "//" + window.location.host + "/landing.html";
            window.location.replace(location);
        },

        forgotPassword : function(evt){
            evt.preventDefault();
            $("#password").addClass("hide");
            $(".js-forgot").addClass("hide");
            $("#rememberMe").addClass("hide");
            $("#rememberSpam").addClass("hide");
            $("#loginError").html("");
            this.status = "Reset Password";
            $("#btn-submit").val($.t("translation:login.form.forgotPasswordButton"));
            $("#js-label").html("Forgot Password");
            $("#link-cancelForgot").removeClass("hide");
            $("#tryMe").addClass('hide');
            this.$main.find('#username').focus();
        },

        afterForgotPassword : function(result, status, message){
            this.status=login;
            if (status == "OK") {
                $("#password").removeClass("hide");
                $(".js-forgot").removeClass("hide");
                $("#rememberMe").removeClass("hide");
                $("#rememberSpam").removeClass("hide");
                $("#loginError").html(result);
                this.status = "Login";
                $("#btn-submit").val($.t("translation:login.form.loginButton"));
                $("#js-label").html("Login");
                $("#link-cancelForgot").addClass("hide");
                $("#btn-submit").removeClass("disabled");
                $("#password").val('');
            } else {
                $("#loginError").html(message);
                $("#btn-submit").removeClass("disabled");
            }
        },

        cancelForgotPassword : function(event){
            event.preventDefault()
            $("#password").removeClass("hide");
            $(".js-forgot").removeClass("hide");
            $("#rememberMe").removeClass("hide");
            $("#rememberSpam").removeClass("hide");
            $("#loginError").html("");
            this.status = "Login";
            $("#btn-submit").val($.t("translation:login.form.loginButton"));
            $("#js-label").html("Login");
            $("#link-cancelForgot").addClass("hide");
        },

        cancelTrial : function(event){
            event.preventDefault();
            $('#login').removeClass('hide');
            $('#trial').addClass('hide');
            $("#loginError").html("");
            $('.loading').css('display' ,'none');
            this.$trialContainer = this.$('');
            this.$trialContainer.html('');
            this.status = 'login';
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


