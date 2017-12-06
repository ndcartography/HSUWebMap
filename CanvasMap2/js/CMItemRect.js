//******************************************************************
// CMItemRect Class
// An object is something the user can move and edit within a layer
// Objects include rectangles, ovals, arrows, etc.
//******************************************************************
//******************************************************************
// Definitions
//******************************************************************

CMItemRect.RECTANGLE=0;
CMItemRect.OVAL=1; // arcs? pie slices?
CMItemRect.ROUNDED_RECTANGLE=2;

CMItemRect.PART_UPPER_LEFT=0;
CMItemRect.PART_UPPER_RIGHT=1;
CMItemRect.PART_LOWER_RIGHT=2;
CMItemRect.PART_LOWER_LEFT=3;
CMItemRect.PART_TOP=4;
CMItemRect.PART_RIGHT=5;
CMItemRect.PART_BOTTOM=6;
CMItemRect.PART_LEFT=7;
CMItemRect.PART_INSIDE=8;

//******************************************************************
// Constructor
//******************************************************************

/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemRect.SettingDefintions=
{
	Rectangle: 
	{ 
		Coordinates: { Name:"Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null }
	},
	RoundedRectangle:
	{
		RoundedCornerWidth: { Name:"Corner Width",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
		RoundedCornerHeight: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
	}
};

//******************************************************************
// CMItemRect Constructor
//******************************************************************
/**
* Basic rectangular object
*/
function CMItemRect(TheType) 
{
	CMItem.call(this);
	
	this.Type=TheType;
	
	switch (TheType)
	{
	case CMItemRect.RECTANGLE:
		this.Name="Rectangle";
		break;
	case CMItemRect.OVAL:
		this.Name="Oval";
		break;
	case CMItemRect.ROUNDED_RECTANGLE:
		this.Name="Rounded Rectangle";
		break;
	}

	this.Anchor=null; // JSON with X,Y
	this.Dragging=false;
	
	this.TimeSlices[0].Settings.Rectangle=	
	{
		Coordinates:
		{
			Xs:[0,10], // min,max
			Ys:[0,10] // Min,max
		}
	};
	this.TimeSlices[0].Settings.RoundedRectangle=
	{
		RoundedCornerWidth:3,
		RoundedCornerHeight:3
	};
}
CMItemRect.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMItem (makes a copy of CMItem and puts it into the prototype for CMItemRect
// the prototype is copied (without cloning the object's contents) into each new object

CMItemRect.prototype.contructor=CMItemRect; // override the constructor to go to ours
//******************************************************************
// CMBase Functions
//******************************************************************

CMItemRect.prototype.GetName=function()  
{ 
	return(this.Name); 
}
CMItemRect.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions;

CMItemRect.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions();
	
	for (Key in CMItemRect.SettingDefintions)
	{
		Result[Key]=CMItemRect.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// CMItemRect Functions
//******************************************************************

//******************************************************************
// CMItemRect Functions
//******************************************************************
CMItemRect.prototype.GetControlBounds=function()
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	var Bounds={
		XMin:Coordinates.Xs[0],
		XMax:Coordinates.Xs[1],
		YMin:Coordinates.Ys[0],
		YMax:Coordinates.Ys[1]
	}
	return(Bounds);
}
CMItemRect.prototype.SetControlBounds=function(XMin,XMax,YMin,YMax)
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[0]=XMin;
	Coordinates.Xs[1]=XMax;
	Coordinates.Ys[0]=YMin;
	Coordinates.Ys[1]=YMax;
}



CMItemRect.prototype.GetAnchor=function(RefX,RefY,ThePart)
{
	var AnchorY=0;
	var AnchorX=0;
	
	var Bounds=this.GetControlBounds();
	
	switch (ThePart)
	{
	case CMItemRect.PART_LOWER_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_UPPER_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMax;
		break;
	case CMItemRect.PART_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		break;
	case CMItemRect.PART_LOWER_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_UPPER_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMax;
		break;
	case ThePart=CMItemRect.PART_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		break;
	case CMItemRect.PART_TOP:
		AnchorY=RefY-Bounds.YMax;
		break;
	case CMItemRect.PART_BOTTOM:
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_INSIDE:
		AnchorX=RefX-Bounds.XMin; // use bottom left
		AnchorY=RefY-Bounds.YMin;
		break;
	}
	return({X:AnchorX,Y:AnchorY});
}
CMItemRect.prototype.InPart=function(TheView,RefX,RefY,ClickTolerance)
{
	var ThePart=-1;
	
	var Tolerance=TheView.GetRefWidthFromPixelWidth(ClickTolerance);
		
	var Bounds=this.GetControlBounds();
	
	if ((RefX<Bounds.XMax+Tolerance)&&(RefX>Bounds.XMin-Tolerance)
		&&(RefY<Bounds.YMax+Tolerance)&&(RefY>Bounds.YMin-Tolerance)) // within the object bounds
	{
		if (RefX<Bounds.XMin+Tolerance) // left side
		{
			if (RefY<Bounds.YMin+Tolerance) // bottom left
			{
				ThePart=CMItemRect.PART_LOWER_LEFT;
			}
			else if (RefY>Bounds.YMax-Tolerance) // top left
			{
				ThePart=CMItemRect.PART_UPPER_LEFT;
			}
			else  // left side
			{
				ThePart=CMItemRect.PART_LEFT;
			}
			Bounds.AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		}
		else if (RefX>Bounds.XMax-Tolerance) // right side
		{
			if (RefY<Bounds.YMin+Tolerance) // bottom right
			{
				ThePart=CMItemRect.PART_LOWER_RIGHT;
			}
			else if (RefY>Bounds.YMax-Tolerance) // top right
			{
				ThePart=CMItemRect.PART_UPPER_RIGHT;
			}
			else  // right side
			{
				ThePart=CMItemRect.PART_RIGHT;
			}
		}
		else if (RefY>Bounds.YMax-Tolerance) // top 
		{
			ThePart=CMItemRect.PART_TOP;
		}
		else if (RefY<Bounds.YMin+Tolerance) // bottom
		{
			ThePart=CMItemRect.PART_BOTTOM;
		}
		else
		{
			ThePart=CMItemRect.PART_INSIDE;
		}
	}
	return(ThePart);
}
CMItemRect.prototype.SetXMin=function(RefX) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[0]=RefX;
	if (Coordinates.Xs[0]>Coordinates.Xs[1]) Coordinates.Xs[0]=Coordinates.Xs[1];
}
CMItemRect.prototype.SetXMax=function(RefX) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[1]=RefX;
	if (Coordinates.Xs[1]<Coordinates.Xs[0]) Coordinates.Xs[1]=Coordinates.Xs[0];
}
CMItemRect.prototype.SetYMin=function(RefY) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Ys[0]=RefY;
	if (Coordinates.Ys[0]>Coordinates.Ys[1]) Coordinates.Ys[0]=Coordinates.Ys[1];
}
CMItemRect.prototype.SetYMax=function(RefY) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Ys[1]=RefY;
	if (Coordinates.Ys[1]<Coordinates.Ys[0]) Coordinates.Ys[1]=Coordinates.Ys[0];
}
//******************************************************************
// CMItem Functions
//******************************************************************

