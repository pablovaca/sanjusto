/*global define*/
'use strict';
define([], function () {

    var token = "";
    var EXPIRE_HOURS = 72;
    var EXPIRE_HOURS_REMEMBER_ME = 2880;
    var COOKIE_CURRENT_USER_MODE = 'currentUserMode';
    var COOKIE_TOKEN_KEY = 'currentToken';
    var COOKIE_REMEMBER_PASSWORD = 'rememberPassword';
    var COOKIE_REMEMBER_ME = 'rememberMe';
    var COOKIE_DOMAIN = 'domainStarMeUp';
    var STATIC_CONTENT = "assets/content/";
    var DOMAIN = "starmeup";
    var CUSTOMER_USER = {
        username : 'customer@qastarmeup.com',
        password : 'rootuserstarmeup'
    };
    var notificationTimmer = {};
    var notificationPeriod = 20; //Seconds
    var domain = "starmeup";
    var login = 0;
    var roles = {};
    var errorsHandler = {};
    var starCountNotificationTimmer = {};
    var starCountNotifications = false;
    var starCountNotificationsFlag = false;
    var starCountNotificationsFrom = '';
    var starCountNotificationsTo = '';
    var lastPullToServerNotifications = (new Date()).getTime();
    var appVersion = '1';
    var origin = 'w';
    var modules = {};
    var loginLanguage = '';
    var userLanguage = '';
    var organizationLanguage = '';
    var settings = {};
    var talentsTree = {};
    var webCloseNoti = false;
    var additionalInfo = {};
    var loggedUser = {};
    var customerMode = false;


    var defaultSettings = {
            apiUrl : '/starmeup-api'
    };

    /**
     * Disabling console log
     */ 
    var consoleHolder = console;
    window.starMeUpDebug = function(bool){
        if(!bool){
            consoleHolder = console;
            if(window.console){
                window.console = {};
                window.console.log = function(){};
            }
        }
    };
    window.starMeUpDebug(true);

    /**
     * Singleton Pattern
     */
    var instance = null;
    function StarMeUpServices(){
        if(instance !== null){
            throw new Error('Cannot instantiate more than one instance, use: StarMeUpServices.getInstance()');
        }
    }

    StarMeUpServices.getInstance = function(){
        if(instance === null){
            instance = new StarMeUpServices();
            token = getCookie(COOKIE_TOKEN_KEY);
        }
        return instance;
    }

    //
    // private methods
    //


    try
    {
        if(appSettings != null){           
            settings = appSettings;                   
        }else{
            settings = defaultSettings;
        }
    }
    catch(ex){
        settings = defaultSettings;
        window.starMeUpDebug(true);
    }

    function logServerError(status, message){
        message = (message == null || message === '' ? 'Server Error' : message);
        status = (status == null || status === '' ? 'FAIL' : status);
        console.log('[Status: ' + status + ', Message: ' + message + ']');
    }

    function relocateToMaintenancePage(){
        window.location = 'pages/errors/maintenance.html';
    }

    function notifyErrorsToHandler(message)
    {
        if(errorsHandler != null){
            try{
                errorsHandler.error(message);
            }
            catch(e){
                //Error was no handle
            }
        }
    }

    function getUserLanguage(){
        var language = 'en';

        if(userLanguage && userLanguage.length > 0){
            language = userLanguage;
        }
        else if(language === '' && organizationLanguage && organizationLanguage.length > 0){
            language = organizationLanguage;
        }
        
        return language;
    }
    
    function callAdminAction(action,params,functionToCall)
    {
        callAction("admin",action,params,functionToCall);
    }

    function callStellarAction(action,params,functionToCall,handleErrors)
    {
        callAction("stellar",action,params,functionToCall,handleErrors);
    }

    function callImageAction(action,params,functionToCall)
    {
        callAction("image",action,params,functionToCall);
    }

    function callUserAction(action,params,functionToCall)
    {
        callAction("user",action,params,functionToCall);
    }

    function callTalentAction(action, params, functionToCall)
    {
        callAction("talent", action, params, functionToCall);
    }

    function callCsvAction(controller, action,params)
    {
        var request={};
        request.token=token;
        request.v=appVersion;
        request.o=origin;
        request.language=getUserLanguage();

        $.each(params, function(index, value){
            if(index >= 0){
                var paramName="p"+(index+1);
                request[paramName]=value;
            }
            else{
                request[index]=value;
            }
        });

        var url = settings.apiUrl + "/" + controller + "/" + action;
        var param = "param=" + encodeURIComponent(JSON.stringify(request));

        document.location = url+'?'+param;
    }

    function callCsvActionV2 (controller, action, params)
    {
        var data = "";

        for(var key in params) {
            data += key + "=" +params[key] + "&";
        }
        data = data.substring(0, data.length-1);

        var url = settings.apiUrl + "/" + controller + "/" + action;

        downloadCsv(url,data);
    }

    function downloadCsv (url, data, method){
        if( url && data ){
            data = typeof data === 'string' ? data : jQuery.param(data);
            var inputs = '';
            jQuery.each(data.split('&'), function(){
                var pair = this.split('=');
                inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />';
            });
            jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
            .appendTo('body').submit().remove();
        }
    }

    function callNonStandarAction(controller, action,params,functionToCall)
    {
        var request={};
        request.token=token;
        request.v=appVersion;
        request.o=origin;
        request.language=getUserLanguage();

        $.each(params, function(index, value){
            if(index >= 0){
                var paramName="p"+(index+1);
                request[paramName]=value;
            }
            else{
                request[index]=value;
            }
        });

        $.ajax({
            url:settings.apiUrl + "/" + controller + "/" + action,
            type: "POST",
            async:true,
            data:"param=" + encodeURIComponent(JSON.stringify(request)),
            success:function(data,status,jqxhr){
                if (data.status === "OK") {
                if (functionToCall) {
                        functionToCall(data.result, data.status, data.message);
                    }
                } else if(data.status === "MAINTENANCE"){
                    relocateToMaintenancePage();
                }
                else
                {
                    logServerError(data.status,data.message);
                    functionToCall(data.result, data.status, data.message);
                }
            },
            error:function(jqxhr,status,message){                
                logServerError(status,message);
                notifyErrorsToHandler(jqxhr);
            },
            dataType:"json"
        });
    }

    function callAction (service,action,params,functionToCall,handleErrors) {
    
        var request={};
        request.action=action;
        request.token=token;
        request.v=appVersion;
        request.o=origin;
        request.language=getUserLanguage();

        for(var i=0;i<params.length;i++)
        {
            var paramName="p"+(i+1);
            request[paramName]=params[i];
        }

        $.ajax({
            url:settings.apiUrl + "/"+service+"/action",
            type: "POST",
            async:true,
            data:"param=" + encodeURIComponent(JSON.stringify(request)),
            success:function(data,status,jqxhr){
                if (data.status === "OK") {
                    if(data.token != null && data.token !== ''){
                        token=data.token;
                        setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                    }
                    if (functionToCall) {
                        functionToCall(data.result, data.status, data.message);
                    }
                } else if(data.status === "MAINTENANCE"){
                    relocateToMaintenancePage();
                }
                else
                {
                    logServerError(data.status,data.message);
                    functionToCall(data.result, data.status, data.message);
                }
            },
            error:function(jqxhr,status,message){                              
                logServerError(status,message);

                if(handleErrors == null || handleErrors === 'undefined' || handleErrors){
                    notifyErrorsToHandler(jqxhr);
                }
            },
            dataType:"json"
         });
    }

    function getBasicRequest() {
        var request={};
        request.v=appVersion;
        request.o=origin;
        return request;
    }

    function replacejscssfile(oldfilename, newfilename, filetype){
        var targetelement=((filetype==="js")? "script" : (filetype==="css")? "link" : "none");
        var targetattr=((filetype==="js")? "src" : (filetype==="css")? "href" : "none");
        var allsuspects=document.getElementsByTagName(targetelement);
        for (var i=allsuspects.length; i>=0; i--){ 
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!==-1){
                var newelement=createjscssfile(newfilename, filetype);
                allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i]);
            }
        }
    }

    function removejscssfile(filename, filetype){
        var targetelement=((filetype==="js")? "script" : (filetype==="css")? "link" : "none");
        var targetattr=((filetype==="js")? "src" : (filetype==="css")? "href" : "none");
        var allsuspects=document.getElementsByTagName(targetelement);
        for (var i=allsuspects.length; i>=0; i--){ 
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!==-1)
            allsuspects[i].parentNode.removeChild(allsuspects[i]);
        }
    }

    function callStellarService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/stellar",typeCall,urlAction,request,functionToCall,handleErrors);
    }

    function callTalentService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/talent",typeCall,urlAction,request,functionToCall,handleErrors);
    }

    function callAdministrationService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/admin",typeCall,urlAction,request,functionToCall,handleErrors);
    }

    function callCustomerModeService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/customer", typeCall, urlAction, request, functionToCall, handleErrors);
    }

    function callBackEnd (service,typeCall, urlAction, request, functionToCall, handleErrors) {
        var urlService=settings.apiUrl + "/"+ service + urlAction;

        $.ajax({
            url:urlService,
            headers:{
                'token':token,
                'language':getUserLanguage()
            },
            type: typeCall,
            async:true,
            data:request,
            success:function(data,status,jqxhr){
                if (data.status === "OK") {
                    if(data.token != null && data.token !== ''){
                        token=data.token;
                        setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                    }
                    if (functionToCall) {
                        functionToCall(data.result, data.status, data.message);
                    }
                } else if(data.status === "MAINTENANCE"){
                    relocateToMaintenancePage();
                }
                else
                {
                    logServerError(data.status,data.message);
                    functionToCall(data.result, data.status, data.message);
                }
            },
            error:function(jqxhr,status,message){               
                logServerError(status,message);

                if(handleErrors == null || handleErrors === 'undefined' || handleErrors){
                    notifyErrorsToHandler(jqxhr);
                }
            },
            dataType:"json"
         });
    }

    function setCookie(cname,cvalue,exHours) {
        var d = new Date();
        d.setTime(d.getTime() + (exHours*60*60*1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname+"="+cvalue+"; "+expires;
    }

    function getCookie(cname) {
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            if(c.indexOf(cname) !== -1){
                return c.split('=')[1];
            }
        }
        return "";
    }

    function setToken(tokenParam) {
        setCookie(COOKIE_TOKEN_KEY, tokenParam, 1);
    }
    
    function intializeNotificationTiming(functionToCall)
    {
        if(notificationTimmer){
            clearInterval(notificationTimmer);
        }

        notificationTimmer=setInterval(_.bind(function(){
            var request=getBasicRequest();
            request.fromDate=lastPullToServerNotifications;
            callStellarService("GET","/notifications/pull",request,function(data,status,jqxhr){
                if (status == "OK") {
                    functionToCall(data);
                    lastPullToServerNotifications = data.responseDate;
                } else if (data.message == "NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS'); 
                } else {
                    logServerError(data.status,data.message);
                    clearInterval(notificationTimmer);
                }
            },false);
        }, this), notificationPeriod * 1000);
    }

    function intializeStarCountNotificationTiming(functionToCall)
    {
        starCountNotificationsFlag = true;
        if(!starCountNotifications){
            starCountNotifications = true;
            starCountNotificationTimmer=setInterval(_.bind(function(){
                if(starCountNotificationsFlag){
                    pullStarCountNotification(function(data,status,jqxhr){
                        if (status === "OK") {
                            if(data != null){
                                if (functionToCall) {
                                    functionToCall(data, status, jqxhr);
                                }
                            }
                        } else {
                            logServerError(data.status,data.message);
                            clearInterval(starCountNotificationTimmer);
                        }
                    })
                }
            }, this), notificationPeriod * 1000);
        }
    }

    function pullStarCountNotification(functionToCall)
    {
         var organizationOffice = 0;
         var organizationValue = 0;
         var request=getBasicRequest();
         request.organizationOffice=organizationOffice;
         request.organizationValue=organizationValue;
         request.fromStringDate=starCountNotificationsFrom;
         request.toStringDate=starCountNotificationsTo;
         callStellarService("GET","/organization/total/stars",request,functionToCall,false);
    }

    function domainExists(domain) {
        var http = new XMLHttpRequest();
        var url = window.location.protocol + "//" + window.location.host + window.location.pathname + domain + "/css/main.css";
        http.open('HEAD', url, false);
        http.send(); 
        if(http.status!=404){
            return true;
        } else {
            return false;
        }
    }

    //
    // public methods through prototyping
    //
    StarMeUpServices.prototype = {

        isLoggedIn:function(){
              token = getCookie(COOKIE_TOKEN_KEY);
          return (token && token.length>10);
        },

        setUpErrorsHandler: function(handler)
        {
            errorsHandler = handler;
        },

        webNotify : function(value)
        {
            if(value){
                this.webCloseNoti = value;
            }
            return this.webCloseNoti;
        },

        setCurrentUserMode: function(value){
            setCookie(COOKIE_CURRENT_USER_MODE, value, '72');
        },

        getCurrentUserMode:function(){
            return getCookie(COOKIE_CURRENT_USER_MODE);
        },

        getCUSelected : function(){
            return getCookie('cmUserSelected');
        },

        //service to login whit customer mode account

        switchToCustomerMode : function(userSelected){            
            if(!userSelected){
                return;
            }
            setCookie('cmUserSelected', userSelected, '72');            
            this.getCustomerUserByTokenWithRights(_.bind(function(result, status, message){
                if (status == "OK") {                     
                    if(result.customerMode){
                        this.setCurrentUserMode('cm');                    
                        Backbone.history.navigate('/customer', {trigger: true, replace: true});
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }, this));
        },

        clearCookies : function(){
            token = '';
            setCookie(COOKIE_TOKEN_KEY, '', '');
            setCookie(COOKIE_CURRENT_USER_MODE, '', '');
            setCookie('cmUserSelected', '', '');
            this.stopServerNotifications();
        },

        authenticateUserFromExternalToken:function (functionToCall, externalToken,rememberMe) {
            var request={};
            request.externalToken=externalToken;
            request.v=appVersion;
            request.o=origin;
            request.rememberMe=rememberMe;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/authenticateUserFromExternalToken",
                headers:{
                    'language':loginLanguage
                },
                type: "POST",
                async:false,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        domain = data.additionalInfo.organization.domain;
                        login = data.additionalInfo.organization.login;
                        additionalInfo = data.additionalInfo;
                        loggedUser = data.result;

                        if (rememberMe) {
                            setCookie(COOKIE_TOKEN_KEY, token, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie(COOKIE_REMEMBER_ME, true, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie('rememberUsername', email, 72);
                        } else {
                            setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                            setCookie(COOKIE_REMEMBER_ME, false, EXPIRE_HOURS);
                            setCookie('rememberUsername', '', 1);
                        }

                        if (functionToCall) {
                            functionToCall(data.result,data.status,data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                    
                    logServerError(status,message);
                },

                dataType:"json"
             });
        },
        
        authenticateUserFromAuthorizationCode:function (functionToCall, authorizationCode, rememberMe) {
            var request={};
            request.authorizationCode=authorizationCode;
            request.v=appVersion;
            request.o=origin;
            request.rememberMe=rememberMe;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/authenticateUserFromAuthorizationCode",
                headers:{
                    'language':loginLanguage
                },
                type: "POST",
                async:false,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        domain = data.additionalInfo.organization.domain;
                        login = data.additionalInfo.organization.login;
                        additionalInfo = data.additionalInfo;
                        loggedUser = data.result;

                        if (rememberMe) {
                            setCookie(COOKIE_TOKEN_KEY, token, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie(COOKIE_REMEMBER_ME, true, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie('rememberUsername', email, 72);
                        } else {
                            setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                            setCookie(COOKIE_REMEMBER_ME, false, EXPIRE_HOURS);
                            setCookie('rememberUsername', '', 1);
                        }

                        if (functionToCall) {
                            functionToCall(data.result,data.status,data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){
                    logServerError(status,message);
                },

                dataType:"json"
             });
        },
        
        login:function (functionToCall, email,password,rememberMe) {
            var request={};
            request.email=email;
            request.password=password;
            request.v=appVersion;
            request.o=origin;
            request.rememberMe=rememberMe;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/authenticateuser",
                headers:{
                    'language':loginLanguage
                },
                type: "POST",
                async:false,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        domain = data.additionalInfo.organization.domain;
                        login = data.additionalInfo.organization.login;
                        additionalInfo = data.additionalInfo;
                        loggedUser = data.result;

                        if (rememberMe) {
                            setCookie(COOKIE_TOKEN_KEY, token, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie(COOKIE_REMEMBER_ME, true, EXPIRE_HOURS_REMEMBER_ME);
                            setCookie('rememberUsername', email, 72);
                        } else {
                            setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                            setCookie(COOKIE_REMEMBER_ME, false, EXPIRE_HOURS);
                            setCookie('rememberUsername', '', 1);
                        }

                        if (functionToCall) {
                            functionToCall(data.result,data.status,data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){
                    logServerError(status,message);
                },

                dataType:"json"
             });
        },

        trial:function (functionToCall, firstName, lastName, email, password) {
            var request={};
            request.firstName=firstName;
            request.lastName=lastName;
            request.email=email;
            request.password=password;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/register/trial/users",
                type: "POST",
                async:false,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        if (functionToCall) {
                            functionToCall(data.result,data.status,data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){
                    logServerError(status,message);
                },
                
                dataType:"json"
             });
        },

        setRememberMe:function(cname,cvalue,exHours){
            setCookie(cname,cvalue,exHours);            
        },

        getRememberMe:function(cname){
            return getCookie(cname);
        },

        loadCss : function (url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }, 

        getUserByToken:function(functionToCall){
            var request={};
            request.v=appVersion;
            request.o=origin;

            var rememberMe = getCookie(COOKIE_REMEMBER_ME);
            if (rememberMe) {
                request.rememberMe=rememberMe;
            }

            if (!token || token.length<=10) {
                token="1234567890";
            }

            $.ajax({
                url: settings.apiUrl + "/v2/sec/userwithtoken",
                headers:{
                    "token":token
                },
                type: "GET",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {                        
                        if (!data.additionalInfo.organization.webOn 
                            && !data.result.roles) {
                            var location = window.location.protocol + "//" + window.location.host + "/webOffPage.html";
                            window.location.replace(location);
                        } else {
                            token=data.token;
                            domain = data.additionalInfo.organization.domain;
                            login = data.additionalInfo.organization.login;
                            additionalInfo = data.additionalInfo;
                            loggedUser = data.result;

                            var route = STATIC_CONTENT+domain;
                            if(!domainExists(route)){
                                domain = DOMAIN;
                            }

                            setCookie(COOKIE_DOMAIN,domain,EXPIRE_HOURS);
                            login = data.additionalInfo.organization.login;
                            roles = data.result.roles;
                            modules = data.additionalInfo.modules;

                            userLanguage = '';
                            organizationLanguage = '';

                            if(data.result && data.result.language && data.result.language.code && data.result.language.code.length > 0){
                                userLanguage = data.result.language.code;
                            }

                            if(data.additionalInfo.organization && data.additionalInfo.organization.language && data.additionalInfo.organization.language.code && data.additionalInfo.organization.language.code.length > 0){
                                organizationLanguage = data.additionalInfo.organization.language.code;
                            }

                            if (functionToCall) {
                                functionToCall(data.result, data.status, data.message, data.additionalInfo);
                            }
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                
                    logServerError(status,message);
                    notifyErrorsToHandler(jqxhr);
                },
                dataType:"json"
             });
        },

        getCustomerUserByTokenWithRights:function(functionToCall){
            var request={};
            request.v=appVersion;
            request.o=origin;              

            if (!token || token.length<=10) {
                token="1234567890";
            }

            $.ajax({
                url: settings.apiUrl + "/v2/sec/customermode/userwithtoken",
                headers:{
                    "token":token
                },
                type: "GET",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {             
                    
                        token=data.token;
                        domain = data.additionalInfo.organization.domain;
                        login = data.additionalInfo.organization.login;
                        additionalInfo = data.additionalInfo;
                        loggedUser = data.result;

                        var route = STATIC_CONTENT+domain;
                        if(!domainExists(route)){
                            domain = DOMAIN;
                        }

                        setCookie(COOKIE_TOKEN_KEY, token, '72');

                        setCookie(COOKIE_DOMAIN,domain,EXPIRE_HOURS);
                        login = data.additionalInfo.organization.login;
                        roles = data.result.roles;
                        modules = data.additionalInfo.modules;

                        userLanguage = '';
                        organizationLanguage = '';

                        if(data.result && data.result.language && data.result.language.code && data.result.language.code.length > 0){
                            userLanguage = data.result.language.code;
                        }

                        if(data.additionalInfo.organization && data.additionalInfo.organization.language && data.additionalInfo.organization.language.code && data.additionalInfo.organization.language.code.length > 0){
                            organizationLanguage = data.additionalInfo.organization.language.code;
                        }

                        if (functionToCall) {
                            functionToCall(data.result, data.status, data.message, data.additionalInfo);
                        }
                        
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                  
                    logServerError(status,message);
                    notifyErrorsToHandler(jqxhr);
                },
                dataType:"json"
             });
        },

        setDomain:function(functionToCall,domainUrl){
            var request={};
            request.v=appVersion;
            request.o=origin;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/domains/"+domainUrl,
                type: "GET",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK" && data.result != null) {
                        domain = data.result.domain;
                        var route = STATIC_CONTENT+domain;
                        if(!domainExists(route)){
                            domain = DOMAIN;
                        }

                        setCookie(COOKIE_DOMAIN,domain,EXPIRE_HOURS);
                        login = data.result.login;
                        functionToCall(data.result, data.status, data.message);
                    } else {
                        data.status = "FAIL";
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                    
                    logServerError(status,message);
                    notifyErrorsToHandler(jqxhr);
                },
                dataType:"json"
             });
        },

        resetPassword:function(functionToCall, email){
            var request={};
            request.email=email;
            request.v=appVersion;
            request.o=origin;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/resetpassword",
                type: "POST",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        if (functionToCall) {
                            functionToCall(data.result, data.status, data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                    
                    logServerError(status,message);
                    notifyErrorsToHandler(jqxhr);
                },
                dataType:"json"
             });
        },

        changePassword : function(functionToCall, oldPassword, newPassword){            
            var request={};
            request.oldPassword=oldPassword;
            request.newPassword=newPassword;
            request.v=appVersion;
            request.o=origin;

            $.ajax({
                url:settings.apiUrl + "/v2/sec/changepassword",
                headers:{
                    "token":token
                },
                type: "POST",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        if (functionToCall) {
                            functionToCall(data.result, data.status, data.message);
                        }
                    } else if(data.status === "MAINTENANCE"){
                        relocateToMaintenancePage();
                    }
                    else
                    {
                        logServerError(data.status,data.message);
                        functionToCall(data.result, data.status, data.message);
                    }
                },
                error:function(jqxhr,status,message){                    
                    logServerError(status,message);
                    notifyErrorsToHandler(jqxhr);
                },
                dataType:"json"
             });

        },

        getDomain:function() {
            if (getCookie(COOKIE_DOMAIN)!='') {
                return STATIC_CONTENT+getCookie(COOKIE_DOMAIN);
            } else {
                return STATIC_CONTENT+DOMAIN;
            }
        },

        getTypeLogin:function() {
            return login;
        },

        getAdditionalInfo:function() {
            return additionalInfo;
        },

        getLoggedUser:function() {
            return loggedUser;
        },

        getUserLanguage : function(){
            return getUserLanguage();
        },

        initializeLoginLanguage:function() {
            loginLanguage = '';
            var userLanguage = navigator.language || navigator.userLanguage;
            if(userLanguage && userLanguage.length > 0 && userLanguage.split('-')[0].length > 0){
                loginLanguage = userLanguage.split('-')[0];
            } else{
                loginLanguage = 'en';
            }

            $.i18n.init({ lng: loginLanguage, fallbackLng: 'en', resGetPath: 'assets/js/locales/__lng__-__ns__.json', ns: 'translation', getAsync: false, defaultValueFromContent: false });    
        },

        initializeLandingLanguage:function(language) {
            $.i18n.init({ lng: language, fallbackLng: 'en', resGetPath: 'assets/js/locales/__lng__-__ns__.json', ns: 'translation', getAsync: false, defaultValueFromContent: false });
        },

        initializeHomeLanguage:function() {
            var language = '';
            var fallbackLanguages = [];

            if(userLanguage && userLanguage.length > 0){
                language = userLanguage;
            }
            else if(language === '' && organizationLanguage && organizationLanguage.length > 0){
                language = organizationLanguage;
            }
            else{
                language = 'en';
            }

            if(organizationLanguage && organizationLanguage.length > 0){
                fallbackLanguages.push(organizationLanguage);
            }

            fallbackLanguages.push('en');
            $.i18n.init({ lng: language, fallbackLng: fallbackLanguages, resGetPath: 'assets/js/locales/__lng__-__ns__.json', ns: 'translation', getAsync: false, defaultValueFromContent: false });
        },

        removeCss : function(){
            removejscssfile("main.css","css");
        },

        cssExists : function(filename){
            var targetattr = 'href';
            var allsuspects=document.getElementsByTagName('link')
            for (var i=allsuspects.length; i>=0; i--){ 
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
                return true;
            }   

            return false;
        },

        userHasRights: function(functionality){
            var hasRight = false;
            _.each(roles, function(item, index){
                if(!hasRight && functionality === 'SuperAdmin' && item.role === 'SUPERADMIN'){
                    hasRight = true;
                }
                if(!hasRight && functionality === 'AdminPanel' && (item.role === 'SUPERADMIN' || item.role === 'ORGANIZATION_ADMIN')){
                    hasRight = true;
                }

                if(!hasRight && functionality === 'DashBoard' && (item.role === 'ORGANIZATION_DASHBOARD')){
                    hasRight = true;
                }

                if(!hasRight && functionality === 'Reports' && (item.role === 'ORGANIZATION_ADMIN' || item.role === 'ORGANIZATION_HR')){
                    hasRight = true;
                }

                if(!hasRight && functionality === 'LeaderboardReport' && (item.role === 'SUPERADMIN' || item.role === 'ORGANIZATION_ADMIN' || item.role === 'ORGANIZATION_HR')){
                    hasRight = true;
                }

                if(!hasRight && functionality === 'Analytic' && (item.role === 'ORGANIZATION_ANALYTIC')){                    
                    hasRight = true;
                }

                if(!hasRight && functionality === 'CustomerMode' && item.role === 'ORGANIZATION_ADMIN'){
                    hasRight = true;
                }
            });

            return hasRight;
        },
        
        isTalentModuleEnabled: function(){
            var enabled = false;

            _.each(modules, function(item, index){
                if(item.name == 'TM_TALENT'){
                    enabled = true;
                }
            });

            return enabled;
        },
        
        initializeTalentTree: function(){
            talentsTree = {};
            this.getTalentTree(function (result, status, message) {
                if (status == "OK") {
                    if (result != null) {
                        talentsTree = result;
                    }
                } else {
                    console.log(message);
                }
            });
        },
        
        searchInTalentsTree : function(search){
            var result = [];

            var level = 1;

            search = search.toLowerCase();

            if(talentsTree != null && talentsTree.children != null){
                _.each(talentsTree.children, function(item){
                    var resultingArray = this.searchInTalent(item, search, level);
                    if(resultingArray != null){
                        if(resultingArray.length > 0){
                            _.each(resultingArray, function(resultingItem){
                                result.push(resultingItem);
                            });
                        }
                        else{
                            result.push(resultingArray);
                        }
                    }
                }, this);
            }

            return result;
        },
        searchInTalent : function(item, search, level){
            var resultArray = null;

            if(item.name.toLowerCase().indexOf(search) != -1){
                resultArray = [];
                var result = {};
                result.id = item.id;
                result.name = item.name;
                result.imageId = item.imageId;
                result.level = level;
                resultArray.push(result);
            }

            if(item.children != null){
                _.each(item.children, function(child){
                    var resultingChildren = this.searchInTalent(child, search, level + 1);
                    if(resultingChildren != null){
                        if(resultArray == null){
                            resultArray = [];
                            var result = {};
                            result.id = item.id;
                            result.name = item.name;
                            result.imageId = item.imageId;
                            result.level = level;
                            resultArray.push(result);
                        }

                        if(resultingChildren.length > 0){
                            _.each(resultingChildren, function(resultingChild){
                                resultArray.push(resultingChild);
                            }, this);
                        }
                        else{
                            resultArray.push(resultingChildren);
                        }
                    }
                }, this);
            }

            return resultArray;
        },
        
        /* ********************************
         *
         *  Administration Service Methods
         *
         * ********************************
         */

        getModules:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callAdministrationService("GET", "/modules", request, functionToCall, handleErrors);
        },

        getLanguages:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callAdministrationService("GET", "/languages", request, functionToCall, handleErrors);
        },

        getCountries:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callAdministrationService("GET", "/countries", request, functionToCall, handleErrors);
        },

        addOrganization:function (functionToCall, name, subscriptionDate, tin, address, city, countryId,languageId,adminUser, handleErrors)
        {
            var request=getBasicRequest();
            request.name=name;
            request.subscriptionDate=subscriptionDate;
            request.tin=tin;
            request.address=address;
            request.city=city;
            request.languageId=languageId;
            request.adminUser=adminUser;
            callAdministrationService("POST", "/organization/" + countryId , request, functionToCall, handleErrors);
        },

        enableOrganization:function (functionToCall,orgId, enabled, handleErrors)
        {
            var request=getBasicRequest();
            request.enabled=enabled;
            callAdministrationService("POST", "/organization/enable/" + orgId, request, functionToCall, handleErrors);
        },

        enableOrganizationModule:function (functionToCall,moduleId, orgId, enabled, handleErrors)
        {
            var request=getBasicRequest();
            request.orgId=orgId;
            request.enabled=enabled;
            callAdministrationService("POST", "/organizationmodule/enable/" + moduleId, request, functionToCall, handleErrors);
        },

        setOrganizationProperty:function (functionToCall,property, value, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.value=value;
            callAdministrationService("POST", "/organizationproperty", request, functionToCall, handleErrors);
        },

        setOrganizationPropertyLong:function (functionToCall,property, value, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.value=value;
            callAdministrationService("POST", "/organizationpropertylong", request, functionToCall, handleErrors);
        },

        setOrganizationPropertyDate:function (functionToCall,property, value, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.value=value;
            callAdministrationService("POST", "/organizationpropertydate", request, functionToCall, handleErrors);
        },

        getOrganizationProperty:function (functionToCall,property, defaultValue, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.defaultValue=defaultValue;
            callAdministrationService("GET", "/organizationproperty", request, functionToCall, handleErrors);
        },

        getOrganizationPropertyLong:function (functionToCall,property, defaultValue, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.defaultValue=defaultValue;
            callAdministrationService("GET", "/organizationpropertylong", request, functionToCall, handleErrors);
        },

        getOrganizationPropertyDate:function (functionToCall,property, defaultValue, handleErrors)
        {
            var request=getBasicRequest();
            request.property=property;
            request.defaultValue=defaultValue;
            callAdministrationService("GET", "/organizationpropertydate", request, functionToCall, handleErrors);
        },

        insertOrganizationUsers:function (functionToCall,organization, defaultLanguage, is, handleErrors)
        {
            var request=getBasicRequest();
            request.organization=organization;
            request.defaultLanguage=defaultLanguage;
            request.is=is;
            callAdministrationService("POST", "/organizationusers", request, functionToCall, handleErrors);
        },

        getOrganizationUsers:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callAdministrationService("GET", "/organizationusers", request, functionToCall, handleErrors);
        },

        setMaxStarsToGive:function (functionToCall,max, handleErrors)
        {
            var request=getBasicRequest();
            request.max=max;
            callAdministrationService("POST", "/maxstarstogive", request, functionToCall, handleErrors);
        },

        setStarStartingPeriod:function (functionToCall,date, handleErrors)
        {
            var request=getBasicRequest();
            request.date=date.getTime();
            callAdministrationService("POST", "/starstartingperiod", request, functionToCall, handleErrors);
        },

        addOrganizationValue:function (functionToCall,name, description, handleErrors)
        {
            var request=getBasicRequest();
            request.name=name;
            request.description=description;
            callAdministrationService("POST", "/organizationvalue", request, functionToCall, handleErrors);
        },

        enableOrganizationValue:function (functionToCall,valueId, enabled, handleErrors)
        {
            var request=getBasicRequest();
            request.valueId=valueId;
            request.enabled=enabled;
            callAdministrationService("POST", "/organizationvalue/enable", request, functionToCall, handleErrors);
        },

        getStarsPeriodsAvailable:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callAdministrationService("GET", "/starsperiodsavailable", request, functionToCall, handleErrors);
        },

        starsreport:function(from, to)
        {
            var params = {};
            params.token = token;
            params.v=appVersion;
            params.o=origin;
            params.from = from;
            params.to = to;

            callCsvActionV2("v2/admin","viewstarsreport",params);
        },

        previewReport:function(functionToCall, page, size, from, to, officeId, valueId, reportType)
        {
            var request=getBasicRequest();
            request.page=page;
            request.size=size;
            request.from=from;
            request.to=to;
            request.officeId=officeId;
            request.valueId=valueId;
            request.reportType=reportType;
            callAdministrationService("GET","/reports/preview",request,functionToCall,null);
        },

        exportReport:function(functionToCall, from, to, officeId, valueId, reportType)
        {
            var params = {};
            params.token = token;
            params.v=appVersion;
            params.o=origin;
            params.from = from;
            params.to = to;
            params.officeId = officeId;
            params.valueId = valueId;
            params.reportType = reportType;

            callCsvActionV2("v2/admin","reports/export",params);
        },

        saveStarsPeriod : function(functionToCall, periodId, maxStarToGive, periodUnit, periodValue, startDatePeriod, handleErrors)
        {
            var request = getBasicRequest();
            request.maxStarToGive = maxStarToGive;
            request.periodUnit = periodUnit;
            request.periodValue = periodValue;
            request.startDatePeriod = startDatePeriod;
            callAdministrationService("POST", "/starsperiod/" + periodId, request, functionToCall, handleErrors);
        },
        privateMode : function (functionToCall, state, handleErrors)
        {
            var request = getBasicRequest();
            callAdministrationService("POST", "/organization/privatemode/"+state, request, functionToCall, handleErrors);
        },

        webOn : function (functionToCall, state, handleErrors)
        {
            var request = getBasicRequest();
            callAdministrationService("POST", "/organization/webclient/"+state, request, functionToCall, handleErrors);
        },

        messageWebOn : function (functionToCall, state, handleErrors)
        {
            var request = getBasicRequest();
            callAdministrationService("POST", "/organization/weboffmessage/"+state, request, functionToCall, handleErrors);
        },

        setEulaEnabled : function(functionToCall, state)
        {
            var request = getBasicRequest();
            callAdministrationService("POST", "/organization/eula/"+state, request, null);
        },

        getUsersFiles : function(functionToCall, page, size, handleErrors)
        {
            var request = getBasicRequest();
            request.page=page;
            request.size=size;
            callAdministrationService("GET", "/usersFiles", request, functionToCall, handleErrors);
        },
        
        uploadUsersFile : function (event, data)
        {
            $(event.target).fileupload('option','url',settings.apiUrl + '/v2/admin/usersFiles/upload');

            var request={
                fileName: data.files[0].name,
                token: token
            };

            data.formData = request;
            data.headers = {
                'language':getUserLanguage()
            };
            data.paramName = 'file';
            data.submit();
        },

        assignRoles : function (functionToCall, users, roles)
        {
            var request = getBasicRequest();
            request.users = JSON.stringify(users);
            request.roles = JSON.stringify(roles);
            callAdministrationService("POST", "/users/roles", request, functionToCall, null);
        },

        getRoles : function (functionToCall, users, roles, orgId) 
        {
            var request = getBasicRequest();
            request.users = JSON.stringify(users);
            request.roles = JSON.stringify(roles);
            if(!orgId)
                orgId=0;
            request.orgId = orgId;
            callAdministrationService("GET", "/users/roles", request, functionToCall, null);
        },

        removeRole : function (functionToCall, userId, roleId)
        {
            var request = getBasicRequest();
            callAdministrationService("POST", "/user/"+userId+"/removerole/"+roleId, request, functionToCall, null);
        },

        getAvailableRoles : function (functionToCall)
        {
            var request = getBasicRequest();
            callAdministrationService("GET", "/roles", request, functionToCall, null);
        },

        getAvailableOrganizations : function(functionToCall)
        {
            var request = getBasicRequest();
            callAdministrationService("GET", "/organizations", request, functionToCall, null);
        },        

        setOrganizationEmailSettings : function(functionToCall, valueId)
        {
            var request = getBasicRequest();
            if(!valueId && valueId < 0){
                valueId = 0
            }
            request.valueId = valueId;
            callAdministrationService("POST", "/emailsettings", request, functionToCall, null);
        },

        importEula : function (event, data)
        {
            $(event.target).fileupload('option','url',settings.apiUrl + '/v2/admin/eula');
            var file = data.paramName = 'file';            

            var request={
                file: file
            };

            data.formData = request;
            data.headers = {
                'language':getUserLanguage(),
                token: token

            };            
            data.submit();
        },

        /* *************************
         *
         *  Stellar Service Methods
         *
         * *************************
         */

        assignStar:function (functionToCall,emailTo, valueId, notes,handleErrors)
        {
            var request=getBasicRequest();
            request.email=emailTo;
            request.notes=notes;
            callStellarService("POST","/assignstar/"+valueId,request,functionToCall,handleErrors);
        },

        addComment:function (functionToCall,starId, comments,handleErrors)
        {
            var request=getBasicRequest();
            request.comments=comments;
            callStellarService("POST","/stars/"+starId+"/comments",request,functionToCall,handleErrors);
        },

        addLike:function (functionToCall,starId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/stars/"+starId+"/likes",request,functionToCall,handleErrors);
        },

        removeLike:function (functionToCall,commentId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/likes/"+commentId+"/remove",request,functionToCall,handleErrors);
        },

        allActivityFeed:function (functionToCall, userId, firstStarId, page, size, orderBy, filterBy, starId, handleErrors)
        {
            if (!page || page<0) page=0;
            if (!size || size<1) size=50;
            if (!orderBy) orderBy='';
            if (!filterBy) filterBy='';
            if(!firstStarId) firstStarId = 0;
            if(!starId) starId = 0;

            var request=getBasicRequest();
            request.firstStarId = firstStarId,
            request.page=page;
            request.size=size;
            request.orderBy=orderBy;
            request.filterBy=filterBy;

            if (!userId) {
                callStellarService("GET","/stars",request,functionToCall,handleErrors);
            } else if (starId==0) {
                callStellarService("GET","/stars/user/"+userId,request,functionToCall,handleErrors);
            } else {
                callStellarService("GET","/stars/"+starId+"/user/"+userId,request,functionToCall,handleErrors);
            }
        },

        getNotifications:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/notifications",request,functionToCall,handleErrors);
        },

        markAllNotificationsRead:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/notifications/reads",request,functionToCall,handleErrors);
        },

        markOneNotificationsRead:function (functionToCall,notificationId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/notifications/reads/"+notificationId,request,functionToCall,handleErrors);
        },

        markAllNotificationsView:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/notifications/views",request,functionToCall,handleErrors);
        },

        markAllNotificationsRemoved:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/notifications/remove",request,functionToCall,handleErrors);
        },

        markOneNotificationsRemoved:function (functionToCall,notificationId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/notifications/remove/"+notificationId,request,functionToCall,handleErrors);
        },

        getOneActivityFeed:function (functionToCall,starId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/stars/"+starId,request,functionToCall,handleErrors);
        },

        getOrganizationValue:function (functionToCall,valueId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/organizationvalue/"+valueId,request,functionToCall,handleErrors);
        },

        getOrganizationValues:function (functionToCall,onlyEnabled,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/organizationvalues/"+onlyEnabled,request,functionToCall,handleErrors);
        },

        setOrganizationValues:function (functionToCall, organizationValueId, enabled, name, description, imageId,handleErrors)
        {
            var request=getBasicRequest();
            request.organizationValueId=organizationValueId;
            request.enabled=enabled;
            request.name=name;
            request.description=description;
            request.imageId=imageId;
            callStellarService("POST","/organizationvalue",request,functionToCall,handleErrors);
        },

        getStarsGiven:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/starsgiven",request,functionToCall,handleErrors);
        },

        getStarsReceived:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/starsreceived",request,functionToCall,handleErrors);
        },

        getStarsReceivedByUserId:function (functionToCall,userId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/starsreceived/"+userId,request,functionToCall,handleErrors);
        },

        getLeadersBoard:function (functionToCall, size,handleErrors)
        {
            if(!size || size < 0){
                size = 0;
            }

            var request=getBasicRequest();
            request.size=size;
            callStellarService("GET","/toprank/receivers",request,functionToCall,handleErrors);
        },

        getSenderLeadersBoard:function (functionToCall, size, handleErrors)
        {
            if(!size || size < 0){
                size = 0;
            }

            var request=getBasicRequest();
            request.size=size;
            callStellarService("GET","/toprank/senders",request,functionToCall,handleErrors);
        },

        locateUsers:function (functionToCall,searchString,handleErrors)
        {
            var request=getBasicRequest();
            request.searchString=searchString;
            callStellarService("GET","/users",request,functionToCall,handleErrors);
        },

        locateUsersFilterByOrg:function (functionToCall,searchString,filterByOrganization,handleErrors)
        {
            var request=getBasicRequest();
            request.searchString=searchString;
            request.filterByOrganization=filterByOrganization;
            callStellarService("GET","/users/filterbyorganization",request,functionToCall,handleErrors);
        },

        locateUserById:function (functionToCall,userId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/users/"+userId,request,functionToCall,handleErrors);
        },

        getMaxStarsToGive:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/max/stars",request,functionToCall,handleErrors);
        },

        getRemainingStars:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/remainder/stars",request,functionToCall,handleErrors);
        },

        setUserProfileImage:function (functionToCall, userId, fileId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/users/"+userId+"/image/"+fileId,request,functionToCall,handleErrors);
        },

        showComment:function (functionToCall, commentId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/comments/"+commentId+"/show",request,functionToCall,handleErrors);
        },

        hideComment:function (functionToCall, commentId,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("POST","/comments/"+commentId+"/hide",request,functionToCall,handleErrors);
        },

        getStellarDashboard:function (functionToCall, fromDate, toDate, organizationOffice, organizationValue,handleErrors)
        {

            if(!organizationOffice || organizationOffice < 0){
                organizationOffice = 0;
            }

            if(!organizationValue || organizationValue < 0){
                organizationValue = 0;
            }
            var request=getBasicRequest();
            request.organizationOffice=organizationOffice;
            request.organizationValue=organizationValue;
            request.fromDate=fromDate;
            request.toDate=toDate;
            callStellarService("GET","/dashboard",request,functionToCall,handleErrors);
        },

        getLeadersBoardCSV:function(functionToCall, size, from, to, orgValueId, officeId,handleErrors)
        {
            if(!size || size < 0){
                size = 0;
            }

            var request=getBasicRequest();
            request.size=size;
            request.fromDate=from;
            request.toDate=to;
            request.valueId=orgValueId;
            request.officeId=officeId;
            callStellarService("GET","/leaderboard/receivers",request,functionToCall,handleErrors);
        },

        getSenderLeadersBoardCSV:function(functionToCall, size, from, to, orgValueId, officeId,handleErrors)
        {
            if(!size || size < 0){
                size = 0;
            }

            var request=getBasicRequest();
            request.size=size;
            request.fromDate=from;
            request.toDate=to;
            request.valueId=orgValueId;
            request.officeId=officeId;
            callStellarService("GET","/leaderboard/senders",request,functionToCall,handleErrors);
        },

        getOrganizationOffices:function(functionToCall, onlyEnabled,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/organizationoffices/"+onlyEnabled,request,functionToCall,handleErrors);
        },

        getSuggestedUsers:function(functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/users/recommendations/5",request,functionToCall,handleErrors);
        },

        getPreferences:function (functionToCall,handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET","/preferences",request,functionToCall,handleErrors);
        },

        addEmailCredentials:function (functionToCall, email)
        {
            var request=getBasicRequest();
            request.email = email;
            callStellarService("POST","/email/accounts",request,functionToCall,null);
        },

        removeEmailCredentials:function (functionToCall)
        {
            var request=getBasicRequest();
            callStellarService("POST","/email/accounts/remove",request,functionToCall,null);
        },

        addFacebookCredentials:function (functionToCall, fbid)
        {
            var request=getBasicRequest();
            request.accountId = fbid;
            callStellarService("POST","/facebook/accounts",request,functionToCall,null);
        },

        removeFacebookCredentials:function (functionToCall)
        {
            var request=getBasicRequest();
            callStellarService("POST","/facebook/accounts/remove",request,functionToCall,null);
        },

        addTwitterCredentials:function (functionToCall, oauth_token, oauth_token_secret)
        {
            var request=getBasicRequest();
            request.oauthToken = oauth_token;
            request.oauthTokenSecret = oauth_token_secret;
            callStellarService("POST","/twitter/accounts",request,functionToCall,null);
        },

        removeTwitterCredentials:function (functionToCall)
        {
            var request=getBasicRequest();
            callStellarService("POST","/twitter/accounts/remove",request,functionToCall,null);
        },

        addGooglePlusCredentials:function (functionToCall, gpid)
        {
            var request=getBasicRequest();
            request.accountId = gpid;
            callStellarService("POST","/google/accounts",request,functionToCall,null);
        },

        removeGooglePlusCredentials:function (functionToCall)
        {
            var request=getBasicRequest();
            callStellarService("POST","/google/accounts/remove",request,functionToCall,null);
        },

        addlinkedInCredentials:function (functionToCall, lpid)
        {
            var request=getBasicRequest();
            request.accountId = lpid;
            callStellarService("POST","/linkedin/accounts",request,functionToCall,null);
        },

        removelinkedInCredentials:function (functionToCall)
        {
            var request=getBasicRequest();
            callStellarService("POST","/linkedin/accounts/remove",request,functionToCall,null);
        },
        
        changePreferenceAllPushNotifications:function (functionToCall, enabled)
        {
            var request=getBasicRequest();
            request.enabled = enabled;
            callStellarService("POST","/pushNotificationPreferences/all",request,functionToCall,null);
        },

        changePreferenceLikePushNotifications:function (functionToCall, enabled)
        {
            var request=getBasicRequest();
            request.enabled = enabled;
            callStellarService("POST","/pushNotificationPreferences/likes",request,functionToCall,null);
        },
        
        changePreferenceCommentPushNotifications:function (functionToCall, enabled)
        {
            var request=getBasicRequest();
            request.enabled = enabled;
            callStellarService("POST","/pushNotificationPreferences/comments",request,functionToCall,null);
        },
        
        leaderboardreport:function(size, from, to, valueId, leaderboard, officeId)
        {
            if(!size || size < 0){
                size = 0;
            }

            var params = {};
            params.token = token;
            params.v=appVersion;
            params.o=origin;
            params.size = size;
            params.from = from;
            params.to = to;
            params.valueId = valueId;
            params.leaderboard = leaderboard;
            params.officeId = officeId;

            callCsvActionV2("v2/stellar","leaderboard/report",params);
        },

        getLanguagesForConnectedUser:function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callStellarService("GET", "/languages", request,functionToCall,handleErrors);
        },

        getLanguagesForNonConnectedUser:function (functionToCall, languageId, handleErrors)	
        {
            var request=getBasicRequest();
            callStellarService("GET", "/landing/languages/" + languageId, request,functionToCall,handleErrors);
        },

        setLanguageToUser:function (functionToCall, languageId, handleErrors)    
        {
            var request=getBasicRequest();
            callStellarService("POST", "/user/languages/"+languageId, request,functionToCall,handleErrors);
        },

        getLanguagesByLanguageId:function (functionToCall, languageId, handleErrors)    
        {
            var request=getBasicRequest();
            callStellarService("GET", "/languages/"+languageId, request,functionToCall,handleErrors);
        },

        getStarsSummary : function (functionToCall, userId, filterBy, handleErrors)
        {
            var request=getBasicRequest();
            request.userId = userId;
            request.filterBy = filterBy;
            callStellarService("GET", "/stars/summary", request, functionToCall, handleErrors);
        },

        getNumberPeopleGiveStar : function (functionToCall, timeScale,fromDate, toDate, handleErrors)
        {
            var request = getBasicRequest();
            request.timeScale = timeScale;
            request.fromDate = fromDate;
            request.toDate = toDate;
            callStellarService("GET", "/analytics/stars/amount/users", request, functionToCall, null);
        }, 

        getTotalStarSent : function (functionToCall, timeScale,fromDate, toDate, handleErrors)
        {
            var request = getBasicRequest();
            request.timeScale = timeScale;
            request.fromDate = fromDate;
            request.toDate = toDate;
            callStellarService("GET", "/analytics/stars/amount/stars", request, functionToCall, null);
        },

        getPercentageStarsByTime : function (functionToCall, timeScale, fromDate, toDate, handleErrors)
        {
            var request = getBasicRequest();
            request.timeScale = timeScale;
            request.fromDate = fromDate;
            request.toDate = toDate;
            callStellarService("GET", "/analytics/stars/percentage/stars", request, functionToCall, null);
        },

        getAccessByTime : function (functionToCall, timeScale, fromDate, toDate, handleErrors)
        {
            var request = getBasicRequest();
            request.timeScale = timeScale;
            request.fromDate = fromDate;
            request.toDate = toDate;
            callStellarService("GET", "/analytics/user/access", request, functionToCall, null);
        },

        getStarsWithLikesAndComment : function (functionToCall, timeScale, fromDate, toDate, handleErrors)
        {
            var request = getBasicRequest();
            request.timeScale = timeScale;
            request.fromDate = fromDate;
            request.toDate = toDate;
            callStellarService("GET", "/analytics/stars/likesAndComments", request, functionToCall, null);
        },

        getActiveUsers : function (functionToCall, handleErrors)
        {
            var request = getBasicRequest();            
            callStellarService("GET", "/analytics/user/activeUsers", request, functionToCall, null);
        },

        getUsersWithProfilePicture : function(functionToCall, handleErrors)
        {
            var request = getBasicRequest();
            callStellarService("GET", "/analytics/user/withProfilePicture", request, functionToCall, null);
        },

        getAmountUsersWithoutTos : function(functionToCall, handleErrors)
        {
            var request = getBasicRequest();
            callStellarService("GET", "/analytics/user/amountUsersWithoutTos", request, functionToCall, null);
        },

        getEulaText : function(functionToCall)
        {
            var request = getBasicRequest();
            callStellarService("GET", "/eula", request, functionToCall, null);
        },

        setTosRead : function(functionToCall)
        {
            var request = getBasicRequest();
            callStellarService("POST", "/users/tos/read", request, functionToCall, null);
        },

        /* *************************
         *
         *  Talent Service Methods
         *
         * *************************
         */

        locateOrganizationTalents:function(functionToCall, search)
        {
            var request=getBasicRequest();
            request.search=search;
            callTalentService("GET","/organizationtalents",request,functionToCall,null);
        },

        importUserTalentsFromCV:function (functionToCall, skills)
        {
            var request=getBasicRequest();
            request.skills=JSON.stringify(skills);
            callTalentService("POST","/usertalentsfromcv",request,functionToCall,null);
        },
        
        importUserTalentsFromLinkedIn:function (functionToCall, skills)
        {
            var request=getBasicRequest();
            request.skills=JSON.stringify(skills);
            callTalentService("POST","/usertalentsfromlinkedin",request,functionToCall,null);
        },

        assignTalentStar:function(functionToCall, emailTo, valueId, notes)
        {
            var request=getBasicRequest();
            request.emailTo=emailTo;
            request.valueId=valueId;
            request.notes=notes;
            callTalentService("GET","/star/valueid/"+valueId,request,functionToCall,null);
        },

        getTalentStarsReceived:function(functionToCall)
        {
            var request=getBasicRequest();
            callTalentService("GET","/starsreceived",request,functionToCall,null);
        },

        getTalentTree:function(functionToCall)
        {
            var request=getBasicRequest();
            callTalentService("GET","/tree",request,functionToCall,null);
        },

        countStarsByTypeAndUser:function(functionToCall, userId)
        {
            var request=getBasicRequest();
            request.userId=userId;
            callTalentService("GET","/countstarsbytypeanduser/userid/"+userId,request,functionToCall,null);
        },

        countstarsbytypeandusergroupedbylevel : function(functionToCall, userId)
        {
            var request = getBasicRequest();
            callTalentService("GET", "/countstarsbytypeandusergroupedbylevel/userid/"+userId+"/level/1" , request, functionToCall, null);
        },

        countStarsByTypeAndUserIncludingImportedSkills : function(functionToCall, userId)
        {
            var request = getBasicRequest();
            callTalentService("GET", "/countstarsbytypeanduserincludingimportedskills/userid/"+userId, request, functionToCall, null);
        },

        parseCV:function(event, data)
        {
            $(event.target).fileupload('option','url',settings.apiUrl + '/v2/talent/cv');
            var request={
                    fileName: data.files[0].name
            };

            data.formData = request;
            data.headers = {'token':token,'language':getUserLanguage()};
            data.paramName = 'file';
            data.submit();
        },
        
        getSkills : function(functionToCall)
        {
            var request = getBasicRequest();
            callTalentService("GET", "/getSkills", request, functionToCall, null);
        },
        
        setSkills : function(functionToCall, skills)
        {
            var request = getBasicRequest();
            request.skills=JSON.stringify(skills);
            callTalentService("GET", "/setSkills", request, functionToCall, null);
        },


        /* ********************************
         *
         *  Customer Mode Services Methods
         *
         * ********************************
         */

        assignCustomerStar : function(functionToCall,emailTo, valueId)
        {
            var request=getBasicRequest();
            request.emailTo=emailTo;
            request.notes="";
            callCustomerModeService("POST","/assing/star/"+valueId,request,functionToCall,null);
        },

        getUsersToGiveStar : function(functionToCall)
        {
            var request=getBasicRequest();
            callCustomerModeService("GET", "/users", request, functionToCall, null);            
        },

        getCountStarsReceivedByUserId : function(functionToCall, userId) 
        {
            var request = getBasicRequest();
            callCustomerModeService("GET", "/starsreceived/"+userId, request, functionToCall, null);
        },

        /* *************************
         *
         *  Image Service Methods
         *
         * *************************
         */

        insertImage:function (event, data)
        {
            $(event.target).fileupload('option','url',settings.apiUrl + '/v2/image/file');

            var request={
                fileName: data.files[0].name,
                token: token
            };

            data.formData = request;
            data.headers = {
                'language':getUserLanguage()
            };
            data.paramName = 'file';
            data.submit();
        },

        getImage:function(fileId, defaultImageId)
        {
            return settings.apiUrl + '/v2/image/'+ fileId + '/default/' + defaultImageId;
        },

        getProfileImage : function(fileId)
        {
            var imageUrl = fileId;

            if(!(imageUrl.toString().indexOf("/profile/") > -1)){
                imageUrl = settings.apiUrl + '/v2/image/profile/'+ fileId;
            }

            return imageUrl;
        },

        getStarImage : function(fileId)
        {
            var imageUrl = fileId;

            if(!(imageUrl.toString().indexOf("/star/") > -1)){
                imageUrl = settings.apiUrl + '/v2/image/star/'+ fileId;
            }

            return imageUrl;
        },

        /* ********************************
         *
         *  PullNotification Service Methods
         *
         * ********************************
         */

        intializeServerNotifications:function (functionToCall)
        {
            intializeNotificationTiming(functionToCall);
        },

        setDatesToPullStarCountNotification:function(from, to)
        {
            starCountNotificationsFrom = from;
            starCountNotificationsTo = to;

        },

        intializeServerStarCountNotifications:function (functionToCall)
        {
            intializeStarCountNotificationTiming(functionToCall);
        },

        stopStarCountNotifications:function(){
            starCountNotificationsFlag = false;
            starCountNotifications = false;
            clearInterval(starCountNotificationTimmer);
        },
        stopServerNotifications : function (){
            clearInterval(notificationTimmer);
        }
    };

        return StarMeUpServices.getInstance();
});
