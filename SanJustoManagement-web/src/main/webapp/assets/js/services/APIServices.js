/*global define*/
'use strict';
define([], function () {

    var size = 12;
    var token = "";
    var EXPIRE_MINUTES = 480;
    var COOKIE_TOKEN_KEY = 'tokenSanJusto';
    var settings = {};
    var loggedUser = {};
    var defaultSettings = {
            apiUrl : '/sanjusto-api'
    };

    var consoleHolder = console;
    window.sanJustoDebug = function(bool){
        if(!bool){
            consoleHolder = console;
            if(window.console){
                window.console = {};
                window.console.log = function(){};
            }
        }
    };
    window.sanJustoDebug(true);

    /**
     * Singleton Pattern
     */
    var instance = null;
    function APIServices(){
        if(instance !== null){
            throw new Error('Cannot instantiate more than one instance, use: APIServices.getInstance()');
        }
    }

    APIServices.getInstance = function(){
        if(instance === null){
            instance = new APIServices();
            token = getCookie(COOKIE_TOKEN_KEY);
        }
        return instance;
    }

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
                console.log(e);
            }
        }
    }

    function getBasicRequest() {
        var request={};
        request.timestamp = (new Date()).getTime();
        return request;
    }

    function callTreatmentsService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("api/v1/treatments",typeCall,urlAction,request,functionToCall,handleErrors);
    }

    function callAdminService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("api/v1/admin",typeCall,urlAction,request,functionToCall,handleErrors);
    }

    function callBackEnd (service,typeCall, urlAction, request, functionToCall, handleErrors) {
        var urlService=settings.apiUrl + "/"+ service + urlAction;

        $.ajax({
            url:urlService,
            headers:{
                'token':token
            },
            type: typeCall,
            async:true,
            data:request,
            success:function(data,status,jqxhr){
                if (data.status === "OK") {
                    if(data.token != null && data.token !== ''){
                        token=data.token;
                        setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_MINUTES);
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

    function setCookie(cname,cvalue,exMinutes) {
        var d = new Date();
        d.setTime(d.getTime() + (exMinutes*60*1000));
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

    APIServices.prototype = {

        defaultPageSize:function(){
            return size;
        },

        isLoggedIn:function(){
              token = getCookie(COOKIE_TOKEN_KEY);
          return (token && token.length>10);
        },

        setUpErrorsHandler: function(handler)
        {
            errorsHandler = handler;
        },

        clearCookies : function(){
            token = '';
            setCookie(COOKIE_TOKEN_KEY, '', '');
        },

        login:function (functionToCall, username,password) {
            var request=getBasicRequest();
            request.username=username;
            request.password=password;

            $.ajax({
                url:settings.apiUrl + "/api/v1/sec/authenticate",
                type: "POST",
                async:false,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        loggedUser = data.result;
                        setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_MINUTES);

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

        getUserByToken:function(functionToCall){
            var request=getBasicRequest();

            if (!token || token.length<=10) {
                token="1234567890";
            }

            $.ajax({
                url: settings.apiUrl + "/api/v1/sec/user",
                headers:{
                    "token":token
                },
                type: "GET",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        loggedUser = data.result;
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

        changePassword : function(functionToCall, oldPassword, newPassword){
            var request=getBasicRequest();
            request.oldPass=oldPassword;
            request.newPass=newPassword;

            $.ajax({
                url:settings.apiUrl + "/api/v1/sec/credentials/change",
                headers:{
                    "token":token
                },
                type: "POST",
                async:true,
                data:request,
                success:function(data,status,jqxhr){
                    if (data.status === "OK") {
                        token=data.token;
                        loggedUser = data.result;
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

        getLoggedUser:function() {
            return loggedUser;
        },

        initializeLanguage:function() {
            var language = 'es';

            $.i18n.init({ lng: language, fallbackLng: 'es', resGetPath: 'assets/js/locales/__lng__-__ns__.json', ns: 'translation', getAsync: false, defaultValueFromContent: false });
        },

        /* *************************
         *
         *  Treatments Service Methods
         *
         * *************************
         */

        getAllTreatments :function (functionToCall, page, handleErrors)
        {
            var request=getBasicRequest();
            if (!page) {
                page = 0;
            }
            callTreatmentsService("GET","/all/"+page+"/"+size,request,functionToCall,handleErrors);
        },

        getOneTreatment :function (functionToCall, id, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/"+id,request,functionToCall,handleErrors);
        },

        locateCustomers :function (functionToCall, search, handleErrors)
        {
            var request=getBasicRequest();
            request.search = search
            callTreatmentsService("GET","/locateCustomers",request,functionToCall,handleErrors);
        },

        locateBranches :function (functionToCall, search, handleErrors)
        {
            var request=getBasicRequest();
            request.search = search
            callTreatmentsService("GET","/locateBranches",request,functionToCall,handleErrors);
        },

        getAllUsers :function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/users",request,functionToCall,handleErrors);
        },

        getTypes :function (functionToCall, keyType, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/types/" + keyType,request,functionToCall,handleErrors);
        },

        getBranchesByCustomer :function (functionToCall, customerId, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/branchByCustomer/" + customerId,request,functionToCall,handleErrors);
        },

        getProductsByTreatment :function (functionToCall, treatmentId, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/" + treatmentId + "/products",request,functionToCall,handleErrors);
        },

        getProductsByOrganization :function (functionToCall, handleErrors)
        {
            var request=getBasicRequest();
            callTreatmentsService("GET","/products",request,functionToCall,handleErrors);
        },

        saveTreatment :function (functionToCall, formData, handleErrors)
        {
            var request=getBasicRequest();
            request.treatment = JSON.stringify(formData);
            callTreatmentsService("POST","/new/",request,functionToCall,handleErrors);
        },
        /* *************************
         *
         *  Admin Service Methods
         *
         * *************************
         */

        getAllCustomers :function (functionToCall, page, handleErrors)
        {
            var request=getBasicRequest();
            if (!page) {
                page = 0;
            }
            callAdminService("GET","/customers/"+page+"/"+size,request,functionToCall,handleErrors);
        },

        getAllBranches :function (functionToCall, page, handleErrors)
        {
            var request=getBasicRequest();
            if (!page) {
                page = 0;
            }
            callAdminService("GET","/branches/"+page+"/"+size,request,functionToCall,handleErrors);
        },

        getAllContacts :function (functionToCall, page, handleErrors)
        {
            var request=getBasicRequest();
            if (!page) {
                page = 0;
            }
            callAdminService("GET","/contacts/"+page+"/"+size,request,functionToCall,handleErrors);
        }
    };
    return APIServices.getInstance();
});