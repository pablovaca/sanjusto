define([
    'jquery',
    'underscore',
    'backbone',
    'models/organizationOffice-model',
    'services/StarMeUpServices'
], function($, _, Backbone, OrganizationOfficeModel, smuServices){
    var OrganizationOfficeCollection = Backbone.Collection.extend({
    	defaults: {
    		isReady:false
        },
    	
        // specify Base Widget model
        // model: Star
        initialize: function(){
            // we use the smuService as a re
            smuServices.getOrganizationOffices(_.bind(this.fillCollection, this), true);
        },
        
        fillCollection: function(result, status, message){
            if (status = "OK") {
	            if(result && result.length > 0){
	                _.each(result,function(element,index){
	                    this.add(new OrganizationOfficeModel({
	                        id: element.id,
	                        organizationId: element.organizationId,
	                        name: element.name,
	                        enabled: element.enabled
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

    return OrganizationOfficeCollection;
  
});