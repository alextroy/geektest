(function($){
    var OpenWeatherMapClient = {
        url: "http://api.openweathermap.org/data/2.5/weather",
        optsDefault: { appid: "44db6a862fba0b067b1930da0d769e98", units: "metric" },
        byLocation: function(lat, lon){
            var data =  $.extend({}, this.optsDefault, {lat: lat, lon: lon});
            return $.get(this.url,data); 
        },
        byZipCode: function(zip, countryCode){
            var data = $.extend({}, this.optsDefault, {zip: zip+','+(countryCode || 'gb')});
            return $.get(this.url,data); 
        }
    }
    
    function nano(template, data) {
        return template.replace(/\{([^\}]*)\}/g, function(str, key) {
        var keys = key.split('.'),
            val = data,
            k;
        while((key = keys.shift())) {
            key = key.split('[');
            val = val[key.shift()];
            while((k = key.shift())) {
                val = val[k.slice(0, -1)];
            }
        }
        return ("undefined" !== typeof val && val !== null) ? val : "";
    });
    }
    
    var weatherTemplate = '<div class="col-md-6"><div class="city"><span class="marker"></span>{name}</div><div class="coords"><span>Latitude: {coord.lat}</span> <span>Longitude: {coord.lon}</span></div></div><div class="col-md-6"><div class="temp">{main.temp}</div><div class="group">{weather[0].main}</div></div>';
    
    function setWeatherState(state){
        $("#weather").attr("data-state", state);
    }
    
    $("form#zip_form").submit(function(){
        var zip = $(this).find("[name='zip']");
        if(zip.val() == null || zip.val() == ''){
            return false;
        }
        setWeatherState("loading");
        OpenWeatherMapClient.byZipCode(zip.val())
            .done(getWeatherSuccess)
            .fail(getWeatherError);
            
        return false;
    });
    
    function getWeatherSuccess(data){
        if(data.cod && data.cod == 200){
            var htmlW = nano(weatherTemplate, data);
            $("#weather .weather-wrap").html(htmlW);
            setWeatherState("location");
        }
        else{
            setWeatherState("locationError");
            setTimeout(function(){
                setWeatherState("zip");
            }, 2000);
        }
    }
    function getWeatherError(){
        setWeatherState("locationError"); //need another error
        setTimeout(function(){
                setWeatherState("zip");
            }, 2000);
    }
            
    if (navigator.geolocation) {
        var reqTimeout = 10 * 1000 * 1000;
        navigator.geolocation.getCurrentPosition(
            reqestGeoSuccess,
            requestGeoError,
            { enableHighAccuracy: true, timeout: reqTimeout, maximumAge: 0 }
        );
    }
    else {
        // Geolocation not support
       setWeatherState("zip");
    }
    
    function reqestGeoSuccess(position) {
        setWeatherState("loading");
        
        OpenWeatherMapClient.byLocation(position.coords.latitude, position.coords.longitude)
            .done(getWeatherSuccess)
            .fail(getWeatherError);
    }
    function requestGeoError(error) {
        setWeatherState("zip");
    }
}(jQuery));

(function($){
    window.gl_initGoogleMap = function(){
                var styles = [
                        {
                            "featureType": "road",
                            "stylers": [
                            { "saturation": -100 }
                            ]
                        },{
                            "stylers": [
                            { "saturation": -90 },
                            ]
                        },{
                            "elementType": "labels.text",
                            "stylers": [
                            { "weight": 0.1 },
                            { "color": "#141414" }
                            ]
                        }
                    ],
                    position = {lat: 51.5241131, lng: -0.0760859},
                    mapDiv = document.getElementById('map'),
                    styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
                
                var map = new google.maps.Map(mapDiv, {
                center: position,
                zoom: 17,
                scrollwheel: false,
                mapTypeControl: false,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                    }
                });
                
                var marker = new google.maps.Marker({
                    position: position,
                    icon: "img/marker.png",
                    map: map
                });
                
                marker.infowin = new google.maps.InfoWindow({
                    content: "Geek Label<br>4th Floor<br>27 - 33 Bethnal Green Road<br>Shoreditch<br>London<br>E1 6LA"
                });
                
                google.maps.event.addListener(marker, 'click', function() {
                    //if (null != window['__google_infowin_opened'])
                    //window['__google_infowin_opened'].close();

                    this.infowin.open(this.map, this);
                    //window['__google_infowin_opened'] = this.infowin;
                });
                
                map.mapTypes.set('map_style', styledMap);
                map.setMapTypeId('map_style');
            }
}(jQuery))