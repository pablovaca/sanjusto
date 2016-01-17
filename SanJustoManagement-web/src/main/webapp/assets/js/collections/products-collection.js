define([
    "jquery",
    "underscore",
    "backbone",
    "models/product-model",
    "services/APIServices"
], function($, _, Backbone,ProductModel, api){
    var Types = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(){
            api.getProductsByOrganization(_.bind(this.fillCollection, this));
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                this.reset();
                if(result && result.length > 0){
                    _.each(result,function(element){
                        this.add(this.initializeProductModel(element));
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

        initializeProductModel: function(product){
            return new ProductModel({
                id: product.id,
                name: product.name,
                description: product.description,
                quantity: product.quantity,
                unit: product.unit
            });
        }
    });

    return Types;

});