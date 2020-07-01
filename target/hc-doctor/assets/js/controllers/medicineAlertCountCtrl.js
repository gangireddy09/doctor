angular.module("doctorOPModule").controller("medicineAlertCountCtrl", function($scope,$http,$timeout) {
	//$scope.curDate = new Date();
	$scope.search = {};
    //$scope.search.searchDate = angular.copy($scope.curDate);
	/*count alert*/	
	$scope.getPurchaseMedicinesAlertCount = function () {
		$scope.formLoader=true;
		$http.get("../purchasebillmedicines/viewlist").success( function(res){
			$scope.formLoader=false;
			$scope.purchasedMedicineObject = {};
			$scope.visiblePurchasedMedicineObject;
			if(res.isSuccess){
				res.response.forEach(function(obj) {
					if (!$scope.purchasedMedicineObject[obj.medicineDrugContent]) {
						$scope.purchasedMedicineObject[obj.medicineDrugContent] = {
							medicines: [],
							minAlertCount: obj.medicineMinCount,
							maxAlertCount: obj.medicineMaxCount
						};
					}
					$scope.purchasedMedicineObject[obj.medicineDrugContent].medicines.push({
						id: obj.id,
						medicineName: obj.medicineName,
						availability: getAvailabilityCount(obj),
						expiryMonth:obj.medicineExpiryMonth,
						expiryYear:obj.medicineExpiryYear,
						medicineBatch:obj.medicineBatch
					});
				});
				Object.keys($scope.purchasedMedicineObject).forEach(function(key) {
					var availability = 0;
					$scope.purchasedMedicineObject[key].medicines.forEach(function (medicine) {
						availability += medicine.availability;
					});
					$scope.purchasedMedicineObject[key].availability = availability;
				});
				$scope.visiblePurchasedMedicineObject = angular.copy($scope.purchasedMedicineObject);
			}
		});
	};
	
	$scope.filterMedicines = function(drugContent) {
		$scope.visiblePurchasedMedicineObject = {}; 
		if (drugContent) {
			var drugContents = Object.keys($scope.purchasedMedicineObject);
			drugContents.forEach(function(dc) {
				if (dc.toLowerCase().indexOf(drugContent.toLowerCase()) !== -1) {
					$scope.visiblePurchasedMedicineObject[dc] = angular.copy($scope.purchasedMedicineObject[dc]);
				}
			});
		} else {
			$scope.visiblePurchasedMedicineObject = angular.copy($scope.purchasedMedicineObject);
		}
	};
	
	function getAvailabilityCount(medicine) {
		return ((((medicine.medicineQuantity +medicine.medicineFreeUnits)*medicine.medicineNoOfUnits)-medicine.medicineSold+medicine.medicineReturned)-medicine.purchaseBillPurchaseReturned);
	}
	$scope.getPurchaseMedicinesAlertCount();
	
	   /*Sliding Panel*/
	  $scope.slideToExpiryList=function(){
	    	$scope.showMedicineAlerts='slide-page-left';
	    };
	    $scope.slideToCountAlert=function(){
	    	$scope.showMedicineAlerts='slide-page-right';
	    };
	    
	   /*Expiry medicines*/
	    $scope.expiredMedicinesList = [];
		
		$scope.getExpiredMedicinesList = function(search) {
			$scope.formLoader=true;
			var month = $scope.search.searchDate.getMonth()+1;
			var year = $scope.search.searchDate.getFullYear();
			/*var url='../expirymedicine/expirylist?medicineExpiryMonth=' + month + '&medicineExpiryYear=' + year;*/
			/*url="'../expirymedicine/expirylist?medicineExpiryMonth=' + search.month + '&medicineExpiryYear=' + search.year"*/
			$http.get('../expirymedicine/expirylist?medicineExpiryMonth=' + month + '&medicineExpiryYear=' + year).success(function(res) {
				if(res.isSuccess) {
					$scope.expiredMedicinesList = [];
					for(var i=0;i<res.response.length;i++) {
						for(var j=0;j<res.response[i].length;j++) {
							$scope.expiredMedicinesList.push(res.response[i][j]);
						}
					}
					/*console.log($scope.expiredMedicinesList);*/
					$scope.formLoader=false;
				}
				
			});
		};
		//$scope.getExpiredMedicinesList();
		
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