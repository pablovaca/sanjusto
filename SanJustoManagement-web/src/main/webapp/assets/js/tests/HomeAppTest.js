_.templateSettings = {
    evaluate    : /<\?([\s\S]+?)\?>/g,
    interpolate : /<\?=([\s\S]+?)\?>/g
};


$(function () {

    var view = new HomeView ();
    
    $('#app').html(view.render().el);
});