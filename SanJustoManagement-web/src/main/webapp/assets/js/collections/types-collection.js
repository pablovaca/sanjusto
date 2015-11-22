define([
    "jquery",
    "underscore",
    "backbone",
    "models/type-model",
    "services/APIServices"
], function($, _, Backbone,TypeModel, api){
    var Types = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(){
        },

        getTypes : function(keyType) {
            api.getTypes(_.bind(this.fillCollection, this), keyType);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.length > 0){
                    _.each(result,function(element){
                        this.add(this.initializeTypeModel(element));
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

        initializeTypeModel: function(type){
            return new TypeModel({
                id: type.id,
                type: type.type,
                shortName: type.shortName,
                description: type.description,
                enabled: type.enabled
            });
        }
    });

    return Types;

});