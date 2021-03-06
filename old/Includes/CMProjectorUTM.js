//***************************************************************************************
//	CMProjector class to convert between Geographic and UTM coordinates
//***************************************************************************************

//******************************************************************
// Constructor
//******************************************************************
function CMProjectorUTM() 
{
	this.Datum=CMProjector.WGS_84;
	this.UTMZone=10;
	this.South=false;
}
CMProjectorUTM.prototype=new CMProjector(); // inherit prototype functions from PanelBase()

CMProjectorUTM.prototype.contructor=CMProjectorUTM; // override the constructor to go to ours
//***************************************************************************************
//	Definitions
//***************************************************************************************

/*
Reference ellipsoids derived from Peter H. Dana's website- 
http://www.utexas.edu/depts/grg/gcraft/notes/datum/elist.html
Department of Geography, University of Texas at Austin
Internet: pdana@mail.utexas.edu
3/22/95

Source
Defense Mapping Agency. 1987b. DMA Technical Report: Supplement to Department of Defense World Geodetic System
1984 Technical Report. Part I and II. Washington, DC: Defense Mapping Agency
*/
CMProjectorUTM.PI=3.14159265;
//CMProjectorUTM.FOURTHPI=CMProjectorUTM.PI / 4;
CMProjectorUTM.deg2rad=CMProjectorUTM.PI / 180;
CMProjectorUTM.rad2deg=180.0 / CMProjectorUTM.PI;

// datum defitions for use with functions

CMProjectorUTM.EquatorialRadii=new Array(6378135,6378137,6378206,6378137);
CMProjectorUTM.SquaresOfEccentricity=new Array(0.006694318,0.00669438,0.006768658,0.00669438);
//***************************************************************************************
//	CMProjector functions
//***************************************************************************************
CMProjectorUTM.prototype.SetDatum=function(Datum) { this.Datum=Datum; }
CMProjectorUTM.prototype.SetZone=function(UTMZone) { this.UTMZone=UTMZone; }
CMProjectorUTM.prototype.SetSouth=function(South) { this.South=South; }