CMItemRect.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	var SelectedPart=this.InPart(TheView,RefX,RefY,4);
	
	if (SelectedPart!=-1)
	{
		this.Dragging=true;
		this.SelectedPart=SelectedPart;
		this.Anchor=this.GetAnchor(RefX,RefY,SelectedPart);
		Used=true;
	}
}
CMItemRect.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if (this.Dragging) // dragging an existing item (create or update)
	{
		var Anchor=this.Anchor;
		
		switch (this.SelectedPart)
		{
		case CMItemRect.PART_UPPER_LEFT:
			this.SetXMin(RefX+Anchor.X);
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_UPPER_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LOWER_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LOWER_LEFT:
			this.SetXMin(RefX+Anchor.X);
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_TOP:
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			break;
		case CMItemRect.PART_BOTTOM:
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LEFT:
			this.SetXMin(RefX+Anchor.X);
			break;
		case CMItemRect.PART_INSIDE:
			var Result=this.GetBoundingTimeSlices();
			
			var Coordinates=Result[0].Settings.Rectangle.Coordinates;
			
			var Width=Coordinates.Xs[1]-Coordinates.Xs[0];
			var Height=Coordinates.Ys[1]-Coordinates.Ys[0];
			
			Coordinates.Xs[0]=RefX-Anchor.X;
			Coordinates.Ys[0]=RefY-Anchor.Y;
			Coordinates.Xs[1]=RefX+Width-Anchor.X;
			Coordinates.Ys[1]=RefY+Height-Anchor.Y;
			break;
		}
		Used=true;
		this.Repaint();
	}
	else // update the mouse cursor
	{
		var ThePart=this.InPart(TheView,RefX,RefY);
		
		var TheCanvasMap=this.GetParent().GetCanvasMap();
		var TheCanvasElement=TheCanvasMap.GetElement(CMMainContainer.CANVAS);
		
		TheCanvasElement.style.cursor = "crosshair";
		
		switch (ThePart)
		{
		case CMLayerItems.PART_UPPER_LEFT:
			TheCanvasElement.style.cursor = "nw-resize";
			break;
		case CMLayerItems.PART_UPPER_RIGHT:
			TheCanvasElement.style.cursor = "ne-resize";
			break;
		case CMLayerItems.PART_LOWER_RIGHT:
			TheCanvasElement.style.cursor = "se-resize";
			break;
		case CMLayerItems.PART_LOWER_LEFT:
			TheCanvasElement.style.cursor = "sw-resize";
			break;
		case CMLayerItems.PART_TOP:
		case CMLayerItems.PART_BOTTOM:
			TheCanvasElement.style.cursor = "s-resize";
			break;
		case CMLayerItems.PART_RIGHT:
		case CMLayerItems.PART_LEFT:
			TheCanvasElement.style.cursor = "e-resize";
			break;
		case CMLayerItems.PART_INSIDE:
			TheCanvasElement.style.cursor = "move";
			break;
		}
	}
	return(Used);
}
CMItemRect.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if ((this.Dragging)) // 
	{
		this.Dragging=false;
		Used=true;
	}
	return(Used);
};

