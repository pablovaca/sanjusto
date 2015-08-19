/*globant define*/
define([ 
        'jquery', 
        'underscore', 
        'backbone',
		'text!templates/language-template.html', 
		'config',				
		'services/StarMeUpServices'				
		],

function($, _, Backbone, languageTemplate, Config, smuServices) {

	'use strict';

	Config.setUp();
	var LanguageView = Backbone.View.extend({	
		el : '#app',
		className : 'row',
		template : _.template(languageTemplate),
		languageAvailable : {},
		selectedLanguage : {},

		initialize : function(container, selectedLanguage) {			
			this.$main = this.$('#' + container);
			this.selectedLanguage = selectedLanguage;
			smuServices.getLanguagesForConnectedUser(_.bind(this.callBackLanguage, this));			
		},
		
		render : function() {		

			var model = {
				languageAvailable : this.languageAvailable,
				selectedLanguage : this.selectedLanguage				
			};

			this.$main.html(this.template({
				model : model
			}));
			$('.js-leng').on('click', _.bind(this.changeLanguage, this));			
		},

		callBackLanguage : function(result,status,message){
			if(status == 'OK'){
				if(result != null){
					this.languageAvailable = result;					
					this.render();
				}								
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
				console.log(message);
			}
		},

		changeLanguage : function(event){
			event.preventDefault();
			var selectedLanguageId = $(event.target).data('id');
			if(selectedLanguageId && selectedLanguageId > 0){
				smuServices.setLanguageToUser(_.bind(this.languageChanged ,this), selectedLanguageId);
			}		
		},

		languageChanged : function(result, status, message){
			if(status == 'OK'){
				if(result != null){
					this.trigger("languageChanged");
				}								
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
				console.log(message);
			}			
		}
	});
	return LanguageView;
});