//
// Converts a Lat/Long pair into a UTM coordinate in a specified UTM Zone
//	Returns an array with:
//	Result[0] - Easthing (X)
//	Result[1] - Northing (Y)
//	Result[2] - South flag (true/false)
//
CMProjectorUTM.prototype.ProjectFromGeographic=function(Long,Lat)
{
	if (this.Datum==undefined) alert("Sorry, the datum must be defined to call ProjectFromGeographic in the CMProjectorUTM class");
	
	var Easting=0;
	var Northing=0;
//	var South=false; // assume northern
	
	if (Long<-180) Long=-180;
	if (Long>180) Long=180;
	if (Lat<-90) Lat=-90;
	if (Lat>90) Lat=90;

	var Result=null;
	
//	alert("Datum="+Datum);
	
	if ((this.Datum>=0)&&(this.Datum<4))
	{
		var a=CMProjectorUTM.EquatorialRadii[this.Datum];
		var eccSquared=CMProjectorUTM.SquaresOfEccentricity[this.Datum];
		var k0=0.9996;

		var eccPrimeSquared;
		var N, T, C, A, M;

		var LongOrigin;
		var LongOriginRad;

		var LongTemp=(Long+180)-parseInt(((Long+180)/360)*360-180); // -180.00 .. 179.9;
		var LatRad=Lat*CMProjectorUTM.deg2rad;
		var LongRad=Long*CMProjectorUTM.deg2rad;
		
		LongOrigin=(this.UTMZone - 1)*6 - 180 + 3;  //+3 puts origin in middle of zone
		LongOriginRad=LongOrigin * CMProjectorUTM.deg2rad;

		// compute the UTM Northing and Easting

		eccPrimeSquared=(eccSquared)/(1-eccSquared);

		N=a/Math.sqrt(1-eccSquared*Math.sin(LatRad)*Math.sin(LatRad));
		T=Math.tan(LatRad)*Math.tan(LatRad);
		C=eccPrimeSquared*Math.cos(LatRad)*Math.cos(LatRad);
		A=Math.cos(LatRad)*(LongRad-LongOriginRad);

		M=a*((1	- eccSquared/4		- 3*eccSquared*eccSquared/64	- 5*eccSquared*eccSquared*eccSquared/256)*LatRad 
					- (3*eccSquared/8	+ 3*eccSquared*eccSquared/32	+ 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(2*LatRad)
										+ (15*eccSquared*eccSquared/256 + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(4*LatRad) 
										- (35*eccSquared*eccSquared*eccSquared/3072)*Math.sin(6*LatRad));
		
		Easting=(k0*N*(A+(1-T+C)*A*A*A/6
						+ (5-18*T+T*T+72*C-58*eccPrimeSquared)*A*A*A*A*A/120)
						+ 500000.0);

		Northing=(k0*(M+N*Math.tan(LatRad)*(A*A/2+(5-T+9*C+4*C*C)*A*A*A*A/24
					+ (61-58*T+T*T+600*C-330*eccPrimeSquared)*A*A*A*A*A*A/720)));

		if (this.South)//(Lat < 0)
		{
			Northing += 10000000.0; //10000000 meter offset for southern hemisphere
		}

//		alert("Easting="+Easting+" Northing="+Northing);
		
		Result={
			Easting:Easting,
			Northing:Northing
		};
	}
	return(Result);
}
/*
* 
*/
CMProjectorUTM.prototype.ProjectToGeographic=function(Easting,Northing)
{
	var		Lat
	var		Long;
	var		k0=0.9996;
	var		a=1;
	var		eccSquared=0;
	var		eccPrimeSquared;
	var		e1=0;
	var		N1, T1, C1, R1, D, M;
	var		LongOrigin;
	var		mu, phi1, phi1Rad;
	var		x, y;

	if (this.Datum==undefined) alert("Sorry, the datum must be defined to call ProjectToGeographic in the CMProjectorUTM class");
	
	var Result=null;
	
	if ((this.Datum>=0)&&(this.Datum<4))
	{
		a=CMProjectorUTM.EquatorialRadii[this.Datum];
		eccSquared=CMProjectorUTM.SquaresOfEccentricity[this.Datum];
		e1=(1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));

		x=Easting - 500000.0; // remove 500,000 meter offset for longitude
		y=Northing;

		if (this.South==true) y -= 10000000.0;//remove 10,000,000 meter offset used for southern hemisphere

		LongOrigin=(this.UTMZone - 1)*6 - 180 + 3;  //+3 puts origin in middle of zone

		eccPrimeSquared=(eccSquared)/(1-eccSquared);

		// do the ugly math

		M=y / k0;
		mu=M/(a*(1-eccSquared/4-3*eccSquared*eccSquared/64-5*eccSquared*eccSquared*eccSquared/256));

		phi1Rad=mu	+ (3*e1/2-27*e1*e1*e1/32)*Math.sin(2*mu) 
					+ (21*e1*e1/16-55*e1*e1*e1*e1/32)*Math.sin(4*mu)
					+(151*e1*e1*e1/96)*Math.sin(6*mu);
		phi1=phi1Rad*CMProjectorUTM.rad2deg;

		N1=a/Math.sqrt(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad));
		T1=Math.tan(phi1Rad)*Math.tan(phi1Rad);
		C1=eccPrimeSquared*Math.cos(phi1Rad)*Math.cos(phi1Rad);
		R1=a*(1-eccSquared)/Math.pow(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad), 1.5);
		D=x/(N1*k0);

		Lat=phi1Rad - (N1*Math.tan(phi1Rad)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*eccPrimeSquared)*D*D*D*D/24
						+(61+90*T1+298*C1+45*T1*T1-252*eccPrimeSquared-3*C1*C1)*D*D*D*D*D*D/720);

		Lat=Lat * CMProjectorUTM.rad2deg;

		Long=(D-(1+2*T1+C1)*D*D*D/6+(5-2*C1+28*T1-3*C1*C1+8*eccPrimeSquared+24*T1*T1)
						*D*D*D*D*D/120)/Math.cos(phi1Rad);

		Long=LongOrigin + Long * CMProjectorUTM.rad2deg;

		if (Long<-180) Long=-180;
		if (Long>180) Long=180;
		if (Lat<-90) Lat=-90;
		if (Lat>90) Lat=90;

		Result={
			Longitude:Long,
			Latitude:Lat
		}
	}
	return(Result);
}

