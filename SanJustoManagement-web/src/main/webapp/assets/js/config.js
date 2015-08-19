/*
 * underscore templates configurator
 */

define([
    'underscore', 
    'jquery'
], 
function(_, jQuery){
    var setUp = function(){
        // Underscore Configuration
        _.templateSettings = {
            evaluate    : /<\?([\s\S]+?)\?>/g,
            interpolate : /<\?=([\s\S]+?)\?>/g,
            escape : /<\?=([\s\S]+?)\?>/g
        };

        _.noscript = function noscript(strCode){
               var html = $(strCode.bold());
               html.find('script').remove();
             return html.html();
        };
        
        _.toLocalDate = function(dateStringUTC){
            var localDate = new Date(dateStringUTC + ' UTC');
            var options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute : 'numeric', second : 'numeric' };
            return localDate.toLocaleString('en-US',options);
        };
        
        _.todayInLocalTime = function(){
            var now = new Date();

            return _.toLocalDate(now.toUTCString());
        };
        
        _.formatDate = function(date){
            var dateTmp = new Date(date);
            var day = ("0" + dateTmp.getDate()).slice(-2);
            var month = ("0" + (dateTmp.getMonth() + 1)).slice(-2);

            var formatedDate = dateTmp.getFullYear()+"-"+(month)+"-"+(day) ;

            return formatedDate;
        };
        
        _.toTimeSpan = function(dateStringUTC) {
            var localDate = new Date(dateStringUTC + ' UTC');
            var today = new Date();
            var diff = today - localDate;
            var divideBy = {
                y : 31536000000,
                m : 2592000000,
                w : 604800000,
                d : 86400000,
                h : 3600000,
                min : 60000,
                s : 1000
            };

            var timeSpan = '';



            if (diff < 0) {
                timeSpan =  $.t("translation:config.justNow");
            } else {
                var span = Math.floor(diff/divideBy['y']);

                if (span == 0) {
                    span = Math.floor(diff/divideBy['m']);

                    if (span == 0) {
                        span = Math.floor(diff/divideBy['w']);

                        if (span == 0) {
                            span = Math.floor(diff/divideBy['d']);

                            if (span == 0) {
                                span = Math.floor(diff/divideBy['h']);

                                if (span == 0) {
                                    span = Math.floor(diff/divideBy['min']);

                                    if (span == 0) {
                                        span = Math.floor(diff/divideBy['s']);

                                        if(span == 0){
                                            timeSpan = $.t("translation:config.justNow");
                                        }
                                        else if (span == 1) {
                                            timeSpan = $.t("translation:config.sec",{num : span});
                                        } else {
                                            timeSpan = $.t("translation:config.secs",{num : span});
                                        }
                                    } else {
                                        if (span == 1) {
                                            timeSpan = $.t("translation:config.min",{num : span});
                                        } else {
                                            timeSpan = $.t("translation:config.mins",{num : span});
                                        }
                                    }
                                } else {
                                    if (span == 1) {
                                        timeSpan = $.t("translation:config.hour",{num : span});
                                    } else {
                                        timeSpan = $.t("translation:config.hours",{num : span});
                                    }
                                }
                            } else {
                                if (span == 1) {
                                    timeSpan = $.t("translation:config.day",{num : span});
                                } else {
                                    timeSpan = $.t("translation:config.days",{num : span});
                                }
                            }
                        } else {
                            if (span == 1) {
                                timeSpan = $.t("translation:config.week",{num : span});
                            } else {
                                timeSpan = $.t("translation:config.weeks",{num : span});
                            }
                        }
                    } else {
                        if (span == 1) {
                            timeSpan = $.t("translation:config.month",{num : span});
                        } else {
                            timeSpan = $.t("translation:config.months",{num : span});
                        }
                    }
                } else {
                    if (span == 1) {
                        timeSpan = $.t("translation:config.year",{num : span});
                    } else {
                        timeSpan = $.t("translation:config.years",{num : span});
                    }
                }
            }

            return timeSpan;
        };
    };
    
    //Fix scroll bar when modal is closed and prevent body sliding
    _.beautifyModal = function(modalSelector){
        $(modalSelector).on('hide.bs.modal', function () {
            $('body').css('padding-right','0px');
            $('body').removeClass("modal-open");
        });
    };
    return { setUp: setUp }; // or something like that
});