/*globant define*/
define([
        "jquery",
        "underscore",
        "backbone",
        "text!templates/reports-template.html",
        "text!templates/reportsFilter-template.html",
        "text!templates/modal-template.html",
        "text!templates/pager-template.html",
        "config",
        "collections/organizationOffice-collection",
        "services/StarMeUpServices",
        "collections/star-collection",
        "datePicker"],
function($, _, Backbone, reportsTemplate, reportsFilterTemplate, ModalTemplate, PagerTemplate, Config, OrganizationOfficeCollection, smuServices, StarsCollection) {
    Config.setUp();
    var ReportsPanelView = Backbone.View.extend({
        el : '#app',
        $filterContainer : '',
        $pagerContainerTop : '',
        $pagerContainerBottom : '',
        filterTemplate : _.template(reportsFilterTemplate),
        pagerTemplate : _.template(PagerTemplate),
        template : _.template(reportsTemplate),
        modalTemplate : _.template(ModalTemplate),
        organizationOfficesCollection : {},
        modelPreview : {},
        starsCollection : {},
        selectedDate : {},
        reportDataPreview : {},
        reportType : "",
        totalPages : 0,
        totalRecords : 0,
        recordsPerPage : 50,
        currentPage : 0,
        previewReady : false,
        filterValue : "",
        titleReport : "",
        usersCollection : [],

        initialize : function(container, filterContainer, organizationValues) {
            this.$main = this.$('#' + container);
            console.log("Main " + container)
            this.$filterContainer = this.$('#' + filterContainer);
            console.log("Filter container " + filterContainer)
            this.$main.html('');
            this.userSelection = null;
            this.starsCollection = new StarsCollection(null, organizationValues);
            this.listenTo(this.starsCollection, 'ready', this.renderFilter);
            this.organizationOfficesCollection = new OrganizationOfficeCollection();
            this.listenTo(this.organizationOfficesCollection, 'ready', this.renderFilter);
        },

        render : function() {
            var model;

            if(!this.previewReady){
                model = null;
                this.$main.html(this.template({
                    model : model
                }));
            } else {
                var lastResult = 0;
                if(this.currentPage > 0){
                    lastResult = this.recordsPerPage*this.currentPage;
                }
                model = {
                    preview : this.reportDataPreview,
                    reportType : this.reportType,
                    title : this.titleReport,
                    lastResult : lastResult,
                    filterValue : this.filterValue
                };
                this.$main.html(this.template({
                    model : model
                }));
                this.$pagerContainerTop = this.$main.find('#pager-top');
                this.$pagerContainerBottom = this.$main.find('#pager-bottom');
                this.renderPager(this.$pagerContainerTop);
                this.renderPager(this.$pagerContainerBottom);
            }
            this.filterValue = "";
            this.$main.find('.js-user').on('click', _.bind(this.selectedUser, this));
            this.$main.i18n($.i18n.options);
        },

        renderPager : function (container){
            var lowerLimit = this.currentPage;
            var upperLimit = this.currentPage;

            while(upperLimit - lowerLimit + 1 < 5){
                if(lowerLimit > 0 && (lowerLimit > this.currentPage-2 || this.totalPages - lowerLimit < 5)){
                    lowerLimit--;
                } else {
                    upperLimit ++;
                }
            }
            if(upperLimit > this.totalPages-1){
                upperLimit = this.totalPages-1;
            }

            var model = {
                lowerLimit : lowerLimit,
                upperLimit : upperLimit,
                totalPages : this.totalPages,
                currentPage : this.currentPage
            };

            container.html(this.pagerTemplate({
                model : model
            }));
            container.find('#page-'+(this.currentPage+1)).addClass('active');
            container.find('#firts-page').removeClass('disabled');
            container.find('#firts-page a').removeClass('disabled');
            container.find('#firts-page a span').removeClass('disabled');
            container.find('#previous-page').removeClass('disabled');
            container.find('#previous-page a').removeClass('disabled');
            container.find('#previous-page a span').removeClass('disabled');
            container.find('#last-page').removeClass('disabled');
            container.find('#last-page a').removeClass('disabled');
            container.find('#last-page a span').removeClass('disabled');
            container.find('#next-page').removeClass('disabled');
            container.find('#next-page a').removeClass('disabled');
            container.find('#next-page a span').removeClass('disabled');

            if(this.currentPage === 0){
                container.find('#firts-page').addClass('disabled');
                container.find('#firts-page a').addClass('disabled');
                container.find('#firts-page a span').addClass('disabled');
                container.find('#previous-page').addClass('disabled');
                container.find('#previous-page a').addClass('disabled');
                container.find('#previous-page a span').addClass('disabled');
            }
            if(this.currentPage === this.totalPages-1){
                container.find('#last-page').addClass('disabled');
                container.find('#last-page a').addClass('disabled');
                container.find('#last-page a span').addClass('disabled');
                container.find('#next-page').addClass('disabled');
                container.find('#next-page a').addClass('disabled');
                container.find('#next-page a span').addClass('disabled');
            }
            container.find('.js-page').on('click', _.bind(this.pageNavigation, this));
            container.find('.js-navigate').on('click', _.bind(this.pageNavigation, this));
        },

        renderFilter : function(){
            if(!this.organizationOfficesCollection.isReady || !this.starsCollection.isReady){
                return;
            };            

            var stars = this.starsCollection.toJSON();
            var locations = this.organizationOfficesCollection.toJSON();
            var filterModel = {
                locations : locations,
                stars : stars,
                isTalentModuleEnabled : smuServices.isTalentModuleEnabled()
            };
            this.$filterContainer.html(this.filterTemplate({
                model : filterModel
            }));
            this.$filterContainer.i18n($.i18n.options);

            var nowTemp = new Date();
            var from = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            var to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            from.setDate(from.getDate() - 29);
            this.$filterContainer.find('#reportDateFrom').datetimepicker({format:'DD/MM/YYYY', defaultDate:from, maxDate:to, showTodayButton:true});
            this.$filterContainer.find('#reportDateTo').datetimepicker({format:'DD/MM/YYYY', defaultDate:to, minDate:from, showTodayButton:true});
            this.$filterContainer.find("#reportDateFrom").on("dp.change",_.bind(function (e) {
                if(e.date != null){
                    this.$filterContainer.find('#reportDateTo').data("DateTimePicker").minDate(e.date);
                }
                this.refreshPreviewReport();
            }, this));
            this.$filterContainer.find("#reportDateTo").on("dp.change",_.bind(function (e) {
                if(e.date != null){
                    this.$filterContainer.find('#reportDateFrom').data("DateTimePicker").maxDate(e.date);
                }
                this.refreshPreviewReport();
            }, this));
            this.$filterContainer.find('#reportLocation').on('change', _.bind(this.refreshPreviewReport, this));
            this.$filterContainer.find('#reportStarType').on('change', _.bind(this.refreshPreviewReport, this));
            this.$filterContainer.find('.js-preview').on('click', _.bind(this.previewReport, this));
            this.$filterContainer.find('.js-export').on('click', _.bind(this.validateAndExportReport, this));
            this.$filterContainer.find('#reportLocation').on('change',_.bind(this.filtersValidation, this));
            this.$filterContainer.find('#reportStarType').on('change',_.bind(this.filtersValidation, this));
            console.log("REPORTS FILTER")
        },

        filtersValidation : function(){
            var officeId = this.$filterContainer.find('#reportLocation').val();
            var valueId = this.$filterContainer.find('#reportStarType').val();

            if(!(valueId === 0 || valueId === -1 || valueId === -2)){
                this.$filterContainer.find('#topStarsValidation').fadeIn('slow');
            }
            else{
                this.$filterContainer.find('#topStarsValidation').fadeOut('slow');
            }
            if(officeId !== 0){
                this.$filterContainer.find('#locationsValidation').fadeIn('slow');
            }else{
                this.$filterContainer.find('#locationsValidation').fadeOut('slow');
            }
        },

        refreshPreviewReport : function(){
            if(!this.reportType && this.reportType === ""){
                return;
            }
            this.previewReport(null, 0);
        },

        previewReport : function(event, page){
            if(event){
                event.preventDefault();
                this.reportType = $(event.target).data('id');
            }

            if(this.reportType === 'senders'){
                this.titleReport = $.t("reports.filters.topSenders");
            }
            if(this.reportType === 'receivers'){
                this.titleReport = $.t("reports.filters.topReceivers");
            }
            if(this.reportType === 'locations'){
                this.titleReport = $.t("reports.filters.topLocations");
            }
            if(this.reportType === 'stars'){
                this.titleReport = $.t("reports.filters.topStars");
            }
            var period = this.getSelectedPeriod();
            var from = period.from;
            var to = period.to;
            var officeId = this.$filterContainer.find('#reportLocation').val();
            var valueId = this.$filterContainer.find('#reportStarType').val();
            if(!page && page == null){
                page = 0;
            }
            if(valueId !== 0){
                if(valueId === -1){
                    this.filterValue = "Core";
                } else if(valueId === -2){
                    this.filterValue = "Skills";
                } else if(this.reportType !== 'stars'){
                    this.filterValue = this.$filterContainer.find("#reportStarType option:selected").text();
                }
            }
            this.currentPage = page;
            this.reportDataPreview = null;
            this.disableFilters(true);
            smuServices.previewReport(_.bind(this.callBackReport, this), this.currentPage, this.recordsPerPage, from, to, officeId, valueId, this.reportType);
        },

        disableFilters : function(disable){
            this.$filterContainer.find('#reportLocation').prop('disabled', disable);
            this.$filterContainer.find('#reportStarType').prop('disabled', disable);
            this.$filterContainer.find("#reportDateFrom").children().prop('disabled', disable);
            this.$filterContainer.find("#reportDateTo").children().prop('disabled', disable);
        },

        validateAndExportReport : function(event){
            this.reportType = $(event.target).data('id');
            var period = this.getSelectedPeriod();
            var from = period.from;
            var to = period.to;
            var officeId = this.$filterContainer.find('#reportLocation').val();
            var valueId = this.$filterContainer.find('#reportStarType').val();
            var invalidFilters = '';

            if(from == null){
                invalidFilters = invalidFilters + $.t("reports.filters.from") + ', ';
            }
            if(to == null){
                invalidFilters = invalidFilters + $.t("reports.filters.to") + ', ';
            }
            if(officeId == null){
                invalidFilters = invalidFilters + $.t("reports.filters.locations") + ', ';
            }
            if(valueId == null){
                invalidFilters = invalidFilters + $.t("reports.filters.starType") + ', ';
            }
            if(invalidFilters.length > 3){
                invalidFilters = invalidFilters.substring(0, invalidFilters.length - 2);
            }
            if(invalidFilters.length > 0){
                this.renderModal($.t("reports.messages.filtersWithoutValue") + ' ' + invalidFilters);
                return;
            }
            this.disableFilters(true);
            smuServices.previewReport(_.bind(this.callBackPreviewExport, this), 0, 0, from, to, officeId, valueId, this.reportType);
        },

        callBackPreviewExport : function(result, status, message){
            if(status === 'OK'){
                if(result != null && result.total > 0){
                    if(result.total <= 1000){
                        this.exportReport();
                    }
                    else{
                        this.renderModal($.t('reports.messages.reportTooLarge', { rows : result.total }), _.bind(this.exportReport, this));
                    }
                }
                else{
                    this.renderModal($.t("reports.messages.noResults"));
                }
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }

            this.disableFilters(false);
        },

        exportReport : function(){
            var period = this.getSelectedPeriod();
            var from = period.from;
            var to = period.to;
            var officeId = this.$filterContainer.find('#reportLocation').val();
            var valueId = this.$filterContainer.find('#reportStarType').val();
            smuServices.exportReport(null, from, to, officeId, valueId, this.reportType);
        },

        callBackReport : function(result, status, message){
            if(status === 'OK'){
                if(result != null && result.total >0){
                    _.each(result,function(opt, index){

                        if(index === 'receivers' || index === 'senders'){
                            _.each(opt, function(element){
                                    element[0].profileImageId = smuServices.getProfileImage(element[0].profileImageId);
                                    this.usersCollection.push(element[0]);
                            }, this);
                            this.reportDataPreview = opt;
                       }
                       if(index === 'stars'){
                            _.each(opt, function(element){
                                    element.imageId = smuServices.getStarImage(element.imageId);
                            });
                            this.reportDataPreview = opt;
                       }
                       if(index === 'locations'){
                            this.reportDataPreview = opt;
                       }
                       if(index === 'total'){
                        this.totalRecords = opt;
                        this.totalPages = Math.ceil(this.totalRecords/this.recordsPerPage);
                       }
                    }, this);
                    this.previewReady = true;
            }
                this.render();
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
            this.disableFilters(false);
        },

        getSelectedPeriod : function(){
            var from = 1;
            var to = ((new Date).getDate + 1).getTime();

            if(this.$filterContainer.find('#reportDateFrom').data("DateTimePicker").date()){
                from = this.$filterContainer.find('#reportDateFrom').data("DateTimePicker").date().toDate().getTime();
            }

            if(this.$filterContainer.find('#reportDateTo').data("DateTimePicker").date()){
                to = ((this.$filterContainer.find('#reportDateTo').data("DateTimePicker").date().toDate()).getDate + 1).getTime();
            }

            return {from: from, to: to};
        },

        renderModal : function (message, acceptCallback){
            var $modal = this.$filterContainer.find('#reportMessagesModal');
            $modal.html(message);
            var modalModel = {
                    prefix : 'innerReportMessages'
            };
            $modal.html(this.modalTemplate({
                model : modalModel
            }));

            $modal.find('#innerReportMessagesModalTitle').hide();
            $modal.find('#innerReportMessagesModalBody').html('<p>'+ message +'</p>');
            var acceptButtonText = $.t("reports.buttons.accept");

            if(acceptCallback){
                var noButtonText = $.t("reports.buttons.reportTooLargeNoProcced");
                $('<button type="button" class="btn btn-default btn-cancel" data-dismiss="modal" id="innerReportMessagesModalCancelButton">' + noButtonText + '</button>').insertAfter($modal.find('#innerReportMessagesModalAcceptButton'));
                $modal.find('#innerReportMessagesModalAcceptButton').on('click', acceptCallback);
                acceptButtonText = $.t("reports.buttons.reportTooLargeYesProcced");
            }
            $modal.find('#innerReportMessagesModalAcceptButton').text(acceptButtonText).attr('data-dismiss', 'modal');
            $modal.find('#innerReportMessagesModal').modal('show');
        },

        pageNavigation : function (event){
            event.preventDefault();
            var pageSelected = $(event.target).data('id');

            if(pageSelected == null){
                pageSelected = $(event.target).parent().data('id');
            }
            var e = null;

            if(pageSelected === 'first'){
                this.currentPage = 0;
            }
            if(pageSelected === 'last'){
                this.currentPage = this.totalPages-1;
            }
            if(pageSelected === 'previous' && this.currentPage > 0){
                this.currentPage--;
            }
            if(pageSelected === 'next' && this.currentPage < this.totalPages-1){
                this.currentPage++;
            }
            if(pageSelected >= 0) {
                this.currentPage = pageSelected;
            }
            this.previewReport(e, this.currentPage);
        },

        selectedUser : function(event){
            var selectedUser = {};
            var selectedId = $(event.target).data('id');
            var receivers = this.usersCollection;

            _.each(receivers,function(element){
                if(element.id === selectedId){
                    selectedUser = element;
                }
            });
            this.trigger('userSelection', selectedUser);
        }
    });
    return ReportsPanelView;
});