/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/userPreferences-model',
    'text!templates/userSettings-template.html',
    'text!templates/modal-template.html',
    'config',
    'views/ProfileImageView',
    'views/SkillsAdministrationView',
    'services/StarMeUpServices',
    'services/SocialNetworkServices'
], function ($, _, Backbone, UserPreferencesModel, userSettingsTemplate, ModalTemplate, Config, ProfileImageView, SkillsAdministrationView, smuServices, snServices) {
    'use strict';

        Config.setUp();

        var UserSettingsView = Backbone.View.extend({
            el : '#app',
            template : _.template(userSettingsTemplate),
            modalTemplate : _.template(ModalTemplate),
            currentUser : {},
            userPreferenceModel : {},
            userPreferenceReady : false,
            emailSettings : true,
            profileImageView : {},
            skillsAdministrationViewFromCV : {},
            skillsAdministrationView : {},

            initialize : function(container, currentUser, emailSettings) {
                this.$main = this.$('#' + container);
                this.currentUser = currentUser;
                this.emailSettings = emailSettings;            
                smuServices.getPreferences(_.bind(this.setUserPreferences, this));                
            },

            render : function() {
                if(this.userPreferenceReady){
                    this.$main.html(this.template({
                        model : this.userPreferenceModel.toJSON(),
                        isTalentModuleEnabled : smuServices.isTalentModuleEnabled(),
                        typeLogin : smuServices.getTypeLogin(),
                        emailSettings : this.emailSettings
                    }));
                    console.log(this.emailSettings)

                    this.$main.find('input:checkbox').bootstrapSwitch('state',false);
                    this.$main.find('#emailSwitch').on('switchChange.bootstrapSwitch',_.bind(this.emailSwitch, this));
                    this.$main.find('#facebookSwitch').on('switchChange.bootstrapSwitch',_.bind(this.facebookSwitch, this));
                    this.$main.find('#twitterSwitch').on('switchChange.bootstrapSwitch',_.bind(this.twitterSwitch, this));
                    this.$main.find('#googlePlusSwitch').on('switchChange.bootstrapSwitch',_.bind(this.googlePlusSwitch, this));
                    this.$main.find('#linkedInSwitch').on('switchChange.bootstrapSwitch',_.bind(this.linkedInSwitch, this));
                    this.$main.find('#skillsFromLinkedIn').on('click',_.bind(this.linkedInImportSkills, this));
                    this.$main.find('#allPushNotificationsSwitch').on('switchChange.bootstrapSwitch',_.bind(this.allPushNotificationsSwitch, this));
                    this.$main.find('#pushNotificationsToLikesSwitch').on('switchChange.bootstrapSwitch',_.bind(this.pushNotificationsToLikesSwitch, this));
                    this.$main.find('#pushNotificationsToCommentsSwitch').on('switchChange.bootstrapSwitch',_.bind(this.pushNotificationsToCommentsSwitch, this));

                    //snServices.facebookRender();

                    if(this.currentUser != null ){
                        var profileImage = smuServices.getProfileImage(this.currentUser.profileImageId)

                        this.$main.find('#profileImage').attr('src',profileImage);
                    }

                    var prefix = 'EditProfileImageUserSettings';

                    this.profileImageView = new ProfileImageView('profileImageContainerUserSettings',this.currentUser,false,prefix);
                    this.profileImageView.on('profileImageEvent', this.profileImageChanged, this);
                    this.profileImageView.render();

                    this.$main.find('#profileImage').click(_.bind(function(){
                        $('#' + prefix + 'Modal').modal('show');
                    }, this));
                    this.$main.find('.change-picture').click(_.bind(function(){
                        $('#' + prefix + 'Modal').modal('show');
                    }, this));
                    this.$main.find('#profileImage').css('cursor','pointer');
                    if(this.currentUser.profileImageId === 0){
                        this.$main.find('#profileImage').parent().append('<p id="waterMarkText" class="profile-waterMark-text" style="top: 100px;" data-i18n="[html]translation:profile.clickHereUploadPicture">Click here to upload your profile picture</p>');

                        this.$main.find('#waterMarkText').click(_.bind(function(){
                            this.$main.find('#' + prefix + 'Modal').modal('show');
                        }, this));
                    }

                    this.$main.find('#innerfileupload').fileupload({
                        autoUpload: true,
                        acceptFileTypes: /(\.|\/)(doc|docx|pdf)$/i

                        /*disableImageResize: /Android(?!.*Chrome)|Opera/
                            .test(window.navigator && navigator.userAgent),
                        imageMaxWidth: 200,
                        imageMaxHeight: 200,
                        imageCrop: true // Force cropped images*/
                    }).on('fileuploadadd', _.bind(function (e, data) {
                        if(data.files[0].size > 1024000) {
                            this.$main.find('#importCVResult').html('');
                            this.$main.find('#importLinkedInSkillsResult').html('');
                            this.$main.find('#importCVResult').html('<p class="text-danger">'+ $.t('profile.onlyLowerThan') +'</p>');
                        }
                        else{
                            var resultRegex = data.files[0].name.match(/(\.|\/)(doc|docx|pdf)$/i);
                            if(resultRegex != null){
                                this.$main.find('#importCVResult').html('');
                                this.$main.find('#importLinkedInSkillsResult').html('');
                                this.$main.find('#importCVResult').html('<img style="display: inline; width:30px; height:30px; margin: 0 0 0 10px;" src="assets/content/starmeup/img/loading_blue.gif">');
                                smuServices.parseCV(e, data);
                            }
                            else{
                                this.$main.find('#importCVResult').html('');
                                this.$main.find('#importLinkedInSkillsResult').html('');
                                this.$main.find('#importCVResult').html('<p class="text-danger">' + $.t('profile.fileNotAllowed') + '</p>');
                                this.renderModal($.t('profile.fileNotAllowed'));
                            }
                        }
                    }, this)).on('fileuploadprocessalways', function (e, data) {

                    }).on('fileuploadprogressall', function (e, data) {

                    }).on('fileuploaddone', _.bind(function (e, data) {
                        if(data.result != null && data.result.status === 'OK' && data.result.result != null){
                            this.$main.find('#importCVResult').html('');

                            var $modal = this.$main.find('#userSettingsMessagesModal');

                            var modalModel = {
                                prefix : 'innerUserSettingsMessages'
                            };

                            $modal.html(this.modalTemplate({
                                model : modalModel
                            }));

                            var skills = [];

                            _.each(data.result.result, function(item, index){
                                skills.push({id:index, name:item, enabled:true});
                            }, this);

                            /* Implementation postponed
                            this.skillsAdministrationViewFromCV = new SkillsAdministrationView('innerUserSettingsMessagesModalBody',_.bind(this.acceptSkillsFromCV,this),_.bind(this.cancelSkillsFromCV,this), skills, false);
                            this.skillsAdministrationViewFromCV.render();

                            $modal.find('#innerUserSettingsMessagesModalTitle').css('color','#a2a2a2');
                            $modal.find('#innerUserSettingsMessagesModalTitle').show();
                            $modal.find('#innerUserSettingsMessagesModalTitle').html("Please select the skills you'd like to import");
                            $modal.find('#innerUserSettingsMessagesModalAcceptButton').hide();
                            $modal.find('#innerUserSettingsMessagesModal').modal('show');
                            */

                            this.acceptSkillsFromCV(skills);
                        }
                        else
                        {
                            this.$main.find('#importCVResult').html('');
                            this.$main.find('#importLinkedInSkillsResult').html('');
                            this.$main.find('#importCVResult').html('<p class="text-danger">'+ $.t('profile.invalidFile')  +'</p>');
                        }
                    }, this)).on('fileuploadfail', _.bind(function (e, data) {
                            this.$main.find('#importCVResult').html('');
                            $('#generalErrorModal').modal('show');
                    }, this))
                    .prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');

                    /* Implementation postponed
                    //Skills Administration
                    if(smuServices.isTalentModuleEnabled()){
                        smuServices.getSkills(_.bind(this.renderSkillsAdministration, this));
                    }*/
                }
                $(this.$main).i18n($.i18n.options);

                this.$main.find('#acceptChange').on('click', _.bind(this.validatePwd, this));
                this.$main.find('.js-input').on('focus', _.bind(function(event){
                    event.preventDefault();
                    var input = $(event.target).data('id');
                    if(input === 'newPw'){
                        $('#inputNewPw').removeClass('error');
                    }
                    if(input === 'currentPw'){
                        $('#inputCurrentPw').removeClass('error');
                    }
                    if(input === 'repeatPw'){
                        $('#inputRepeatPw').removeClass('error');
                    }
                }, this));
            },

            acceptSkillsFromCV : function(skills){
                var skillsToImport = [];

                _.each(skills, function(item){
                    if(item.enabled){
                        skillsToImport.push({id:item.id,name:item.name});
                    }
                }, this);

                if(skillsToImport.length > 0){
                    smuServices.importUserTalentsFromCV(_.bind(function(result, status, message){
                        var $modal = this.$main.find('#userSettingsMessagesModal');
                        $modal.find('#innerUserSettingsMessagesModal').modal('hide');

                        if(status === 'OK'){
                            this.skillsImported(result, 'importCVResult');
                        }
                        else
                        {
                            this.renderModal($.t('profile.errorProcess'));
                        }
                    }, this), skillsToImport);
                }
                else{
                    $('#importCVResult').html($.t('profile.selectOneSkill'));
                }
            },

            cancelSkillsFromCV : function(){
                var $modal = this.$main.find('#userSettingsMessagesModal');
                $modal.find('#innerUserSettingsMessagesModal').modal('hide');
            },

            setUserPreferences : function(result, status, message){
                if(status === 'OK' && this.currentUser != null){
                    this.userPreferenceModel = new UserPreferencesModel({
                        id: result.id,
                        user: this.currentUser,
                        facebookAccount: result.facebookAccount,
                        googlePlusAccount: result.googlePlusAccount,
                        twitterAccount: result.twitterAccount,
                        linkedInAccount: result.linkedInAccount,
                        currentUserIsAdmin : smuServices.userHasRights('AdminPanel'),
                        allPushNotifications : result.allPushNotificationsSwitch,
                        pushNotificationsToLikes : result.pushNotificationsToLikes,
                        pushNotificationsToComments : result.pushNotificationsToComments
                    });

                    this.userPreferenceReady = true;
                    this.render();
                    if(result.emailAccount != null){
                        this.$main.find('#emailSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.facebookAccount != null){
                        this.$main.find('#facebookSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.twitterToken != null){
                        this.$main.find('#twitterSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.googlePlusAccount != null){
                        this.$main.find('#googlePlusSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.linkedInAccount != null){
                        this.$main.find('#linkedInSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.pushNotificationsToLikes == null || result.pushNotificationsToLikes == true){
                        this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.pushNotificationsToComments == null || result.pushNotificationsToComments == true){
                        this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('state',true,true);
                    }
                    if(result.allPushNotifications == null || result.allPushNotifications == true){
                        this.$main.find('#allPushNotificationsSwitch').bootstrapSwitch('state',true,true);
                    }
                    else{
                    	this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('disabled',true);
                    	this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('disabled',true);
                    }
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            emailSwitch : function(event, state){
                this.$main.find('#emailSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    smuServices.addEmailCredentials(_.bind(this.emailCredentialsAdded, this), this.currentUser.email);
                }
                else{
                    smuServices.removeEmailCredentials(_.bind(this.emailCredentialsRemoved, this));
                }
            },

            emailCredentialsAdded : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#emailSwitch').bootstrapSwitch('state',true,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            emailCredentialsRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#emailSwitch').bootstrapSwitch('state',false,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            facebookSwitch : function(event, state){
                this.$main.find('#facebookSwitch').bootstrapSwitch('state',!state,true);
                if(snServices.facebookIsReady()){
                    if(state){
                        snServices.facebookLogIn(_.bind(this.facebookStatusChanged, this));
                    }
                    else{
                        smuServices.removeFacebookCredentials(_.bind(this.facebookCredentialsRemoved, this));
                    }
                }
            },

            facebookStatusChanged : function(response){
                console.log('facebookLogInStatus');
                console.log(response);
                // The response object is returned with a status field that lets the
                // app know the current login status of the person.
                // Full docs on the response object can be found in the documentation
                // for FB.getLoginStatus().
                if (response.status === 'connected') {
                  // Logged into your app and Facebook.
                    console.log('Logged into your app and Facebook: ' + response.name);
                    smuServices.addFacebookCredentials(_.bind(this.facebookCredentialsSaved, this), response.authResponse.userID);
                } else if (response.status === 'not_authorized') {
                  // The person is logged into Facebook, but not your app.
                    console.log('The person is logged into Facebook, but not your app.');
                } else {
                  // The person is not logged into Facebook, so we're not sure if
                  // they are logged into this app or not.
                    console.log("The person is not logged into Facebook, so we're not sure if they are logged into this app or not.");
                }
            },

            facebookCredentialsSaved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#facebookSwitch').bootstrapSwitch('state',true,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            facebookCredentialsRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#facebookSwitch').bootstrapSwitch('state',false,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            twitterSwitch : function(event, state){
                this.$main.find('#twitterSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    snServices.twitterLogIn(_.bind(this.twitterStatusChanged, this));
                }
                else{
                    smuServices.removeTwitterCredentials(_.bind(this.twitterCredentialsRemoved, this));
                }
            },

            twitterStatusChanged : function(response){
                console.log('twitterLogInStatus');
                console.log(response);

                if(response.authResponse != null && response.authResponse.access_token != null)
                {
                    var token = response.authResponse.access_token.split(':')[0];
                    var secretToken = response.authResponse.access_token.replace(token + ':', '').split('@')[0];
                    smuServices.addTwitterCredentials(_.bind(this.twitterCredentialsSaved, this), token, secretToken);
                } else {
                  // Error occours during login
                    console.log("Error occours during login: " + response);
                }
            },

            twitterCredentialsSaved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#twitterSwitch').bootstrapSwitch('state',true,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            twitterCredentialsRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#twitterSwitch').bootstrapSwitch('state',false,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            googlePlusSwitch : function(event, state){
                this.$main.find('#googlePlusSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    snServices.googlePlusLogIn(_.bind(this.googlePlusStatusChanged, this));
                }
                else{
                    smuServices.removeGooglePlusCredentials(_.bind(this.googlePlusCredentialsRemoved, this));
                }
            },

            googlePlusStatusChanged : function(response){
                console.log('googlePlusLogInStatus');
                console.log(response);

                if(response.authResponse != null && response.authResponse.access_token != null)
                {
                    var token = response.authResponse.access_token;
                    smuServices.addGooglePlusCredentials(_.bind(this.googlePlusCredentialsSaved, this), token);
                } else {
                  // Error occours during login
                    console.log("Error occours during login: " + response);
                }
            },

            googlePlusCredentialsSaved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#googlePlusSwitch').bootstrapSwitch('state',true,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            googlePlusCredentialsRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#googlePlusSwitch').bootstrapSwitch('state',false,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            linkedInSwitch : function(event, state){
                this.$main.find('#linkedInSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    snServices.linkedInLogIn(_.bind(this.linkedInStatusChanged, this));
                }
                else{
                    smuServices.removelinkedInCredentials(_.bind(this.linkedInCredentialsRemoved, this));
                }
            },

            linkedInStatusChanged : function(response){
                console.log('linkedInLogInStatus');
                console.log(response);

                if(response.authResponse != null && response.authResponse.access_token != null)
                {
                    var token = response.authResponse.access_token;
                    smuServices.addlinkedInCredentials(_.bind(this.linkedInCredentialsSaved, this), token);
                } else {
                  // Error occours during login
                    console.log("Error occours during login: " + response);
                }
            },

            linkedInCredentialsSaved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#linkedInSwitch').bootstrapSwitch('state',true,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            linkedInCredentialsRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#linkedInSwitch').bootstrapSwitch('state',false,true);
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            allPushNotificationsSwitch : function(event, state){
                this.$main.find('#allPushNotificationsSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    smuServices.changePreferenceAllPushNotifications(_.bind(this.allPushNotificationsSwitchAdded, this), true);
                }
                else{
                    smuServices.changePreferenceAllPushNotifications(_.bind(this.allPushNotificationsSwitchRemoved, this), false);
                }
            },

            allPushNotificationsSwitchAdded : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#allPushNotificationsSwitch').bootstrapSwitch('state',true,true);
                    this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('disabled',false);
                    this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('disabled',false);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            allPushNotificationsSwitchRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#allPushNotificationsSwitch').bootstrapSwitch('state',false,true);
                    this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('disabled',true);
                    this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('disabled',true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },
            
            pushNotificationsToLikesSwitch : function(event, state){
                this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    smuServices.changePreferenceLikePushNotifications(_.bind(this.pushNotificationsToLikesSwitchAdded, this), true);
                }
                else{
                    smuServices.changePreferenceLikePushNotifications(_.bind(this.pushNotificationsToLikesSwitchRemoved, this), false);
                }
            },

            pushNotificationsToLikesSwitchAdded : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('state',true,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            pushNotificationsToLikesSwitchRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#pushNotificationsToLikesSwitch').bootstrapSwitch('state',false,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },
            
            pushNotificationsToCommentsSwitch : function(event, state){
                this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('state',!state,true);
                if(state){
                    smuServices.changePreferenceCommentPushNotifications(_.bind(this.pushNotificationsToCommentsSwitchAdded, this), true);
                }
                else{
                    smuServices.changePreferenceCommentPushNotifications(_.bind(this.pushNotificationsToCommentsSwitchRemoved, this), false);
                }
            },

            pushNotificationsToCommentsSwitchAdded : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('state',true,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            pushNotificationsToCommentsSwitchRemoved : function(result, status, message){
                if(status === 'OK'){
                    this.$main.find('#pushNotificationsToCommentsSwitch').bootstrapSwitch('state',false,true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },
            
            linkedInImportSkills : function(event){
                event.preventDefault();
                this.$main.find('#importLinkedInSkillsResult').html('');
                this.$main.find('#importLinkedInSkillsResult').html('<img style="display: inline; width:30px; height:30px; margin: 0 0 0 10px;" src="assets/content/starmeup/img/loading_blue.gif">');
                snServices.linkedInLogIn(_.bind(function(response){
                    if(response.authResponse != null && response.authResponse.access_token != null)
                    {
                        snServices.linkedInGetSkills(_.bind(function(json){
                            if(json != null && json.skills != null && json.skills.values != null && json.skills.values.length > 0){
                                var skillsToImport = [];

                                $.each(json.skills.values, function(index, value){
                                    if(value.skill != null){
                                        var skill = { id : value.skill.name, name : value.skill.name};
                                        skillsToImport.push(skill);
                                    }
                                });

                                smuServices.importUserTalentsFromLinkedIn(_.bind(this.linkedInSkillsImported , this), skillsToImport);
                            }
                            else{
                                this.skillsImported('','importLinkedInSkillsResult');
                            }
                        }, this));
                    } else {
                        this.$main.find('#importLinkedInSkillsResult').html('');
                        console.log(message);
                    }
                }, this));
            },

            linkedInSkillsImported : function(result, status, message){
                if(status === 'OK'){
                    this.skillsImported(result,'importLinkedInSkillsResult');
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            skillsImported : function(result, resultContainer){
                var resultingMessage = '';

                if(result && result.length > 0 && result !== "0"){
                    resultingMessage = $.t('profile.skillsAddedMessage', { skills : result });
                }
                else if(result && result.length > 0 && result === "0"){
                    resultingMessage = $.t('profile.noNewSkillsMessage');
                }
                else{
                    resultingMessage = $.t('profile.skillsWithoutMatchesMessage');
                }

                this.$main.find('#importCVResult').html('');
                this.$main.find('#importLinkedInSkillsResult').html('');
                this.$main.find('#' + resultContainer).html('<p class="text-success">'+ resultingMessage +'</p>');
                this.renderModal(resultingMessage);

                /* Implementation postponed
                //Display user skills
                smuServices.getSkills(_.bind(this.renderSkillsAdministration, this));
                if(!$('#collapseChangeSkills').attr('aria-expanded')){
                    $('#collapseChangeSkills').collapse('toggle');
                }
                $('html, body').animate({
                        scrollTop: $("#collapseChangeSkills").offset().top
                }, 2000);*/
            },

            profileImageChanged : function(newImageId){
                this.trigger("profileImageEvent", newImageId);
            },

            validatePwd : function(event){
                event.preventDefault();
                var oldPwd = $('#inputCurrentPw').val(),
                    newPwd = $('#inputNewPw').val(),
                    reptPwd = $('#inputRepeatPw').val();
                this.$main.find('#inputRepeatPw').removeClass('error');
                this.$main.find('#inputNewPw').removeClass('error');
                this.$main.find('#inputCurrentPw').removeClass('error');

                if(oldPwd === '' || newPwd === '' || reptPwd === ''){
                    if(oldPwd === ''){
                        this.$main.find('#inputCurrentPw').addClass('error');
                    }
                    if(newPwd === ''){
                        this.$main.find('#inputNewPw').addClass('error');
                    }
                    return;
                }

                if(newPwd === oldPwd){
                    this.$main.find('#inputCurrentPw').addClass('error').val('');
                    this.$main.find('#inputNewPw').addClass('error').val('');
                    return;
                }
                if(newPwd !== reptPwd){
                    this.$main.find('#inputNewPw').addClass('error').val('');
                    this.$main.find('#inputRepeatPw').addClass('error').val('');
                    return;
                }

                smuServices.changePassword(_.bind(this.chagePwd, this), oldPwd, newPwd);

            },

            chagePwd : function(result, status, message){
                 if(status === 'OK'){
                    $('#inputCurrentPw').val(''),
                    $('#inputNewPw').val(''),
                    $('#inputRepeatPw').val('');
                    this.renderModal("Your Password was successfully changed");
                    this.$main.find('#collapseChangePwd').collapse("hide");
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                    this.$main.find('#inputCurrentPw').addClass('error').val('');
                    this.$main.find('#inputNewPw').addClass('error').val('');
                    this.$main.find('#inputRepeatPw').addClass('error').val('');
                }
            },

            renderModal : function (message){
                var $modal = this.$main.find('#userSettingsMessagesModal');

                var modalModel = {
                        prefix : 'innerUserSettingsMessages'
                };
                $modal.html(this.modalTemplate({
                    model : modalModel
                }));

                $modal.find('#innerUserSettingsMessagesModalTitle').hide();
                $modal.find('#innerUserSettingsMessagesModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
                $modal.find('#innerUserSettingsMessagesModalBody').html('<p>'+ message +'</p>');
                $modal.find('#innerUserSettingsMessagesModal').modal('show');
            },

            renderSkillsAdministration : function(result, status, message){
                if(status === 'OK'){

                    if(result == null){
                        result = [];
                    }

                    this.skillsAdministrationView = new SkillsAdministrationView('collapseChangeSkills',_.bind(this.acceptSkillsFromAdministration,this),_.bind(this.cancelSkillsFromAdministration,this), result, true);
                    this.skillsAdministrationView.render();
                } else if (message==="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

            acceptSkillsFromAdministration : function(skills){
                var skillsToSave = [];

                _.each(skills, function(item){
                    skillsToSave.push({id:item.id,name:item.enabled ? 'true' : 'false'});
                }, this)

                smuServices.setSkills(_.bind(function(result, status, message){
                    if(status === 'OK'){
                        this.renderModal('Skills saved.');
                        smuServices.getSkills(_.bind(this.renderSkillsAdministration, this));
                    } else if (message==="NO_RIGHTS") {
                        Backbone.trigger('NO_RIGHTS');
                    } else {
                        console.log(message);
                    }}, this), skillsToSave);
            },

            cancelSkillsFromAdministration : function(){
                smuServices.getSkills(_.bind(this.renderSkillsAdministration, this));
            }
        });

        return UserSettingsView;

    });