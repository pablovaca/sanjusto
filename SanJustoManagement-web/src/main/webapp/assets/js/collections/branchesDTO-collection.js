define([
    "jquery",
    "underscore",
    "backbone",
    "models/branchDTO-model",
    "services/APIServices"
], function($, _, Backbone,BranchModel, api){
    var BranchesDTO = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(){
        },

        callBranchesByCustomer : function(customerId) {
            this.reset();
            api.getBranchesByCustomer(_.bind(this.fillCollection, this),customerId);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                console.log(result);
                if(result && result.length > 0){
                    _.each(result.content,function(element){
                        this.add(this.initializeBranchModel(element));
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

        initializeBranchModel: function(branch){
            return new BranchModel({
                id: branch.id,
                name: branch.name
            });
        }
    });

    return BranchesDTO;

});