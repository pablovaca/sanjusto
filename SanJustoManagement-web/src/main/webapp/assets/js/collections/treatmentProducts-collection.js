define([
    "jquery",
    "underscore",
    "backbone",
    "models/treatmentProducts-model",
    "services/APIServices"
], function($, _, Backbone,TreatmentProductsModel, api){
    var TreatmentProducts = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(treatmentId){
            api.getProductsByTreatment(_.bind(this.fillCollection, this), treatmentId);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                this.reset();
                if(result && result.length > 0){
                    _.each(result,function(element){
                        this.add(this.initializeTreatmentProductModel(element));
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

        initializeTreatmentProductModel: function(treatmentProduct){
            return new TreatmentProductsModel({
                id: treatmentProduct.id,
                productName: treatmentProduct.product.name,
                quantity: treatmentProduct.quantity,
                unitName: treatmentProduct.product.unit.shortName
            });
        }
    });

    return TreatmentProducts;

});