//***************************************************************************************
//	Functions to find UTM Zones and "South" value from geographic coordinates
//***************************************************************************************

CMProjectorUTM.prototype.GetUTMZoneFromLonLat=function(Long,Lat)
{
	var UTMZone=0;

	// Make sure the longitude is between -180.00 .. 179.9

//  	alert("Long="+Long);
	LongTemp=(Long+180)-parseInt((Long+180)/360)*360-180; // -180.00 .. 179.9;
 // 	alert("LongTemp="+LongTemp);

	// find the correct zone number

	UTMZone=parseInt(((LongTemp + 180)/6)) + 1;
//  	alert("UTMZone="+UTMZone);
  	
	if( Lat >= 56.0 && Lat < 64.0 && LongTemp >= 3.0 && LongTemp < 12.0 )
		UTMZone=32;

	// Special zones for Svalbard

	if( Lat >= 72.0 && Lat < 84.0 ) 
	{
		  if ( LongTemp >= 0.0  && LongTemp <  9.0 ) UTMZone=31;
		  else if ( LongTemp >= 9.0  && LongTemp < 21.0 ) UTMZone=33;
		  else if ( LongTemp >= 21.0 && LongTemp < 33.0 ) UTMZone=35;
		  else if ( LongTemp >= 33.0 && LongTemp < 42.0 ) UTMZone=37;
	}
	return(UTMZone);
}

CMProjectorUTM.prototype.GetSouthFromLat=function(Latitude)
{
	var South=false;
	
	if (Latitude<0) South=true;
	
	return(South);
}

//***************************************************************************************
//	Functions to switch between UTMZones and EPSG Numbers
//***************************************************************************************

CMProjectorUTM.prototype.GetUTMZoneFromEPSG=function(EPSGNumber)
{
	var UTMZone=0;
	
	if ((EPSGNumber>=CMProjector.EPSG_WGS84_UTM_1_NORTH)&&(EPSGNumber<=CMProjector.EPSG_WGS84_UTM_1_NORTH+59))
	{
		UTMZone=EPSGNumber-CMProjector.EPSG_WGS84_UTM_1_NORTH+1;
	}
	else if ((EPSGNumber>=CMProjector.EPSG_WGS84_UTM_1_SOUTH)&&(EPSGNumber<=CMProjector.EPSG_WGS84_UTM_1_SOUTH+59))
	{
		UTMZone=EPSGNumber-CMProjector.EPSG_WGS84_UTM_1_SOUTH+1;
	}
	return(UTMZone);
}

CMProjectorUTM.prototype.GetSouthFromEPSG=function(EPSGNumber)
{
	var South=false;
	
	if ((EPSGNumber>=CMProjector.EPSG_WGS84_UTM_1_SOUTH)&&(EPSGNumber<=CMProjector.EPSG_WGS84_UTM_1_SOUTH+59))
	{
		South=true;
	}
	return(South);
}

CMProjectorUTM.prototype.GetEPSGFromUTM=function(UTMZone,South)
{
	var EPSGNumber=0;
	
	if (South==false) // northern hemisphere
	{
		EPSGNumber=CMProjector.EPSG_WGS84_UTM_1_NORTH+UTMZone-1;
	}
	else // southern hemisphere
	{
		EPSGNumber=CMProjector.EPSG_WGS84_UTM_1_SOUTH+UTMZone-1;
	}
	
	return(EPSGNumber);
}
