/*global define*/
define([
'jquery', 
'underscore', 
'backbone',
'text!templates/landing-loginModal-template.html',
'text!templates/landing-trialModal-template.html',
'text!templates/landing-template.html',
'config', 
'common',
'services/StarMeUpServices'],
function($, _, Backbone, landingLoginModalTemplate, landingTrialModalTemplate, landingTemplate, Config, Common, smuService) {
    var instance = null;
    Config.setUp();

    var LandingView = Backbone.View.extend({
        $loginModal : '',
        $trialModal : '',
        template : _.template(landingTemplate),
        modalTemplate : _.template(landingLoginModalTemplate),
        trialModalTemplate : _.template(landingTrialModalTemplate),

        status : '',
        languages : {},
        languagesReady : false,
        selectedLanguageId : 0,
        stylesLoaded : false,
        stylesLoading : false,

        events : {
            'click #link-cancelForgot' : 'cancelForgotPassword'
        },

        initialize : function() {
            this.$main = this.$('#mainView');
            smuService.getLanguagesForNonConnectedUser(_.bind(this.renderLanguages, this), this.selectedLanguageId);
        },

        isRendered : function(){
            return this.stylesLoaded;
        },

        render : function() {
            $('#mainView').html('');
            $('#footerView').html('');

            var cssUrl = location.protocol + "//" + location.host + '/assets/content/landing/css/main.css';

            if(!this.stylesLoading && !smuService.cssExists(cssUrl)){

                this.stylesLoading = true;
                this.stylesLoaded = false;

                smuService.removeCss();

                var head = document.getElementsByTagName( "head" )[0],
                    body = document.body,
                    css = document.createElement( "link" ),
                    img = document.createElement( "img" );
                css.href = cssUrl;
                css.rel = "stylesheet";
                head.appendChild( css );
                img.style.display = 'none';
                img.onerror = _.bind(function(event) {
                    event.preventDefault();
                    body.removeChild( img );
                    this.stylesLoaded = true;
                    this.render();
                    this.stylesLoading = false;
                }, this);

                body.appendChild( img );
                img.src = cssUrl;
            }

            if(!this.languagesReady || !this.stylesLoaded){
                return;
            }

            var selectedLanguageCode = 'en';

            _.each(this.languages, function(language){
                if(language.id === this.selectedLanguageId){
                    selectedLanguageCode = language.code;
                }
            }, this);

            smuService.initializeLandingLanguage(selectedLanguageCode);
            $('#footerView').css('display', 'none');

            var model = {
                languages : this.languages,
                selectedLanguageCode : selectedLanguageCode
            };

            this.$main.html(this.template({
                model : model
            }));

            this.status = '';

            this.$main.find('#login').on('click', _.bind(this.renderLoginModal, this));
            this.$main.find('.js-trial').on('click', _.bind(this.renderTrialModal, this));
            $(this.$main).i18n($.i18n.options);

            $('.js-leng').on('click', _.bind(this.changeLanguage, this));

            this.$loginModal = this.$main.find('#trialModal');
            this.$trialModal = this.$main.find('#loginModal');

            this.$loginModal.on('shown.bs.modal', _.bind(function () {
                $(this.$loginModal.find("#username")).focus();
            },this));

            this.$trialModal.on('shown.bs.modal', _.bind(function () {
                $(this.$trialModal.find("#firstName")).focus();
            },this));

            require(['bootstrap','smooth-scroll','jquery.nav'], function () {
                $('.carousel').each(function () {
                    $(this).carousel({
                        interval: 5600
                    });
                });

                $(window)
                    .scroll(function () {
                        if ($(this)
                                .scrollTop() > 100) {
                            $('.scrollToTop')
                                    .fadeIn();
                        } else {
                            $('.scrollToTop')
                                    .fadeOut();
                        }
                    });

                $('.scrollToTop')
                .click(function () {
                    $('html, body')
                            .animate({
                                scrollTop: 0
                            }, 1000);
                    return false;
                });

                var scrollAnimationTime = 1200,
                        scrollAnimation = 'easeInOutExpo';
                $('a.scrollto').bind('click.smoothscroll', function (event) {
                    event.preventDefault();
                    var target = this.hash;
                    $('html, body').stop()
                            .animate({
                                'scrollTop': $(target)
                                        .offset()
                                        .top
                            }, scrollAnimationTime, scrollAnimation, function () {
                                window.location.hash = target;
                            });
                });

                $('.inner-link').smoothScroll({
                    speed: 900,
                    offset: -68
                });

                $(document).on('click', '.navbar-collapse.in', function (e) {
                    if ($(e.target).is('a')) {
                        $(this).collapse('hide');
                    }
                });
            });
        },

        renderLoginModal : function (event){
            event.preventDefault();
            var username = smuService.getRememberMe("rememberUsername");

            this.status = 'Login';
            this.$loginModal.find("#username").val('')
            this.$loginModal.find("#password").val('')

            var modalModel = {
                username : username,
                typeLogin : smuService.getTypeLogin()
            };
            this.$loginModal.html(this.modalTemplate({
                model : modalModel
            }));  
            _.beautifyModal('#landingLoginModal');          
            this.$loginModal.find('#landingLoginModal').modal('show');           
            this.$loginModal.find('.js-login-form').on('submit', _.bind(this.onFormSubmit, this));
            this.$loginModal.find('.js-forgot').on('click', _.bind(this.forgotPassword, this));
            $(this.$loginModal).i18n($.i18n.options);
        },

        renderTrialModal : function (event){
            event.preventDefault();

            this.status = 'Trial';
            this.$trialModal.find("#firstName").val('');
            this.$trialModal.find("#lastName").val('');
            this.$trialModal.find("#usernameTrial").val('');
            this.$trialModal.find("#passwordTrial").val('');

            var modalModel = {};
            this.$trialModal.html(this.trialModalTemplate({
                model : modalModel
            }))
            _.beautifyModal('#landingTrialModal');
            this.$trialModal.find('#landingTrialModal').modal('show');
            this.$trialModal.find('.js-trial-form').on('submit', _.bind(this.onFormSubmit, this));

            $(this.$trialModal).i18n($.i18n.options);
        },

        goToHome : function(result, status, message) {
            if (status === "OK") {
                if(this.status === 'Login'){
                    this.$loginModal.find('#landingLoginModal').modal('hide');
                } else {
                    this.$trialModal.find('#landingTrialModal').modal('hide');
                }
                $('body').removeClass('modal-open');
                Backbone.history.navigate('/',{trigger: true, replace: true});
            } else {
                var rememberMe = false;

                if($("#rememberMe").is(":checked")==true){
                    rememberMe = true;
                }

                var model = {
                    username : username.value
                };

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
                if(this.$loginModal.find("#rememberMe").is(":checked")==true){
                    rememberMe = true;
                }

                if(username == null || username.length === 0){
                    this.$loginModal.find('#loginError').removeClass('show-waiting').addClass('show-error').html($.t('login.form.enterEmailAddress'));
                    $(this.$loginModal.find("#username")).focus();
                    return false;
                }

                if(password == null || password.length === 0){
                    this.$loginModal.find('#loginError').removeClass('show-waiting').addClass('show-error').html($.t('login.form.invalidCredentials'));
                    $(this.$loginModal.find("#password")).focus();
                    return false;
                }

                smuService.login(_.bind(this.goToHome, this), username, password,rememberMe);
                return false;
            } else if (this.status === "Reset Password") {
                var username = $("#username").val();
                $("#btn-submit").addClass("disabled");
                smuService.resetPassword(_.bind(this.afterForgotPassword,this), username);
                return false;
            } else if(this.status === 'Trial') {
                $("#loginError").html('');
                var firstName = $("#firstName").val();
                var lastName = $("#lastName").val();
                var username = $("#usernameTrial").val();
                var password = $("#passwordTrial").val();

                if(firstName == null || firstName.length === 0){
                    this.$trialModal.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.trial.enterFirstName'));
                    $(this.$trialModal.find("#firstName")).focus();
                    return false;
                }

                if(lastName == null || lastName.length === 0){
                    this.$trialModal.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.trial.enterLastName'));
                    $(this.$trialModal.find("#lastName")).focus();
                    return false;
                }

                if(username == null || username.length === 0){
                    this.$trialModal.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.enterEmailAddress'));
                    $(this.$trialModal.find("#usernameTrial")).focus();
                    return false;
                }

                if(password == null || password.length === 0){
                    this.$trialModal.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html($.t('login.form.invalidCredentials'));
                    $(this.$trialModal.find("#passwordTrial")).focus();
                    return false;
                }
                smuService.trial(_.bind(function(result, status, message){
                    if(status === "OK"){
                        smuService.login(_.bind(this.goToHome, this), username, password, false);
                    } else if(status === "FAIL"){
                        this.$trialModal.find('#loginErrorTrial').removeClass('show-waiting').addClass('show-error').html(message);
                        this.$trialModal.find('#usernameTrial').addClass('error');
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

        renderLanguages : function(result, status, message) {
            if (status === "OK") {
                if (result != null) {
                    this.languages = result;
                    this.languagesReady = true;
                    this.render();
                }
            } else {
                console.log(message);
            }
        },

        changeLanguage : function(event){
            event.preventDefault();
            this.selectedLanguageId = $(event.target).data('id');
            if(this.selectedLanguageId && this.selectedLanguageId > 0){
                this.languagesReady = false;
                smuService.getLanguagesForNonConnectedUser(_.bind(this.renderLanguages, this), this.selectedLanguageId);
            }
        },

        forgotPassword : function(event){
            event.preventDefault();
            this.$loginModal.find("#password").addClass("hide");
            this.$loginModal.find(".js-forgot").addClass("hide");
            this.$loginModal.find("#rememberMe").addClass("hide");
            this.$loginModal.find("#rememberSpam").addClass("hide");
            this.$loginModal.find("#loginError").html("");
            this.status = "Reset Password";
            this.$loginModal.find("#btn-submit").text($.t("translation:login.form.forgotPasswordButton"));
            $("#js-label").html("Forgot Password");
            $("#link-cancelForgot").removeClass("hide");
        },

        cancelForgotPassword : function(event){
            event.preventDefault();
            this.$loginModal.find("#password").removeClass("hide");
            this.$loginModal.find(".js-forgot").removeClass("hide");
            this.$loginModal.find("#rememberMe").removeClass("hide");
            this.$loginModal.find("#rememberSpam").removeClass("hide");
            this.$loginModal.find("#loginError").html("");
            this.status = "Login";
            this.$loginModal.find("#btn-submit").text($.t("translation:login.form.loginButton"));
            $("#js-label").html("Login");
            $("#link-cancelForgot").addClass("hide");
        },

        afterForgotPassword : function(result, status, message){
            this.status = "Login";
            this.$loginModal.find("#resetPwd").html("").css('display', 'block');
            if (status === "OK") {
                this.$loginModal.find("#password").removeClass("hide").val('');
                this.$loginModal.find(".js-forgot").removeClass("hide");
                this.$loginModal.find("#rememberMe").removeClass("hide");
                this.$loginModal.find("#rememberSpam").removeClass("hide");
                this.$loginModal.find("#resetPwd").html(result).fadeOut( 1000*5 );
                this.$loginModal.find("#btn-submit").text("Login");
                this.$loginModal.find("#btn-submit").removeClass("disabled");
                this.$loginModal.find("#js-label").html("Login");
                $("#link-cancelForgot").addClass("hide");
            } else {
                this.$loginModal.find("#loginError").html(message)
                this.$loginModal.find("#btn-submit").removeClass("disabled");
            }
        }
    });

    LandingView.getInstance = function(){
        if(instance === null){
            instance = new LandingView();
        }
        return instance;
    }
    return LandingView.getInstance();
});