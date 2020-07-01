var app = angular.module("doctorModule",['ui.router','ngDialog','ui.bootstrap','ngSanitize', 'ngMessages', 'tcLib','hcLib']);

app.config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider){
	$stateProvider.state({
		name:'login',
		url:'/login',
		controller : 'loginCtrl',
		templateUrl:"./views/common/auth/login.html"
	}).state('home', {
		url: '/home',
		templateUrl: './views/doctor.html'
    })
    .state('opList', {
    	parent : 'home',
		url: '/oplist',
		controller : 'opListCtrl',
		templateUrl: './views/opList/opList.html'
    })
    .state('patientList', {
		url: '/patientList',
		parent : 'home',
		template: '<patient-search view-mode="patient-search-info"></patient-search>'
    })
    .state('opPatientSearch', {
    	parent : 'home',
		url: '/oppatientsearch/{opId}',
		param : {
			opId : null
		},
		controller: 'opPatientSearchCtrl',
		templateUrl: './views/patient/opPatientSearch.html'
    })
    .state('alertInfo', {
    	parent : 'home',
		url: '/alertInfo',
		templateUrl: './views/reports/alertInfo.html',
		controller: 'alertInfoCtrl'
    })
    .state('patientActions', {
		url: '/patientActions',
		parent : 'home',
		params : {
			opPatient : null
		},
		controller: 'patientActionsCtrl',
		templateUrl: './views/patient/patientActions.html'
    })
    .state('doctorLabs', {
		url: '/lab-list',
		parent : 'home',
		controller: 'labTestsCtrl',
		templateUrl: './views/dataentry/lab/labTests.html'
    })
    
    .state('jrDr', {
		url: '/jr-doctor',
		templateUrl: './views/jrDoctor/jrDoctor.html'
    }).state('opPatientList', {
    	parent : 'jrDr',
		url: '/opPatientList',
		controller : 'opPatientListCtrl',
		templateUrl: './views/jrDoctor/opPatientList.html'
    }).state('addPrescription', {
    	parent : 'jrDr',
		url: '/addPrescription',
		params : {
			opPatient : null
		},
		controller : 'addPrescriptionCtrl',
		templateUrl: './views/jrDoctor/addPrescription.html'
    });

	$urlRouterProvider.otherwise('/login');
}]);

app.filter('tcCamelCase', function() {
	return function(input) {
		input = input || ''; 
		return input.replace(/\w\S*/g, function(txt){
			var str = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			for (var i = 0; i < str.length; i++) {
				if(str[i] === '.') {
					str = str.replace(str.charAt(i+1),function(a){return a.toUpperCase();});
				}
			}
			return str; 
		});
	};
});	


