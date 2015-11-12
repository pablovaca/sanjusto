/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/new-treatment-template.html',
    'text!templates/searchCustomers-template.html',
    'collections/users-collection',
    'config',
    'services/APIServices',
    'typeahead'
], function ($, _, Backbone, newTreatmentTemplate, searchTemplate, UsersCollection, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentFormView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(newTreatmentTemplate),
        searchTemplate : _.template(searchTemplate),
        container : 'centerPanel',
        typeAheadCustomersCallback: {},
        typeAheadBranchesCallback: {},
        employeesCollection: {},

        initialize : function(action, treatmentId) {
            this.$main = this.$('#' + this.container);
            console.log("Action " + action);
            console.log("id: " + treatmentId);
            this.employeesCollection = new UsersCollection();
            this.listenTo(this.employeesCollection, 'ready', this.render);
        },

        events : {
            "typeahead:selected #customerSearch": "searchListenerCustomer",
            "typeahead:selected #branchSearch": "searchListenerBranch"
        },

        render : function() {
            if (!this.employeesCollection.isReady) {
                return;
            }
            var model = {
                employees : this.employeesCollection.toJSON()
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
            $('#branchSearch .typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3
                },
                {
                    name: 'branches',
                    source: _.bind(this.searchBranches, this),
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
                                type : "BRANCH"
                            };

                            return this.searchTemplate({model:model});
                          }, this)
                    }
                });
            $('#branchSearch').on('blur', _.bind(this.branchSearchBlur, this));
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
            console.log("customer blur");
            $('#customerSearch').val($('#treatmentCustomer').val());
        },

        searchBranches: function (search, callback) {
            this.typeAheadBranchesCallback = callback;
            api.locateBranches(_.bind(this.branchesAreLocated, this), '%' + search + '%');
        },

        branchesAreLocated: function (result, status, message) {
            if (status === "OK") {
                this.typeAheadBranchesCallback(result);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        branchSearchBlur: function (evt) {
            $('#branchSearch').val($('#treatmentBranch').val());
        },

        searchListenerCustomer : function (jqobj, item, srcname) {
            $('#customerId').val(item.id);
            $('#customerName').html(item.name);
        },

        searchListenerBranch : function (jqobj, item, srcname) {
            $('#branchId').val(item.id);
            $('#branchName').html(item.name);
        }
    });

    return TreatmentFormView;
});