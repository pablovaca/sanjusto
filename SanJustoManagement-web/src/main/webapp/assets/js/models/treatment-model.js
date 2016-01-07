define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var Treatment = Backbone.Model.extend({

        defaults: {
            id: null,
            branchId: null,
            branchName: null,
            customerId: null,
            customerName: null,
            treatmentDate: null,
            treatmentYear: null,
            treatmentMonth: null,
            treatmentDay: null,
            userId: null,
            userName: null,
            finished: null,
            certified: null,
            motive: null,
            comments: null,
            coordinated: null,
            products:null
        }
    });

    return Treatment;

});