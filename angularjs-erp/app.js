//name is chetan and email is chetan at the rate gmail.com and phone number is 726208 3849 
//and delivery date is 14 august 2014 and order date is 13 august 2014 and tax is 40% and remarks is its good

//name is chetan and email is chetan at the rate gmail.com and phone number is 72620 8489 and 
//delivery date is 14 august 2024 and order date is 13 july 2019 and tax is 40% and remarks is good
//and mobile is check moto
//mobile is remove moto
var app = angular.module('myApp', ['ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html'
        })
        .state('salesOrder', {
            url: '/sales-order',
            templateUrl: 'templates/salesOrder.html',
            controller: 'SalesOrderController'
        })
        .state('ProductsPage', {
            url: '/products-page',
            templateUrl: 'templates/ProductsPage.html'
        })
        .state('VendorsPage', {
            url: '/vendors-page',
            templateUrl: 'templates/VendorsPage.html'
        });
});

app.controller('MainController', function ($scope, $http, $state) {
    $scope.recognizeSpeech = function () {
        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        var recognitionTimeout;
        recognition.start();

        recognition.onresult = function (event) {
            clearTimeout(recognitionTimeout);
            var speechResult = event.results[0][0].transcript.toLowerCase();
            console.log('Result received: ' + speechResult);
            $scope.processSpeech(speechResult);
        };

        recognition.onerror = function (event) {
            clearTimeout(recognitionTimeout);
            console.log('Speech recognition error detected: ' + event.error);
        };

        recognition.onend = function () {
            clearTimeout(recognitionTimeout);
            console.log('Speech recognition service disconnected');
        };

        recognitionTimeout = setTimeout(function () {
            recognition.stop();
        }, 30000); // Stops recognition after 30 seconds
    };

    $scope.processSpeech = function (speech) {
        var roleMatch = speech.match(/create new role for (\w+)(?: and description is (.*))/);
        if (roleMatch && roleMatch[1]) {
            createRole(roleMatch[1], roleMatch[2] || '');
        } else {
            var OneFieldMatch = speech.match(/create new ([\w\s]+) with name (.+)/);
            if (OneFieldMatch && OneFieldMatch[1] && OneFieldMatch[2]) {
                CreateOneFieldData(OneFieldMatch[1], OneFieldMatch[2]);
            } else {
                navigateToPage(speech);
            }
        }
    };

    function createRole(roleName, roleDescription) {
        var payload = {
            role_name: roleName,
            description: roleDescription
        };

        $http.post('http://127.0.0.1:8000/api/v1/users/role/', payload)
            .then(function (response) {
                console.log('Role created:', response.data);
            }, function (error) {
                console.log('Error creating role:', error);
            });
    }

    function CreateOneFieldData(endpoint, name) {
        endpoint = endpoint.replace(/\s+/g, '_');
        var payload = { name: name };

        console.log('Payload:', payload);
        console.log('Endpoint:', endpoint);

        $http.post('http://127.0.0.1:8000/api/v1/masters/' + endpoint + '/', payload)
            .then(function (response) {
                console.log('Data Created:', response.data);
            }, function (error) {
                console.log('Error creating item:', error);
            });
    }

    function navigateToPage(speech) {
        var pages = {
            'sales order': 'salesOrder',
            'product': 'ProductsPage',
            'vendor': 'VendorsPage',
            'home': 'home'
        };

        var page = Object.keys(pages).find(page => speech.includes('go to ' + page + '.'));
        console.log('page desc ===', page);

        if (page) {
            var stateName = pages[page];
            console.log('Navigating to:', stateName);
            $state.go(stateName);
        } else {
            console.log('Speech not recognized for role creation or navigation');
        }
    }
});

app.controller('SalesOrderController', function ($scope, $http) {
    $scope.formData = {};
    $scope.submitForm = function () {
        console.log('Form submitted:', $scope.formData);
        $http.post('http://127.0.0.1:8000/api/v1/sales-order/', $scope.formData)
            .then(function (response) {
                console.log('Form submitted successfully:', response.data);
            }, function (error) {
                console.log('Error submitting form:', error);
            });
    };

    // Function to recognize speech
    $scope.recognizeSpeech = function () {
        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        // Event handler for when speech recognition results are received
        recognition.onresult = function (event) {
            var speechResult = event.results[0][0].transcript.toLowerCase();
            console.log('Form result received: ' + speechResult);
            speechResult = preprocessSpeech(speechResult); // Preprocess speech to handle special characters
            $scope.processFormSpeech(speechResult);
            $scope.$apply();
        };

        // Event handler for when there is an error in speech recognition
        recognition.onerror = function (event) {
            console.log('Form speech recognition error detected: ' + event.error);
        };

        // Event handler for when speech recognition ends
        recognition.onend = function () {
            console.log('Form speech recognition service disconnected');
        };

        // Stop recognition after 1 minute (60,000 milliseconds)
        setTimeout(function () {
            recognition.stop();
        }, 60000);
    };

    // Function to preprocess speech and replace common phrases with correct symbols
    function preprocessSpeech(speech) {
        const replacements = {
            'at the rate': '@',
            'dot com': '.com',
            'dot net': '.net',
            'dot org': '.org',
            // Add more replacements as needed
        };
        Object.keys(replacements).forEach(function (key) {
            speech = speech.replace(new RegExp(key, 'g'), replacements[key]);
        });
        // Remove spaces between words (if this is intended for specific cases like emails, it can be modified accordingly)
        // speech = speech.replace(/\s+/g, '');
        return speech;
    }
    // Function to process the recognized speech and update the form data
    $scope.processFormSpeech = function (speech) {
        var fields = speech.includes('and') ? speech.split('and') : [speech];
        fields.forEach(function (field) {
            var parts = field.split(' is ');
            if (parts.length < 2) return; // Skip if split result is not as expected

            var key = '';
            var value = '';
            try {
                key = parts[0].trim().toLowerCase().replace(' ', '_');
                value = parts[1].trim();
            } catch (error) {
                console.log('Error processing field:', field, error);
                return; // Skip this field if an error occurs
            }

            // Handling checkbox fields
            if (key === 'mobile') {
                if (value === 'check moto') {
                    $scope.formData.moto = true; // Check Moto checkbox
                } else if (value === 'remove moto') {
                    $scope.formData.moto = false; // Uncheck Moto checkbox
                } else if (value === 'check iphone') {
                    $scope.formData.iphone = true; // Check iPhone checkbox
                } else if (value === 'remove iphone') {
                    $scope.formData.iphone = false; // Uncheck iPhone checkbox
                }
            } else if (['name', 'email', 'phone_number', 'gender', 'delivery_date', 'order_date', 'tax', 'remarks', 'time', 'title'].includes(key)) {
                $scope.formData[key] = value;
            }
        });
        console.log('Form Data:', $scope.formData);
    };

    // Initialize speech recognition
    $scope.recognizeSpeech();
});
