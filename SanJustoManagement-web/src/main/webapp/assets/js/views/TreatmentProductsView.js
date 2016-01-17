/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/treatments-products-template.html',
    'collections/products-collection',
    'collections/treatmentProducts-collection',
    'config',
    'services/APIServices'
], function ($, _, Backbone, treatmentProductsTemplate, ProductsCollection, TreatmentProductsCollection, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentProductView = Backbone.View.extend({
        className : 'row',
        template : _.template(treatmentProductsTemplate),
        productsCollection: {},
        treatmentProductsCollection: {},

        initialize : function(treatmentId) {
            this.productsCollection = new ProductsCollection();
            this.listenTo(this.productsCollection, 'ready', this.render);
            this.treatmentProductsCollection = new TreatmentProductsCollection(treatmentId);
            this.listenTo(this.treatmentProductsCollection, 'ready', this.render);
        },

        events : {
        },

        render : function() {
            if (!this.productsCollection.isReady || !this.treatmentProductsCollection.isReady) {
                return;
            }

            var model = {
                treatmentProducts : this.treatmentProductsCollection.toJSON(),
                products : this.productsCollection.toJSON()
            };
            this.$el.html(this.template({
                model : model
            }));
            this.$el.i18n($.i18n.options);
        }
    });

    return TreatmentProductView;
});