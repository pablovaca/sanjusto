/*global define*/
define([ 
	'jquery', 
	'underscore', 
	'backbone',
	'text!templates/homeProfileInfoPanel-template.html', 
	'config',
	'views/ProfileImageView',
	'services/StarMeUpServices'
	], function($, _, Backbone, profileInfoTemplate, Config, ProfileImageView, smuServices) {
	'use strict';

	Config.setUp();

	var HomeProfileInfoView = Backbone.View.extend({
		el : '#app',
		className : 'row',
		template : _.template(profileInfoTemplate),
		currentUser: {},
		starsGiven : 0,
		maxStarsToGive : 0,
		profileImageView : {},
		
		initialize : function(container, currentUser, starsGiven, maxStarsToGive) {
			this.$main = this.$('#' + container);
			this.currentUser = currentUser; 
			this.starsGiven = starsGiven;
			this.maxStarsToGive = maxStarsToGive;
		},
		render : function() {
			var model = {
				user : this.currentUser, 
				starsGiven : this.starsGiven,
				maxStarsToGive : this.maxStarsToGive,
				remainingStars : this.maxStarsToGive - this.starsGiven,
				domain : smuServices.getDomain()
			};
			this.$main.html(this.template({
				model : model
			}));
			if(this.currentUser != null){
				$('#profileImage').attr('src',smuServices.getProfileImage(this.currentUser.profileImageId));
					if(this.currentUser.profileImageId == 0){
						$('#profileImage').parent().append('<p id="waterMarkText" class="profile-waterMark-text" data-i18n="[html]translation:profile.clickHereUploadPicture">Click here to upload your profile picture</p>');
					
					$('#waterMarkText').click(function(){
						$('#' + prefix + 'Modal').modal('show');
					});	
				}
			}
			
			var prefix = 'EditProfileImage';
			
			this.profileImageView = new ProfileImageView('profileImageContainer',this.currentUser,false,prefix);
			this.profileImageView.on('profileImageEvent', this.profileImageChanged, this);
			this.profileImageView.render();
			
			$('#profileImage').click(function(){
				$('#' + prefix + 'Modal').modal('show');
			});
		},
        
        
		profileImageChanged : function(){
			this.trigger("profileImageEvent");
		}
		
	});

	return HomeProfileInfoView;
});
	