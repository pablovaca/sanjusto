define([
    "jquery",
    "underscore",
    "backbone",
    "models/treatment-model",
    "services/APIServices"
], function($, _, Backbone,TreatmentModel, api){
    var Treatments = Backbone.Collection.extend({
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
            api.getAllTreatments(_.bind(this.fillCollection, this),pageNro);
        },

        getTreatment : function (treatmentId) {
            this.reset();
            api.getOneTreatment(_.bind(this.fillTreatment, this),treatmentId);
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.total > 0){
                    this.totalRows = result.total;
                    this.page = result.pageable.page;
                    this.pageSize = result.pageable.size;
                    _.each(result.content,function(element){
                        this.add(this.initializeTreatmentModel(element));
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

        fillTreatment: function(result, status, message){
            if (status == "OK") {
                if(result){
                    this.add(this.initializeTreatmentModel(result));
                }
                this.isReady = true;
                this.trigger('ready');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        initializeTreatmentModel: function(treatment){
            var date = new Date(treatment.treatmentDate);
            var month = date.getUTCMonth()+1;
            var strMonth = '00' + month;
            var monthText = strMonth.substring(strMonth.length-2,strMonth.length);
            var day = date.getUTCDate();
            var strDay = '00' + day;
            var dayText = strDay.substring(strDay.length-2,strDay.length);

            return new TreatmentModel({
                id: treatment.id,
                branchId: treatment.branch.id,
                branchName: treatment.branch.name,
                customerId: treatment.branch.customer.id,
                customerName: treatment.branch.customer.name,
                treatmentDate: date,
                treatmentYear: date.getUTCFullYear(),
                treatmentMonth: monthText,
                treatmentDay: dayText,
                userId: treatment.user.id,
                userName: treatment.user.username,
                finished: treatment.finished,
                certified: treatment.certificate,
                motive: treatment.motive.id,
                comments: treatment.comments,
                coordinated: treatment.coordinated
            });
        }
    });

    return Treatments;

});