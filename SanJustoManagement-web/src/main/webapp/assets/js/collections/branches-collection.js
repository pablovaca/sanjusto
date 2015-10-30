define([
    "jquery",
    "underscore",
    "backbone",
    "models/branch-model",
    "services/APIServices"
], function($, _, Backbone,BranchModel, api){
    var Branches = Backbone.Collection.extend({
        defaults: {
            isReady:false,
            totalRows:0,
            page:0,
            pageSize: api.defaultPageSize()
        },

        initialize: function(){
        },

        callPage : function(pageNro) {
            this.reset();
            if (!pageNro) {
                pageNro = this.page;
            }
            api.getAllBranches(_.bind(this.fillCollection, this),pageNro);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.total > 0){
                    this.totalRows = result.total;
                    this.page = result.pageable.page;
                    this.pageSize = result.pageable.size;
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
                name: branch.name,
                startDate: branch.startDate,
                address: branch.address,
                neighborhood: branch.neighborhood,
                city: branch.city,
                phone: branch.phone,
                customerId: branch.customer.id,
                customerName: branch.customer.name
            });
        }
    });

    return Branches;

});