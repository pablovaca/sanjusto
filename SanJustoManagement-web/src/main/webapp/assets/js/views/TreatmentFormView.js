/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/new-treatment-template.html',
    'text!templates/searchCustomers-template.html',
    'collections/users-collection',
    'collections/types-collection',
    'config',
    'services/APIServices',
    'typeahead'
], function ($, _, Backbone, newTreatmentTemplate, searchTemplate, UsersCollection, TypesCollection, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentFormView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(newTreatmentTemplate),
        searchTemplate : _.template(searchTemplate),
        container : 'centerPanel',
        typeAheadCustomersCallback: {},
        employeesCollection: {},
        typesCollection: {},

        initialize : function(action, treatmentId) {
            this.$main = this.$('#' + this.container);
            this.employeesCollection = new UsersCollection();
            this.listenTo(this.employeesCollection, 'ready', this.render);
            this.typesCollection = new TypesCollection();
            this.typesCollection.getTypes('MOTIVES');
            this.listenTo(this.typesCollection, 'ready', this.render);
        },

        events : {
            "typeahead:selected #customerSearch": "searchListenerCustomer"
        },

        render : function() {
            if (!this.employeesCollection.isReady || !this.typesCollection.isReady) {
                return;
            }
            var model = {
                employees : this.employeesCollection.toJSON(),
                motives : this.typesCollection.toJSON()
            };
            this.$main.html(this.template({
                model : model
            }));
            this.$main.i18n($.i18n.options);
            $('#customerSearch .typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3
                },
                {
                    name: 'customers',
                    source: _.bind(this.searchCustomers, this),
                    engine: _,
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                                'Not found',
                            '</div>'
                        ].join('\n'),
                        suggestion : _.bind(function(data){
                            var model = {
                                id : data.id,
                                name : data.name,
                                type : "CUSTOMER"
                            };

                            return this.searchTemplate({model:model});
                          }, this)
                    }
                });
            $('#customerSearch').on('blur', _.bind(this.customerSearchBlur, this));
        },

        searchCustomers: function (search, callback) {
            this.typeAheadCustomersCallback = callback;
            api.locateCustomers(_.bind(this.customersAreLocated, this), '%' + search + '%');
        },

        customersAreLocated: function (result, status, message) {
            if (status === "OK") {
                this.typeAheadCustomersCallback(result);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        customerSearchBlur: function (evt) {
            $('#customerSearch').val($('#treatmentCustomer').val());
        },

        searchListenerCustomer : function (jqobj, item, srcname) {
            $('#customerId').val(item.id);
            $('#customerName').html(item.name);
            api.getBranchesByCustomer(_.bind(this.fillBranchesByCustomer,this),item.id)
        },

        fillBranchesByCustomer : function (result, status, message) {
            console.log("Customer selected " + customerId);
            if (status === "OK") {
                var branches = '<option value=""></option>';
                $('#treatmentBranch').html('');
                _.each(result,function(item) {
                    branches += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                $('#treatmentBranch').html(branches);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        }
    });

    return TreatmentFormView;
});