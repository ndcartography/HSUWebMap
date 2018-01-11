var Mercator_PixelsPerDegreee=[0.71111111111111,1.4222222222222,2.8444444444444,5.6888888888889,11.377777777778,22.755555555556,45.511111111111,91.022222222222,182.04444444444,364.08888888889,728.17777777778,1456.3555555556,2912.7111111111,5825.4222222222,11650.844444444,23301.688888889,46603.377777778,93206.755555556,186413.51111111,372827.02222222];var Mercator_PixelsPerRadian=[40.743665431525,81.48733086305,162.9746617261,325.9493234522,651.8986469044,1303.7972938088,2607.5945876176,5215.1891752352,10430.37835047,20860.756700941,41721.513401882,83443.026803764,166886.05360753,333772.10721505,667544.21443011,1335088.4288602,2670176.8577204,5340353.7154409,10680707.430882,21361414.861763];var Mercator_Offsets=[128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864];var Mercator_NumColumns=[0,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288];function CMProjectorGoogleMaps(){CMProjector.call(this);this.ZoomLevel=18;}CMProjectorGoogleMaps.prototype=Object.create(CMProjector.prototype);CMProjectorGoogleMaps.prototype.contructor=CMProjectorGoogleMaps;CMProjectorGoogleMaps.prototype.ProjectFromGeographic=function(Lon,Lat){var Offset=Mercator_Offsets[this.ZoomLevel];var x=Math.round(Offset+Lon*Mercator_PixelsPerDegreee[this.ZoomLevel]);var Temp=Math.sin(CMProjector.DegreesToRadians(Lat));Temp=Math.max(Temp,-0.9999);Temp=Math.min(Temp,0.9999);var y=Math.round(Offset+0.5*Math.log((1+Temp)/(1-Temp))*-Mercator_PixelsPerRadian[this.ZoomLevel]);var Result={Easting:x,Northing:-y};return(Result);};CMProjectorGoogleMaps.prototype.ProjectToGeographic=function(X,Y){Y=-Y;var Offset=Mercator_Offsets[this.ZoomLevel];var Lon=(X-Offset)/Mercator_PixelsPerDegreee[this.ZoomLevel];var Temp=(Y-Offset)/-Mercator_PixelsPerRadian[this.ZoomLevel];var Thing=2*Math.atan(Math.exp(Temp));var Thing2=Thing-Math.PI/2;var Lat=CMProjector.RadiansToDegrees(Thing-Math.PI/2);var Result={Longitude:Lon,Latitude:Lat};return(Result);};CMProjectorGoogleMaps.prototype.SetZoomLevel=function(ZoomLevel){this.ZoomLevel=ZoomLevel;}