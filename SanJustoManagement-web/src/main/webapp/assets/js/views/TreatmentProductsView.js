/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/treatments-products-template.html',
    'collections/products-collection',
    'collections/treatmentProducts-collection',
    'models/treatmentProducts-model',
    'config',
    'services/APIServices'
], function ($, _, Backbone, treatmentProductsTemplate, ProductsCollection,
            TreatmentProductsCollection, TreatmentModel, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentProductView = Backbone.View.extend({
        className : 'row',
        template : _.template(treatmentProductsTemplate),
        productsCollection: {},
        treatmentProductsCollection: {},
        treatmentProducts: {},
        productList: {},

        initialize : function(treatmentId) {
            this.productsCollection = new ProductsCollection();
            this.listenTo(this.productsCollection, 'ready', this.render);
            this.treatmentProductsCollection = new TreatmentProductsCollection(treatmentId);
            this.listenTo(this.treatmentProductsCollection, 'ready', this.render);
        },

        events : {
            "click .js-delete-treatment-product":"removeProduct",
            "click .js-add-treatment-product":"addProduct"
        },

        removeProduct : function(evt) {
            evt.preventDefault();
            var id=$(evt.target).data('id');
            if (id >= 0) {
                var treatmentProductArray={};
                var counter=-1;
                _.each(this.treatmentProductsCollection.toJSON(),function(product, index){
                    if (id == product.id) {
                        this.treatmentProductsCollection.remove(product);
                    }
                },this);
                this.render();
            }
        },

        addProduct : function(evt) {
            evt.preventDefault();
            var productId = $("#treatmentProductId").val();
            var qty = $("#treatmentProductsQty").val();
            var product = this.findProductInList(productId);
            var treatmentProduct = new TreatmentModel({
                                          id: product.id,
                                          productName: product.name,
                                          quantity: qty,
                                          unitName: product.unit.shortName
                                      });
            this.treatmentProductsCollection.add(treatmentProduct);
            this.render();
        },

        findProductInList : function(productId) {
            var productFound;
            _.each(this.productList,function(product){
                if (productId == product.id) {
                    productFound = product;
                }
            },this);
            return productFound;
        },

        trimProductList : function() {
            var position=-1;
            _.each(this.productsCollection.toJSON(),function(product){
                var exists = false;
                _.each(this.treatmentProductsCollection.toJSON(),function(treatmentProduct){
                    if (product.id==treatmentProduct.id) {
                        exists=true;
                    }
                },this);
                if (!exists) {
                    position++;
                    this.productList[position]=product;
                }
            }, this);
        },

        render : function() {
            if (!this.productsCollection.isReady || !this.treatmentProductsCollection.isReady) {
                return;
            }
            this.trimProductList();
            var model = {
                treatmentProducts : this.treatmentProductsCollection.toJSON(),
                products : this.productList
            };
            this.$el.html(this.template({
                model : model
            }));
            this.$el.i18n($.i18n.options);
        }
    });

    return TreatmentProductView;
});