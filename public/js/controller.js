toastr.options = {
	"positionClass" : "toast-top-center"
}
var myapp = angular.module('app', [ 'ui.bootstrap', 'ngRoute', 'ngResource' ]);
myapp.config([ "$locationProvider", "$httpProvider", "$routeProvider", function($locationProvider, $httpProvider, $routeProvider, $rootScope, $location) {
	$locationProvider.html5Mode(true);
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$routeProvider.when("/", {
		templateUrl : "template/indexView.html",
		controller : "indexController"
	});
	$routeProvider.when("/signin", {
		templateUrl : "template/signinView.html",
		controller : "signinController"
	});
	$routeProvider.when("/activation", {
		templateUrl : "template/activationView.html",
		controller : "activationController"
	});
	$routeProvider.when("/home", {
		templateUrl : "template/home.html",
		controller : "homeController"
	});
	$routeProvider.when("/requestResetPassword", {
		templateUrl : "template/requestResetPassword.html",
		controller : "requestResetPasswordController"
	});
	$routeProvider.when("/resetPasswordRequested", {
		templateUrl : "template/resetPasswordRequested.html"
	});
	$routeProvider.when("/resetPassword", {
		templateUrl : "template/resetPasswordView.html",
		controller : "resetPasswordController"
	});
	$routeProvider.when("/passwordReseted", {
		templateUrl : "template/passwordResetedView.html"
	});
	$routeProvider.otherwise({
		redirectTo : "/"
	});
} ]);
myapp.run([ "$rootScope", "$location", "$resource", function($rootScope, $location, $resource) {
	$resource('/api/resource/messages?lang=:lang').get({
		lang : ((navigator.languages && navigator.languages[0]) || navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2)
	}, function(messages) {
		$rootScope.messages = messages;
	}, function() {
		toastr.warning("Fail to load message resource.");
	});
	$rootScope.toLogin = function() {
		$location.path("/signin");
	}
} ]);
var indexController = [ "$rootScope", "$scope", "$modal", "$location", "$http", "$window", function($rootScope, $scope, $modal, $location, $http, $window) {
	$scope.openCreateAccountDialog = function() {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.create = function() {
				var account = {};
				account.name = $dialogScope.name;
				account.mail = $dialogScope.mail;
				account.password = $dialogScope.password;
				$modalInstance.close(account);
			};
			$dialogScope.name = "";
			$dialogScope.mail = "";
			$dialogScope.password = "";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/createAccountDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function(account) {
			$scope.createAccount(account, function() {
				$location.path("/signin");
			});
		}, function() {
		});
	};
	$scope.createAccount = function(account, callback) {
		post($http, '/api/account', account).success(function(data, status, headers, config) {
			if (callback) {
				callback();
			}
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
} ];
var post = function($http, url, object, successFunc, errorFunc) {
	return httpRequest($http, "POST", url, object, successFunc, errorFunc);
}
var put = function($http, url, object, successFunc, errorFunc) {
	return httpRequest($http, "PUT", url, object, successFunc, errorFunc);
}
var httpRequest = function($http, method, url, object, successFunc, errorFunc) {
	var http = $http({
		url : url,
		method : method,
		data : JSON.stringify(object),
		headers : {
			'Content-Type' : 'application/json'
		}
	})
	if (successFunc) {
		http.success(successFunc)
	}
	if (errorFunc) {
		http.error(errorFunc)
	}
	return http;
}
var activationController = [ "$rootScope", "$scope", "$resource", "$location", function($rootScope, $scope, $resource, $location) {
	var activationKey = $location.search()["key"];
	var Account = $resource('/api/account/activation?key=:activationKey');
	Account.get({
		activationKey : activationKey
	}, function(account) {
		$scope.account = account;
		$scope.toLogin = function() {
			$location.path("/signin");
		};
	}, function(error) {
		// TODO error
		console.log("error " + error);
	});
} ];
var signinController = [ "$rootScope", "$scope", "$resource", "$location", function($rootScope, $scope, $resource, $location) {
	$scope.signinAccount = {}
	$scope.signin = function() {
		var Signin = $resource('/api/account/signin?mail=:mail&password=:password');
		Signin.get({
			mail : $scope.signinAccount.mail,
			password : $scope.signinAccount.password
		}, function(loginInfo) {
			$rootScope.myAccount = loginInfo.account;
			$rootScope.sessionId = loginInfo.sessionKey.secret;
			console.log("loginInfo = "+JSON.stringify(loginInfo));
			$location.path("/home");
		}, function(error) {
			toastr.error($rootScope.messages.signin.error);
		})
	}
} ];
var requestResetPasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	$scope.requestResetPasswordAccount = {}
	$scope.requestResetPassword = function() {
		post($http, '/api/account/sendResetpasswordMail', {
			mail : $scope.requestResetPasswordAccount.mail
		}).success(function(account) {
			$location.path("/resetPasswordRequested");
		}).error(function(error) {
			// TODO error
			console.log("error " + error);
		});
	}
} ];
var resetPasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	var passwordResetKey = $location.search()["key"];
	$scope.resetPasswordAccount = {}
	$scope.resetPassword = function() {
		put($http, '/api/account/resetPassword', {
			password : $scope.resetPasswordAccount.password,
			key : passwordResetKey
		}).success(function(account) {
			$location.path("/passwordReseted");
		}).error(function(error) {
			// TODO error
			console.log("error " + error);
		});
	}
} ];
var homeController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	if (!$rootScope.myAccount) {
		$location.path("/signin");
	}
} ];
myapp.controller('indexController', indexController);
myapp.controller('activationController', activationController);
myapp.controller('signinController', signinController);
myapp.controller('requestResetPasswordController', requestResetPasswordController);
myapp.controller('resetPasswordController', resetPasswordController);
myapp.controller('homeController', homeController);