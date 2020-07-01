angular.module("doctorOPModule").controller("dashBoardCtrl", function($scope, $rootScope, $http) {

	$scope.init = function() {
		$scope.getDoctorsList();
		var curDate = new Date();
		$scope.defaultOpObj = {
			doctor : {
				id : 1
			},
			opDate : curDate
		};
		$scope.opSearch = angular.copy($scope.defaultOpObj);
		$scope.allOpPatientsList=[];
		$scope.defaultOpPatientObj = {patient:{},op:{},status:'New'};
		$scope.oppatient = $scope.defaultOpPatientObj;
		
	};
	
	$scope.getDoctorsList = function() {
		$http.get(CONSTANTS.URL.BASE + "/doctor/list").success(function(res) {
			if (res.isSuccess) {
				$scope.doctorsList = res.response;
			}
		});
	};
	
	
	$scope.init();
	

	$scope.getOpByDateDoctor = function(opSearch) {
		$scope.newOp= angular.copy(opSearch);
		$http.post("../op/getopbydatedoctor",opSearch).success(function(res){
			if (res.isSuccess) {
				if(res.response.id){
					$scope.opByDoctorDate = res.response;
					$scope.oppatient.op.id = res.response.id;
					$scope.oppatient.op.opStatus = res.response.opStatus;
					//Op Patients List Count Start
					$scope.getAllOpPatientsById($scope.oppatient.op.id);
					
					//Op Patients List Count End
					$scope.getOpPatientsByIdStatus('New');
				}else{
					$scope.allOpPatientsList=[];
					$scope.opPatientsCalc();
					
					$scope.opByDoctorDate = {};
				}
			}
		});
	};
	$scope.getOpByDateDoctor($scope.opSearch);
	$scope.getAllOpPatientsById=function(id){
		$http.post("../oppatient/getoppatientbyopid",id).success(function(res){
			if(res.isSuccess) {
				$scope.allOpPatientsList=res.response;
				console.log($scope.allOpPatientsList);
				$scope.opPatientsCalc();
			}
		}).error(function(err){
			//console.log(err);
		});
	};
	
	$scope.getOpPatientsByIdStatus=function(status){
		$scope.oppatient={op:{id:$scope.oppatient.op.id},status:status};
		$http.post("../oppatient/getoppatientbyopidstatus",$scope.oppatient).success(function(res) {
			if (res.isSuccess) {
				$scope.opPatientsList = res.response;
			}
		}).error(function(err){
			console.log(err);
		});
	};
	$scope.opPatientsCalc=function(){
		if($scope.allOpPatientsList){
			$scope.newCount = 0;
			$scope.skippedCount = 0;
			$scope.consultPrescriptionCount = 0;
			for(var i=0;i<$scope.allOpPatientsList.length;i++){
				if($scope.allOpPatientsList[i].status=='New'){
					$scope.newCount += 1; 
				}
				if($scope.allOpPatientsList[i].status=='Skipped'){
					$scope.skippedCount += 1; 
				}
				if($scope.allOpPatientsList[i].status=='Consulted-Pres'){
					$scope.consultPrescriptionCount += 1; 
				}
			}
			console.log("new count"+$scope.newCount);
			console.log("skipped"+$scope.skippedCount);
			console.log("consult"+$scope.consultPrescriptionCount);
		}
	};
	
	
	
	/*Calendar Start*/
	$scope.showWeeks= false;
	$scope.inlineOptions = {
		customClass: getDayClass,
		minDate: new Date() ,
		showWeeks: false
	};

	$scope.dateOptions = {
		// dateDisabled: disabled,
		formatYear: 'yy',
		maxDate: new Date(2040, 11, 31),
		minDate: new Date(),
		startingDay: 1
	};

	// Disable weekend selection
	function disabled(data) {
		var date = data.date,
		mode = data.mode;
		return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
	}

	$scope.toggleMin = function() {
		$scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
		$scope.dateOptions.minDate = $scope.inlineOptions.minDate;
	};

	$scope.toggleMin();

	$scope.openCalendar = function(calenderParameter) {
		$scope[calenderParameter] = {opened: true};
	};

	$scope.setDate = function(year, month, day) {
		$scope.dt = new Date(year, month, day);
	};
	  $scope.calendarPanel = {
	    opened: false
	  };


	  function getDayClass(data) {
	    var date = data.date,
	      mode = data.mode;
	    if (mode === 'day') {
	      var dayToCheck = new Date(date).setHours(0,0,0,0);

	      for (var i = 0; i < $scope.events.length; i++) {
	        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

	        if (dayToCheck === currentDay) {
	          return $scope.events[i].status;
	        }
	      }
	    }

	    return '';
	  }
	  /*Calendar End*/
});