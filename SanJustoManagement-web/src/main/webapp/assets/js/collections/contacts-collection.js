define([
    "jquery",
    "underscore",
    "backbone",
    "models/contact-model",
    "services/APIServices"
], function($, _, Backbone,ContactModel, api){
    var Contacts = Backbone.Collection.extend({
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
            api.getAllContacts(_.bind(this.fillCollection, this),pageNro);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.total > 0){
                    this.totalRows = result.total;
                    this.page = result.pageable.page;
                    this.pageSize = result.pageable.size;
                    _.each(result.content,function(element){
                        this.add(this.initializeContactModel(element));
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

        initializeContactModel: function(contact){
            return new ContactModel({
                id : contact.id,
                firstName : contact.firstName,
                middleName : contact.middleName,
                lastName : contact.lastName,
                phone : contact.phone,
                email : contact.email,
                enabled : contact.enabled,
                customerId : contact.customer.id,
                customerName : contact.customer.name
            });
        }
    });

    return Contacts;

});