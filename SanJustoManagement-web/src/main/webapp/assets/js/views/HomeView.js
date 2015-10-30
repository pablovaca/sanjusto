/*global define*/
define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/home-template.html",
    "config",
    "services/APIServices"
], function ($, _, Backbone, homeTemplate, Config, apiServices) {

    "use strict";

    /**
     * Singleton Pattern
     */
    var instance = null;

    Config.setUp();

    var HomeView = Backbone.View.extend({
        el: '#app',
        className: 'row',
        template: _.template(homeTemplate),
        treatmentsView : {},
        customersView : {},
        branchesView : {},

        initialize: function () {
            this.$main = this.$('#mainView');
        },

        events: {
            "click .js-click-treatments": "internalNavigation",
            "click .js-click-customers": "internalNavigation",
            "click .js-click-branches": "internalNavigation"
        },

        render: function () {
            $('#mainView').html('');

            var model = {
            };

            apiServices.initializeLanguage();
            this.$main.html(this.template({
                model: model
            }));

        },

        internalNavigation: function (event) {
            var cssClass = $(event.target).attr('class');
            if (cssClass === 'js-click-treatments') {
                this.treatments(event);
                this.currentLocation = 'treatments';
                return;
            };
            if (cssClass === 'js-click-customers') {
                this.customers(event);
                this.currentLocation = 'customers';
                return;
            };
            if (cssClass === 'js-click-branches') {
                this.branches(event);
                this.currentLocation = 'branches';
                return;
            };
        },

        treatments: function (evt) {
            if(evt){
                evt.preventDefault();
            }

            this.renderTreatmentsView();
        },

        renderTreatmentsView: function () {
            require(['views/HomeView', 'views/TreatmentsView', 'backbone'], function (HomeView, TreatmentsView, Backbone) {
                HomeView.treatmentsView = new TreatmentsView();
                HomeView.treatmentsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        customers: function (evt) {
            if(evt){
                evt.preventDefault();
            }

            this.renderCustomersView();
        },

        renderCustomersView: function () {
            require(['views/HomeView', 'views/CustomersView', 'backbone'], function (HomeView, CustomersView, Backbone) {
                HomeView.customersView = new CustomersView();
                HomeView.customersView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        branches: function (evt) {
            if(evt){
                evt.preventDefault();
            }

            this.renderBranchesView();
        },

        renderBranchesView: function () {
            require(['views/HomeView', 'views/BranchesView', 'backbone'], function (HomeView, BranchesView, Backbone) {
                HomeView.branchesView = new BranchesView();
                HomeView.branchesView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        errorFunc : function(){
            apiServices.clearCookies();
            Backbone.history.navigate('/login',{trigger: true, replace: true});
        }
    });

    HomeView.getInstance = function () {
        if (instance === null) {
            instance = new HomeView();
        }
        return instance;
    }

    return HomeView.getInstance();
});
