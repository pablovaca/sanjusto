/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/giveStar-template.html',
	'text!templates/giveCustomerStarModal-template.html',
	'config',	
    'services/StarMeUpServices'
], function ($, _, Backbone, GiveStarTemplate, GiveStarModalTemplate, Config, smuServices) {
	'use strict';

	Config.setUp();
        
	var GiveCustomerStarView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(GiveStarTemplate),
		modalTemplate : _.template(GiveStarModalTemplate),
		container : {},
		currentUser : {},
		customerValues : {},
		selectedStar : {},
		totalStars : 0,
		
		initialize : function(container, currentUser, customerValues) {
			this.$main = this.$('#' + container);
			this.$main.html('');			    
		    this.container = container;		    
		    this.currentUser = currentUser;
		    this.customerValues = customerValues;		    
		    this.totalStars = 0;		     	    
			smuServices.getCountStarsReceivedByUserId(_.bind(this.callBackStarCount, this), currentUser.id);
			this.listenTo(this,'change', this.render);				
		},
		
		render : function() {
			_.each(this.customerValues, function(val){
				val.imageId = smuServices.getStarImage(val.imageId);
			}, this);

			this.currentUser.profileImage = smuServices.getProfileImage(this.currentUser.profileImageId);

			var model = {
				user : this.currentUser,
				totalStars : this.totalStars,
				customerValues : this.customerValues
			};

			this.$main.html(this.template({
				model : model
			}));

			this.$main.find('.js-star').on('click', _.bind(this.giveStar, this));
			this.$main.find('.js-back').on('click', _.bind(this.backToHome, this));
			this.$main.i18n($.i18n.options);
		},

		callBackStarCount : function(result, status, message){			
			if (status == "OK") {		
				this.totalStars = result;				
				this.trigger("change");				
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		giveStar : function(event) {
			event.preventDefault();
			this.selectedStar = {};				
            var selectedStarId = $(event.target).data('id');
            if(selectedStarId == null){
                selectedStarId = $(event.target).parent().data('id');
            }
            if(!selectedStarId)
            	return;
            _.each(this.customerValues, function(val){
            	if(selectedStarId === val.id){
            		this.selectedStar = val;
            	}
            }, this);
            //here accept validation before assing star to user
            smuServices.assignCustomerStar(_.bind(this.callBackAssing, this),this.currentUser.email, selectedStarId);
		},

		callBackAssing : function(result, status, message){
			if (status == "OK") {							
				this.renderModal();				
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		renderModal : function (){
			var $modal = $('#giveCustomerStar');
			$modal.html('');
			var modalModel = {	
				user : this.currentUser,
				value : this.selectedStar                 
            };
            $modal.html(this.modalTemplate({
                model : modalModel
            }));
            
            $modal.find('#giveCustomerStarModal').modal({backdrop: 'static'}); 
            $modal.find('#giveCustomerStarModal').modal('show');
            setInterval(function (){$modal.find('#giveCustomerStarModal').modal('hide')}, 5000);
            //$modal.find('#giveCustomerStarModal').on('hidden.bs.modal', _.bind(this.backToHome,this))
            $modal.find('#giveCustomerStarModal').on('hidden.bs.modal', _.bind(this.render,this))
            _.beautifyModal('#giveCustomerStarModal');
		},

		backToHome : function(event){
			if(event){
				event.preventDefault();
			}
			this.trigger("starGivenEvent");
		}

	});
	
	return GiveCustomerStarView;
});
	