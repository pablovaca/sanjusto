/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/periodStar-template.html',
	'config',
    'collections/periodStar-collection',
    'views/PeriodStarView',
    'services/StarMeUpServices'
], function ($, _, Backbone, PeriodStarTemplate, Config, PeriodStarCollection, PeriodStarView, Smu) {
	'use strict';

	Config.setUp();
        
	var PeriodStarListView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(PeriodStarTemplate),
		periodStarCollection : {},
		container : '',
		
		initialize : function(container) {
			this.container = container;
			this.$main = this.$('#' + container);
			this.periodStarCollection = new PeriodStarCollection();
			this.listenTo(this.periodStarCollection, 'ready', this.render);
			//this.render();
		},
	    
		render : function() {
			if (!this.periodStarCollection.isReady) {
				return;
			}

            if (this.periodStarCollection.length>0) {
            	
    			var model = {
					periodStars : this.periodStarCollection.toJSON()
				};
				this.$main.html(this.template());
	            _.each(model.periodStars, function (periodStar) {
	                this.renderPeriodStar(periodStar);
	            }, this);
            }
            
		},

		renderPeriodStar : function(periodStar){
		    var periodStarView=new PeriodStarView(periodStar);    
		    this.$main.append(periodStarView.$el);
		    periodStarView.render();
		}


	});
	
	return PeriodStarListView;
});
	