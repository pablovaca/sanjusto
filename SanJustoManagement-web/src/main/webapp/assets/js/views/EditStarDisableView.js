/*globant define*/
define([ 'jquery', 
         'underscore', 
         'backbone',
		'text!templates/adminPanel-star-enable-template.html', 
		'config',
		'collections/star-collection', 
		'services/StarMeUpServices',
		'views/StarView',
		'models/star-model'
		],

function($, _, Backbone, AdminPanelStarEnableTemplate, Config, StarsCollection,
		smuServices, StarView, StarModel) {

	'use strict';

	Config.setUp();
	var EditStarDisableView = Backbone.View.extend({
		el: '#app',		
		className : '',
		template : _.template(AdminPanelStarEnableTemplate),
		container : '',
		starsCollection : {},
		counterStarsEnabled : 0,

		initialize : function(container) {
			this.$main = this.$('#disabledStarView');
			this.container = container;
			this.starsCollection = new StarsCollection();

			this.listenTo(this.starsCollection, 'ready', this.render);
		},

		render : function() {
			if (!(this.starsCollection.isReady)) {
				return;
			}
			var model = {
				star : this.starsCollection.toJSON()
			};
			this.countStars(model.star);			
			this.$main.html('');
			var starModel = new StarModel({
				id : -1,
				imageId : 0,
				imageUrl : smuServices.getStarImage(0),
				enabled : false,	
				name : $.t("translation:admin.mainStarPage.createStarLabel")
//				name : 'Create Star1'
			})
			this.renderStar(starModel.toJSON());			
            _.each(model.star, function (star) {
            	if(!star.enabled){
            		this.renderStar(star);
            	}
            }, this); 
           
            this.$main.find('.js-enable-star').on('click',_.bind(this.enableStar, this));            
            
            if(this.counterStarsEnabled >= 10){
            	$('.js-enable-star').addClass('disabled');
            }
            
            $(this.$main).i18n($.i18n.options);
		},
		renderStar : function(star) {
			var starView = new StarView(star);
			starView.render();
			this.$main.append(starView.$el);			
			
		},
		starDisable : function(){
			this.trigger('starEnableDisabled');
		},
		enableStar : function (evt){			
			evt.preventDefault();
			var starId = $(evt.currentTarget).data('id');
			smuServices.enableOrganizationValue(_.bind(this.starDisable,this),starId,true);
		},
		countStars : function(stars) {
			_.each(stars, function (star) {
				if (star.enabled) {
					this.counterStarsEnabled++;					
				}
			},this);
		}
	});

	return EditStarDisableView;

});