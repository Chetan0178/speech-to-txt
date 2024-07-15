
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
            url: '/products-page',
            templateUrl: 'templates/ProductsPage.html'
        })
        .state('VendorsPage', {
            url: '/vendors-page',
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

    $scope.processSpeech = function(speech) 
    {
        // Handle role creation
        var roleMatch = speech.match(/create new role for (\w+)(?: and description is (.*))/);
        if (roleMatch && roleMatch[1]) 
        {
            var roleName = roleMatch[1];
            var roleDescription = roleMatch[2] || '';

            var payload = {
                role_name: roleName,
                description: roleDescription
            };

            $http.post('http://127.0.0.1:8000/api/v1/users/role/', payload)
                .then(function(response) {
                    console.log('Role created:', response.data);
                }, function(error) {
                    console.log('Error creating role:', error);
                });
        } 
        else 
        {
            // Handle dynamic endpoint creation for sale types
            var saleTypeMatch = speech.match(/create new ([\w\s]+) with name (.+)/);
            if (saleTypeMatch && saleTypeMatch[1] && saleTypeMatch[2]) {
                var endpoint = saleTypeMatch[1].replace(/\s+/g, '_');
                var name = saleTypeMatch[2];

                var payload = {
                    name: name
                };

                console.log('Payload:', payload);
                console.log('Endpoint:', endpoint);

                $http.post('http://127.0.0.1:8000/api/v1/masters/' + endpoint + '/', payload)
                    .then(function(response) {
                        console.log('Item created:', response.data);
                    }, function(error) {
                        console.log('Error creating item:', error);
                    });
                return;
            }

            // Handle navigation
            var pages = {
                'sales order': 'salesOrder',
                'product': 'ProductsPage',
                'vendor': 'VendorsPage',
                'home': 'home'
            };
            console.log("above navigation part")
            var page = Object.keys(pages).find(page => speech.includes('go to ' + page));
            console.log("below navigation part : ==", page)

            if (page) {
                var stateName = pages[page];
                console.log('Navigating to:', stateName);
                $state.go(stateName);
            } else {
                console.log('Speech not recognized for role creation or navigation');
            }
        }
    };
});
