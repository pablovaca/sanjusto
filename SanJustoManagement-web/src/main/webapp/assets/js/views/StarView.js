/*globant define*/
define([ 
        'jquery', 
        'underscore', 
        'backbone',
		'text!templates/adminPanel-star-item-template.html', 
		'config',
		'models/star-model',
		'text!templates/modal-template.html', 
		'services/StarMeUpServices'				
		],

function($, _, Backbone, starTemplate, Config, StarModel, modalTemplate, smuServices) {

	'use strict';

	Config.setUp();
	var StarView = Backbone.View.extend({		
		className : '',
		template : _.template(starTemplate),
		modalTemplate : _.template(modalTemplate),
		star : {},		

		initialize : function(star) {		
			this.star = star;
			this.$main = $("#adminPanelStar");
		},
		
		render : function() {
			this.star.imageId = smuServices
					.getImage(this.star.imageId);

			var model = {
				star : this.star
			};

			this.$el = this.template({
				model : model
			});
			$(this.$main).i18n($.i18n.options);
		}
	});
	return StarView;
});
