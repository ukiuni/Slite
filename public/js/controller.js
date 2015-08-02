var myapp = angular.module('app', [ 'ui.bootstrap', 'ngRoute', 'ngResource' ]);
myapp.config([ "$locationProvider", "$httpProvider", "$routeProvider", function($locationProvider, $httpProvider, $routeProvider) {
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
		templateUrl : "template/home.html"
	});
	$routeProvider.otherwise({
		redirectTo : "/"
	});
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
		$http({
			url : 'api/account',
			method : "POST",
			data : JSON.stringify(account),
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data, status, headers, config) {
			if (callback) {
				callback();
			}
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
} ];
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
		}, function(account) {
			$rootScope.myAccount = account;
			$location.path("/home");
		}, function(error) {
			// TODO error
			console.log("error " + error);
		})
	}
} ];
myapp.controller('indexController', indexController);
myapp.controller('activationController', activationController);
myapp.controller('signinController', signinController);