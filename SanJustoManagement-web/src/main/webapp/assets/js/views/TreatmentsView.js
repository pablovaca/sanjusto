/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/treatments-template.html',
    'config',
    'collections/treatments-collection',
    'services/APIServices'
], function ($, _, Backbone, treatmentsTemplate, Config, TreatmentsCollection, api) {
    'use strict';

    Config.setUp();

    var ActivityFeedView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(treatmentsTemplate),
        treatmentsCollection : {},
        container : 'centerPanel',

        initialize : function() {
            this.$main = this.$('#' + this.container);
            this.treatmentsCollection = new TreatmentsCollection();

            this.listenTo(this.treatmentsCollection, 'ready', this.render);

        },

        render : function() {
            if (!this.treatmentsCollection.isReady) {
                return;
            }

            var model = {
                treatments : this.treatmentsCollection.toJSON(),
                totalRows : this.treatmentsCollection.totalRows
            };
            this.$main.html(this.template({
                model : model
            }));
            this.$main.i18n($.i18n.options);
        }


    });

    return ActivityFeedView;
});