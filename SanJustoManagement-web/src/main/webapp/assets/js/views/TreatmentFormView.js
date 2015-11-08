/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/new-treatment-template.html',
    'text!templates/searchCustomers-template.html',
    'config',
    'services/APIServices',
    'typeahead'
], function ($, _, Backbone, newTreatmentTemplate, searchTemplate, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentFormView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(newTreatmentTemplate),
        searchTemplate : _.template(searchTemplate),
        container : 'centerPanel',
        typeAheadCallback: {},

        initialize : function(action, treatmentId) {
            this.$main = this.$('#' + this.container);
            console.log("Action " + action);
            console.log("id: " + treatmentId);
            this.render();
        },

        events : {
        },

        render : function() {
            var model = {
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
                                name : data.name
                            };

                            return this.searchTemplate({model:model});
                          }, this)
                    }
                });
            $('#customerSearch').on('blur', _.bind(this.customerSearchBlur, this));
        },

        searchCustomers: function (search, callback) {
            this.typeAheadCallback = callback;
            api.locateCustomers(_.bind(this.customersAreLocated, this), '%' + search + '%');
        },

        customersAreLocated: function (result, status, message) {
            if (status === "OK") {
                this.typeAheadCallback(result);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        customerSearchBlur: function () {
            $('#customerSearch').val('');
        }
    });

    return TreatmentFormView;
});