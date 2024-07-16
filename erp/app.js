var app = angular.module('myApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html'
        })
        .state('salesOrder', {
            url: '/sales-order',
            templateUrl: 'templates/salesOrder.html'
        })
        .state('ProductsPage', {
            url: '/product',
            templateUrl: 'templates/ProductsPage.html'
        })
        .state('VendorsPage', {
            url: '/vendor',
            templateUrl: 'templates/VendorsPage.html'
        });
});

app.controller('MainController', function($scope, $http, $state) {
    $scope.recognizeSpeech = function() {
        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function(event) {
            var speechResult = event.results[0][0].transcript.toLowerCase();
            console.log('Result received: ' + speechResult);
            $scope.processSpeech(speechResult);
        };

        recognition.onerror = function(event) {
            console.log('Speech recognition error detected: ' + event.error);
        };

        recognition.onend = function() {
            console.log('Speech recognition service disconnected');
        };
    };

    $scope.processSpeech = function(speech) {
        // Handle role creation
        var roleMatch = speech.match(/create new role for (\w+)(?: and description is (.*))/);
        if (roleMatch && roleMatch[1]) {
            var roleName = roleMatch[1];
            var roleDescription = roleMatch[2] || '';

            var payload = {
                role_name: roleName,
                description: roleDescription
            };

            console.log('Payload:', payload);

            $http.post('http://127.0.0.1:8000/api/v1/users/role/', payload)
                .then(function(response) {
                    console.log('Role created:', response.data);
                }, function(error) {
                    console.log('Error creating role:', error);
                });
            return;
        }

        // Handle dynamic endpoint creation
        var endpointMatch = speech.match(/create new ([\w\s]+) with name (.+)/);
        if (endpointMatch && endpointMatch[1] && endpointMatch[2]) {
            var endpoint = endpointMatch[1].replace(/\s+/g, '_');
            var name = endpointMatch[2];

            var payload = {
                name: name
            };

            console.log('Payload:', payload);
            console.log('Endpoint:', endpoint);

            $http.post('http://127.0.0.1:8000/api/v1/' + endpoint + '/', payload)
                .then(function(response) {
                    console.log('Item created:', response.data);
                }, function(error) {
                    console.log('Error creating item:', error);
                });
            return;
        }

        // Handle navigation
        var navigateMatch = speech.match(/go to (.+)/);
        if (navigateMatch && navigateMatch[1]) {
            var page = navigateMatch[1].replace(/\s+/g, '').toLowerCase();

            var pages = {
                'salesorder': 'salesOrder',
                'product': 'ProductsPage',
                'vendor': 'VendorsPage',
                'home': 'home'
            };

            if (pages[page]) {
                var stateName = pages[page];
                console.log('Navigating to:', stateName);
                $state.go(stateName);
            } else {
                console.log('Page not recognized:', page);
            }
            return;
        }

        console.log('Speech not recognized for any action');
    };
});
