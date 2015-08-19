/*globant define*/
define(['jquery', 
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
	var EditStarEnableView = Backbone.View.extend({
		el: '#app',		
		className : '',
		template : _.template(AdminPanelStarEnableTemplate),
		container : '',
		starsCollection : {},
		counter:0,
		

		initialize : function(container) {
			this.$main = this.$('#enabledStarView');
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
				id : 0,
				imageId : 0, 
				imageUrl : smuServices.getStarImage(0),
				enabled : true,	
				name : $.t("translation:admin.mainStarPage.createStarLabel"),
				counter : this.counter
			})				 
           
			this.renderStar(starModel.toJSON());			
            _.each(model.star, function (star) {
            	if(star.enabled){
            		this.renderStar(star);
            	}
            }, this);            
            
            this.$main.find('.js-disable-star').on('click',_.bind(this.disableStar, this));

            $(this.$main).i18n($.i18n.options);
		},
		renderStar : function(star) {
			var starView = new StarView(star);
			starView.render();	
			this.$main.append(starView.$el);			
		},
		starEnable : function(){
			this.trigger('starEnableDisabled');
		},
		disableStar : function (evt){
			evt.preventDefault();
			var starId = $(evt.currentTarget).data('id');
			smuServices.enableOrganizationValue(_.bind(this.starEnable,this),starId,false);			
		},
		
		countStars : function(stars) {
			_.each(stars, function (star) {
				if (star.enabled) {
					this.counter++;					
				}
			},this);
		}

	});

	return EditStarEnableView;

});