define([
    'jquery',
    'underscore',
    'backbone',
    'models/periodStar-model',
    'services/StarMeUpServices'
], function($, _, Backbone, PeriodStarsModel, smuServices){
    var periodStars = Backbone.Collection.extend({
    	defaults: {
            isReady:false
        },

        initialize: function(){
            smuServices.getStarsPeriodsAvailable(_.bind(this.fillCollection, this));
        },
        
        fillCollection: function(result, status, message){
        	if (status == "OK") {
	            if(result && result.length > 0){
	                _.each(result,function(element,index){
	                    this.add(new PeriodStarsModel({
	                        id: element.id,
	                        organization: element.organization,
	                        maxStarToGive: element.maxStarToGive,
	                        startDatePeriod: _.toLocalDate(element.startDatePeriod),
	                        startDateToShow: _.formatDate(_.toLocalDate(element.startDatePeriod)),
	                        periodValue: element.periodValue,
	                        periodUnit: element.periodUnit
	                    }))
	                }, this);
	            }
	            this.isReady = true;
	            this.trigger('ready');
            } else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
        }
    });

    return periodStars;
  
});