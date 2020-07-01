angular.module("doctorModule").directive('prescriptionGenerator', function($rootScope) {
	return {
		restrict: 'E',
		scope : {
			options	: "=",
			onSave	: "&",
			prescription: '=',
			onToggleSelectedList: '&' 
		},
		templateUrl: './views/prescription/prescriptionGenerator.html',
		link: function(scope, ele, attr) {} ,
		controller: function($scope, $http, $rootScope,opPrescriptionService,medicineCategoryService,medicineCategoryByDoctorService) {
			$scope.init = function() {
				$scope.saveBtnTxt = $scope.options.saveBtnTxt || 'Save';
				$scope.medicineSearch = {};
				$scope.expanded = { prescription: false };
				$scope.medicineCategoryList = [];
				$scope.doctorMedicineCategories = [];
				$scope.getRecentPrescriptionsByComplaint();
				$scope.getMedicineCategories();
				$scope.getDoctorMedicineCategories();
				$scope.scollerApi = {};
				$scope.finalTotal = 0;
			};
			$scope.getMedicineCategories = function() {
				medicineCategoryService.medicineCategoryList().then(function(res) {
					res.splice(0, 0, {category: "All"});
					$scope.medicineCategoryList = res;
				});
			};
			
			$scope.getDoctorMedicineCategories = function() {
				medicineCategoryByDoctorService.medicineCategoryByDoctorList().then(function(res) {
						res.splice(0, 0, {categoryName: "All"}); 
						$scope.doctorMedicineCategoryList = res;
				});
			};
			
			$scope.searchPurchaseBillMedicines = function() {
				$scope.medicineSearch.startIndex = 0;
				opPrescriptionService.searchPurchaseMedicines($scope.medicineSearch).then(function(res) {
					$scope.scollerApi.resetScroll();
					$scope.purchaseMedicineSearchResults = res;
					//console.log($scope.purchaseMedicineSearchResults);
				});
			};

			$scope.fetchMoreMedicineProduct = function () {
				$scope.medicineSearch.startIndex = $scope.purchaseMedicineSearchResults.length;
				opPrescriptionService.searchPurchaseMedicines($scope.medicineSearch).then(function(res) {
					$scope.purchaseMedicineSearchResults = $scope.purchaseMedicineSearchResults.concat(res.response);
				});
			};
			$scope.getAvailableQuantity = function(product) {
				return ( (product.medicineQuantity*1 + product.medicineFreeUnits*1) * (product.medicineNoOfUnits*1) ) - (product.medicineSold*1) + (product.medicineReturned*1) - (product.purchaseBillPurchaseReturned*1);
			};
			$scope.getRecentPrescriptionsByComplaint = function(){
				opPrescriptionService.opPrescriptionList({compliant:$scope.prescription.complaint}).then(function(res){
					for(var i=0;i<res.length;i++){
						if($scope.getAvailableQuantity(res.response[i])!=0){
							$scope.prescription.prescriptionMedicines.push(res.response[i]);
						}
					}
					$scope.getPrescriptionTotal();
				});
			};
			
			$scope.selectPurchaseMedicineProduct = function(purchaseMedicineProduct) {
				console.log("Purchase medicine",purchaseMedicineProduct);
				$scope.medicineSearch.medicineName = "";
				$scope.medicineSearch.drugContent = "";
				var prescriptionMedicine = {
						purchasedMedicineId : purchaseMedicineProduct.id,
						medicineName : purchaseMedicineProduct.name,
						batch : purchaseMedicineProduct.batch,
						expiryMonth : purchaseMedicineProduct.expiryMonth,
						expiryYear : purchaseMedicineProduct.expiryYear,
						mrp : purchaseMedicineProduct.mrp,
						noOfUnits : purchaseMedicineProduct.noOfUnits,
						packing : purchaseMedicineProduct.packing,
						medicineId : purchaseMedicineProduct.medicineId,
						category : purchaseMedicineProduct.category,
						subCategory : purchaseMedicineProduct.categoryByDoctor,
						location : purchaseMedicineProduct.location,
						drugContent : purchaseMedicineProduct.drugContent,
						hsnCode : purchaseMedicineProduct.hsnCode,
						taxPercent : purchaseMedicineProduct.taxPercent,
						taxAmount : purchaseMedicineProduct.taxAmount,
						purchaseQuantity : purchaseMedicineProduct.quantity,
						available : purchaseMedicineProduct.available
				};
				if($scope.prescription.prescriptionMedicines<1){
					$scope.prescription.prescriptionMedicines.push(prescriptionMedicine);
				}else {
					$scope.isExist = false;
					for(var i=0;i<$scope.prescription.prescriptionMedicines.length;i++){
						if($scope.prescription.prescriptionMedicines[i].purchasedMedicineId==purchaseMedicineProduct.id){
							$scope.infoMsg = "Already Exist.";
							$scope.isExist = true;
							$rootScope.$broadcast("$medicineExist",{isMedicineExist:$scope.isExist});
						}
					}
					if($scope.isExist==false){
						$scope.prescription.prescriptionMedicines.push(prescriptionMedicine);
					}
				}
			};
			
			$scope.unSelectPurchaseMedicineProduct = function(index) {
				$scope.prescription.prescriptionMedicines.splice(index, 1);
				$scope.getPrescriptionTotal();
				if($scope.expanded.prescription && !$scope.prescription.prescriptionMedicines.length) {
					$scope.toggleSelectedList(); // making exapended prescription false
				}
			};
			
			$scope.toggleSelectedList = function() {
				$scope.expanded.prescription = !$scope.expanded.prescription;
				if(typeof $scope.onToggleSelectedList === 'function') {
					$scope.onToggleSelectedList({$expanded: $scope.expanded.prescription});
				}
			};  
			$scope.getPrescriptionTotal=function() {
				$scope.finalTotal = 0;
				for(var i=0; i < $scope.prescription.prescriptionMedicines.length; i++) {
					var prescriptionTotal = 0;
					var medQty = 0;
					if($scope.prescription.prescriptionMedicines[i].quantity) {
						medQty = $scope.prescription.prescriptionMedicines[i].quantity;
					}
					$scope.finalTotal += medQty * ($scope.prescription.prescriptionMedicines[i].mrp / $scope.prescription.prescriptionMedicines[i].noOfUnits);
				}
			};
			$scope.onSaveClick = function() {
				if(typeof $scope.onSave === 'function') {
					$scope.onSave({$prescriptionMedicines: $scope.prescription.prescriptionMedicines});
				}
			};
			
			$scope.$on('$setPrescriptions', function(prescriptionMedicines) {
				$scope.prescription = {prescriptionMedicines: prescriptionMedicines};
			});
			$scope.$on('$setPrescriptionTotal', function() {
				$scope.getPrescriptionTotal();
			});

			$scope.init();
		}
	};
}).directive('dosageInput', function() {
	var dosageSelectionMap = {
		cap: [{key: '1', val: '1'}, {key: '2', val: '2'}],
		tabInj: [{key: '1', val: '1'}, {key: '1/2', val: '1/2'}, {key:'2', val: '2'}],
		drops: [{key: '1', val: '1'}, {key: '2', val: '2'}, {key: '3', val: '3'}, {key: '4', val: '4'}, {key: '5', val: '5'}],
		liquid: [{key: '0.5ml', val: '0.5ml'}, {key: '1.0ml', val: '1.0ml'},{key: '2.5ml', val: '2.5ml'}, {key: '5ml', val: '5ml'}, {key: '10ml', val: '10ml'},{key: '15ml', val: '15ml'}, {key: '20ml', val: '20ml'},{key: '30ml', val: '30ml'},{key: '40ml', val: '40ml'},{key: '50ml', val: '50ml'}],
		powder: [{key: '1pn', val: '1pinch'}, {key: '0.5pn', val: '0.5pinch'}, {key: '1.5pn', val: '1.5pinch'}, {key: '2pn', val: '2pinch'}, {key: '0.5 T-Sp', val: '0.5 TS'}, {key: '1 T-Sp', val: '1 TS'}, {key: '1.5 T-Sp', val: '1.5 TS'}, {key: '2 T-Sp', val: '2 TS'}]
	};

	return {
		restrict: 'E',
		scope: {
			dosageRemarks: '=',
			isDosageSelected: '=',
			dosage: '=',
			medicineCategory:'='
		},
		templateUrl : "./views/prescription/dosageInput.html",
		controller : function($scope, $window) {
			$scope.showSelection = {showList: false};
			$scope.dosageListByCategory = function (cat) {
				switch(cat) {
					case 'Cap.': return dosageSelectionMap.cap;
					case 'Tab.':
					case 'Inj.': return dosageSelectionMap.tabInj;
					case 'Drops.': return dosageSelectionMap.drops;
					case 'Syr.' : return dosageSelectionMap.liquid;
					case 'Lotion': return dosageSelectionMap.drops;
					case 'SOLUTION' : return dosageSelectionMap.liquid;
					case 'SUSPENSION': return dosageSelectionMap.liquid;
					case 'POWDER': return dosageSelectionMap.powder;
				}
			};
			
			$scope.$on('$windowClick', function() {
				$scope.showSelection = null; 
			});
			
			$scope.onSelect = function(selected) {
				$scope.dosage = selected;
				$scope.showSelection = null;
				$scope.isDosageSelected = true;
			};
			
			$scope.toggleSelection = function(e) {
				e.stopPropagation();
				$scope.isDosageSelected = !$scope.isDosageSelected;
				$scope.dosageRemarks=document.getElementById('initDosageRemarks').innerHTML;
				if(!$scope.isDosageSelected) {
					$scope.dosage = null;
					$scope.dosageRemarks=null;
					$scope.showSelection = null;
				} else {
					$scope.dosage = $scope.dosageListByCategory($scope.medicineCategory)[0].val;
					$scope.showSelection = null;
				}
			};
			
			$scope.toggleSelectionDisplay = function (e) {
				e.stopPropagation();
				if($scope.showSelection == null) {
					$scope.showSelection = {showList: true};
				} else {
					$scope.showSelection = null;
				}
			};
		}
	};
});