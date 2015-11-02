define([
    "jquery",
    "underscore",
    "backbone",
    "models/customer-model",
    "services/APIServices"
], function($, _, Backbone,CustomerModel, api){
    var Customers = Backbone.Collection.extend({
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
                pageNro = this.defaults.page;
            }
            api.getAllCustomers(_.bind(this.fillCollection, this),pageNro);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.total > 0){
                    this.totalRows = result.total;
                    this.page = result.pageable.page;
                    this.pageSize = result.pageable.size;
                    _.each(result.content,function(element){
                        this.add(this.initializeCustomerModel(element));
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

        initializeCustomerModel: function(customer){
            return new CustomerModel({
                id: customer.id,
                name: customer.name,
                startDate: customer.startDate,
                address: customer.address,
                neighborhood: customer.neighborhood,
                city: customer.city,
                phone: customer.phone,
                email: customer.email
            });
        }
    });

    return Customers;

});