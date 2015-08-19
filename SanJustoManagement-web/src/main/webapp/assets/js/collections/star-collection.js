define([
    "jquery",
    "underscore",
    "backbone",
    "models/star-model",
    "services/StarMeUpServices"
], function($, _, Backbone,StarModel, smuServices){
    var Stars = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        // specify Base Widget model
        // model: Star
        initialize: function(models, options){
            if(options && options.length > 0){
                _.each(options,function(element,index){
                    this.add(this.initializeStarModel(element));
                }, this);
                this.isReady = true;
                this.trigger('ready');
            }
            else{
                //we use the smuService as a re
                smuServices.getOrganizationValues(_.bind(this.fillCollection, this), false);
            }
        },
        
        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.length > 0){
                    _.each(result,function(element,index){
                        this.add(this.initializeStarModel(element));
                    }, this);
                }
                this.isReady = true;
                this.trigger('ready');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },
        
        initializeStarModel: function(organizationValue){
            return new StarModel({
                id: organizationValue.id,
                name: organizationValue.name,
                nameShowed: organizationValue.nameShowed,
                imageId: organizationValue.imageId,
                description: organizationValue.description,
                descriptionShowed: organizationValue.descriptionShowed,
                enabled: organizationValue.enabled,
                imageUrl: smuServices.getStarImage(organizationValue.imageId)
            });
        }
    });

    return Stars;
  
});