CMItemRect.prototype.Paint=function(TheView) 
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var TheStyle=this.GetStyle(TheView,MinTime);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
	
	var Bounds=this.GetControlBounds();
	
	switch (this.Type)
	{
	case CMItemRect.RECTANGLE:
		TheView.PaintRefRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax);
		break;
	case CMItemRect.OVAL:
		TheView.PaintRefArc(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax,0,2*Math.PI)
		break;
	case CMItemRect.ROUNDED_RECTANGLE:
		var Result=this.GetBoundingTimeSlices(MinTime);
		
		var RoundedRectangle=Result[0].Settings.RoundedRectangle;
		
		TheView.PaintRefRoundedRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax,
			RoundedRectangle.RoundedCornerWidth,RoundedRectangle.RoundedCornerHeight);
		break;
	}
/*	var FontSize=30; // in pixels (only uesd on collision detection)
	var RefFontSize=TheView.GetRefHeightFromPixelHeight(FontSize);
	
	var RefY=(Bounds.YMin+Bounds.YMax)/2+(RefFontSize/2);
	var RefX=(Bounds.XMin+Bounds.XMax)/2;
	TheView.TheContext.font = FontSize+"px arial";
	TheView.TheContext.fillStyle = "red";
	TheView.TheContext.strokeStyle = "blue";
	TheView.TheContext.lineWidth = 1;
	TheView.TheContext.shadowColor = "black";
	TheView.TheContext.shadowBlur = "4";
	
	TheView.PaintRefText("Hi!",RefX,RefY,FontSize,"center",0)
*/	
	if (TheStyle!=undefined) TheView.RestoreStyle();
}
CMItemRect.prototype.PaintSelected=function(TheView) 
{
	if (this.GetSelected())
	{
		TheView.SaveStyle();
		
		TheView.SetStyle({fillStyle:"rgba(0,0,0,1)",strokeStyle:"white"});
		
		var Bounds=this.GetControlBounds();
		
		TheView.PaintRefCircle(Bounds.XMin,Bounds.YMin,5);
		TheView.PaintRefCircle(Bounds.XMin,Bounds.YMax,5);
		TheView.PaintRefCircle(Bounds.XMax,Bounds.YMin,5);
		TheView.PaintRefCircle(Bounds.XMax,Bounds.YMax,5);
		
		TheView.RestoreStyle();
	}
}

CMItemRect.prototype.StartCreating=function(RefX,RefY) 
{
	this.Anchor={X:0,Y:0};
	this.SelectedPart=CMItemRect.PART_LOWER_RIGHT;
	this.Dragging=true;
}
