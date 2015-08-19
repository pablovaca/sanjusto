/*globant define*/
define([ 
    'jquery', 
    'underscore', 
    'backbone',
	'text!templates/profileCoreDetail-template.html', 
	'config', 
	'services/StarMeUpServices'				
],function($, _, Backbone, detailTemplate, Config, smuServices) {

	'use strict';

	Config.setUp();
	var CoreStarsDetailView = Backbone.View.extend({
		el : '#app',		
		className : '',
		template : _.template(detailTemplate),
		currentUser : {},
		starsDetailReceived : {},
		starsDetailSent : {},
		currentLoggedUser : false,
		starsDetailR : false,
		starsDetailS : false,
		orgValues : {},

		initialize : function(container, currentUser, currentLoggedUser, orgValues) {					
			this.$main = this.$('#' + container);
			this.currentUser = currentUser;
			this.orgValues = orgValues;
			this.callbackSmu();	
			this.listenTo(this,'change', this.render);
		},

		callbackSmu : function(){
			smuServices.getStarsSummary(_.bind(this.callBackStarsSummaryR, this), this.currentUser.id, 'RECEIVED');
			smuServices.getStarsSummary(_.bind(this.callBackStarsSummaryS, this), this.currentUser.id, 'SENT');		
		},
		
		render : function() {			

			if(!this.starsDetailR || !this.starsDetailS || this.starsDetailReceived.length < 0 || this.starsDetailSent.length < 0){
				this.$main.html('');
				return;
			}	

			var model = {
				starsReceived : this.starsDetailReceived,
				starsSent : this.starsDetailSent
			};
			this.$main.html(this.template({
					model : model
			}));
			$(this.$main).i18n($.i18n.options);
			this.unbind();
		},

		callBackStarsSummaryR : function (result, status, message){
			if(status == 'OK'){
                if(result != null && result.coreValuesSummary.length > 0){
                	_.each(result.coreValuesSummary, function(star, index){
                		star.imageUlr = smuServices.getStarImage(star.imageId);
                	},this); 
                	this.starsDetailReceived = result;                                                             
                }
                this.starsDetailR = true;
               	this.trigger('change');                                   
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
			console.log(message);
			}
		},

		callBackStarsSummaryS : function (result, status, message){
			if(status == 'OK'){
                if(result != null && result.coreValuesSummary.length > 0){
                	_.each(result.coreValuesSummary, function(star){
                		star.imageUlr = smuServices.getStarImage(star.imageId);
                	},this);
                	this.starsDetailSent = result;                                                                     
                } 
                this.starsDetailS = true;         
                this.trigger('change');  
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
			console.log(message);
			}
		}
		
	});
	return CoreStarsDetailView;
});