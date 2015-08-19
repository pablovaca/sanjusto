/*global define*/
define([ 
    'jquery',
    'underscore',
    'backbone',
    'text!templates/profileInfoPanel-template.html',
    'config',
    'views/ProfileImageView',
    'views/GiveStarPanelView',
    'services/StarMeUpServices'
    ], function($, _, Backbone, profileInfoTemplate, Config, ProfileImageView, GivenStarPanelView, smuServices) {
    'use strict';

    Config.setUp();

    var ProfileInfoView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(profileInfoTemplate),
        currentUser: {},
        currentLoggedUser: {},
        loggedUser : false,
        remainingStars : 0,
        profileImageView : {},
        userInfoModel : {},
        starsReceived : 0,
        starsReceivedReady : false,
        givenStarPanelView : {},
        organizationValues : {},

        initialize : function(container, currentUser, currentLoggedUser, remainingStars, organizationValues) {
            this.$main = this.$('#' + container);
            this.currentUser = currentUser;
            this.currentLoggedUser = currentLoggedUser;
            smuServices.getStarsReceivedByUserId(_.bind(this.fillStarsReceived,this),this.currentUser.id);
            this.remainingStars = remainingStars;
            this.organizationValues = organizationValues;
        },

        render : function() {
            if(this.starsReceivedReady)
            {
                var model = {
                    user : this.currentUser,
                    remainingStars : this.remainingStars,
                    starsReceived : this.starsReceived
                };
                this.$main.html(this.template({
                    model : model
                }));

                if(this.currentUser != null ){
                    var profileImage = smuServices.getProfileImage(this.currentUser.profileImageId)

                    $('#profileImage').attr('src',profileImage);
                }

                var prefix = 'EditProfileImage';

                this.profileImageView = new ProfileImageView('profileImageContainer',this.currentUser,false,prefix);
                this.profileImageView.on('profileImageEvent', this.profileImageChanged, this);
                this.profileImageView.render();

                if(this.currentLoggedUser != null && this.currentUser && this.currentLoggedUser.id == this.currentUser.id)
                {
                    $('#profileImage').click(function(){
                        $('#' + prefix + 'Modal').modal('show');
                    });
                    $('#giveStarFromProfile').hide();
                    $('#starRemaining').removeClass('hide');

                    $('#profileImage').css('cursor','pointer');

                    if(this.currentUser.profileImageId == 0){
                        $('#profileImage').parent().append('<p id="waterMarkText" class="profile-waterMark-text" data-i18n="[html]translation:profile.clickHereUploadPicture">Click here to upload your profile picture</p>');

                        $('#waterMarkText').click(function(){
                            $('#' + prefix + 'Modal').modal('show');
                        });
                    }
                    this.loggedUser = true;
                } else {
                    $('#giveStarFromProfile').show();
                    if(model.remainingStars > 0){
                        $('#giveStarFromProfile').on('click',_.bind(this.giveStarFromProfile,this));
                        this.renderGivenStarPanel();
                    } else {
                        $('#giveStarFromProfile').removeClass('btn-given');
                        $('#giveStarFromProfile').addClass('btn-disabled');
                        $('#giveStarFromProfile').attr('title', 'You are out of stars for this period');
                    }
                    $('#' + prefix + 'Modal').html('');
                    $('#starsToGive').addClass("hide");
                    $('#starRemaining').addClass('hide');
                    this.loggedUser = false;
                }
            }
             $(this.$main).i18n($.i18n.options);
        },

        renderGivenStarPanel : function(){
            this.givenStarPanelView = new GivenStarPanelView('giveStarPanelFromProfile', this.currentLoggedUser, true, this.remainingStars, this.organizationValues);
            this.givenStarPanelView.on('starGivenEvent', this.starGiven, this);
            this.givenStarPanelView.render();
        },

        profileImageChanged : function(newImageId){
            this.trigger("profileImageEvent", newImageId);
        },

        fillStarsReceived : function(result, status, message){
            if (status == "OK") {
                if(result != null){
                    this.starsReceived = result;
                    this.starsReceivedReady = true;
                    this.render();
                }
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },
        
        starGiven : function(){
            this.trigger('starGiven');
        },

        giveStarFromProfile: function(){
            this.givenStarPanelView.showModalWithUser(this.currentUser);
        }
    });

    return ProfileInfoView;
});