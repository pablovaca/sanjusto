_.templateSettings = {
    evaluate    : /<\?([\s\S]+?)\?>/g,
    interpolate : /<\?=([\s\S]+?)\?>/g
};


$(function () {
    starMeUpServices = new StarMeUpServicesClass();
    initializeHome();
//    starMeUpServices.getOrganizationValues(initializeHome,true);
});