var setF = 
{
	xlimit: 3*3.14159265359,
	ylimit: 2*3.14159265359,
	punktyRysujIlosc: 300,
	punktyRysujF: [],
	punktSieci: 10
}

var setVar = 
{
	canvas: document.getElementById("canvas"),
	c: canvas.getContext("2d"),
	xPixel: canvas.width/setF.xlimit,
	yPixel: canvas.height/setF.ylimit,
	offsetX: 0,
	offsetY: canvas.height/2
}

function budujPunktyF()
{
	var pom = setF.xlimit;
	var pom2 = setF.punktyRysujIlosc;
	var skokX = setF.xlimit/setF.punktyRysujIlosc;
	for(var i = 0; i<setF.punktyRysujIlosc; i++)
	{
		var punkt = new Array();
		punkt.push(skokX*i); // x
		punkt.push(Math.sin(skokX*i)*Math.sin(2*(skokX*i))); // f(x)
		setF.punktyRysujF.push(punkt);
	}
}

function budujCiag(ilosc)
{
	var ciag = [];
	var skokX = setF.xlimit/(ilosc+1);
	for(var i = 1; i<ilosc+1; i++)
	{
		var probka = new Array();
		probka.push(skokX*i); // x
		probka.push(Math.sin(skokX*i)*Math.sin(2*(skokX*i))); // f(x)
		ciag.push(probka);
	}
	return ciag;
}

//////////////////////////////////////////////////////////////////////////////////

function rysujOsie()
{
	var ctx = setVar.c;
	var offX = setVar.offsetX;
	var offY = setVar.offsetY;
	var side = setVar.canvas.height;
	
	ctx.strokeStyle = "rgb(100,100,100)";
	ctx.beginPath();
	ctx.moveTo(-10000+offX,side-(0+offY));
	ctx.lineTo(10000+offX,side-(0+offY));
	//ctx.moveTo(0+offX,side-(-10000+offY));
	//ctx.lineTo(0+offX,side-(10000+offY));
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
}

function rysujF()
{
	var ctx = setVar.c;
	var side = setVar.canvas.height;
	var offX = setVar.offsetX;
	var offY = setVar.offsetY;
	
	ctx.strokeStyle = "rgb(255,0,0)";
	ctx.beginPath();
	
	ctx.moveTo(setF.punktyRysujF[0][0]*setVar.xPixel+offX,side-(setF.punktyRysujF[0][1]*setVar.yPixel+offY));
	for(var i = 1; i<setF.punktyRysujF.length; i++)
	{
		ctx.lineTo(setF.punktyRysujF[i][0]*setVar.xPixel+offX,side-(setF.punktyRysujF[i][1]*setVar.yPixel+offY));
	}
	
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.closePath();
}

function rysujWszystko()
{
	setVar.c.clearRect(0,0,setVar.canvas.width,setVar.canvas.height);
	rysujOsie();
	rysujF();
}

function rysujSiec(ciag)
{
	rysujWszystko();
	for(var i = 0; i<ciag.length; i++)
	{
		rysujPunktSieci(ciag[i]);
	}
}

function rysujPunktSieci(punkt)
{
	var ctx = setVar.c;
	var side = setVar.canvas.height;
	var offX = setVar.offsetX;
	var offY = setVar.offsetY;
	
	ctx.strokeStyle = "rgb(0,255,0)";
	
	ctx.beginPath();
	ctx.moveTo(punkt[0]*setVar.xPixel-setF.punktSieci/2+offX,side-(punkt[1]*setVar.yPixel+offY));
	ctx.lineTo(punkt[0]*setVar.xPixel+setF.punktSieci/2+offX,side-(punkt[1]*setVar.yPixel+offY));
	ctx.lineWidth = setF.punktSieci;
	ctx.stroke();
	ctx.closePath();
	
	ctx.lineWidth = setF.punktSieci;
	ctx.stroke();
	ctx.closePath();
}

////////////////////////////////////////////////////////////////////////////////////////////
var animVars =
{
	interVar: false,
	czyAnim: false
}

function buttonUczAnim()
{
	//var czas = parseFloat(document.getElementsByName('texttime')[0].value);
	var czas = parseFloat(1000);
	if(isNaN(czas))
		czas = 50;
	odpalAnim(czas);
}

function odpalAnim(czas)
{
	if(animVars.czyAnim)
	{
		clearInterval(animVars.interVar);
		animVars.czyAnim = false;
	}
	else
	{
		animVars.interVar = setInterval('uczAnimuj()',czas);
		animVars.czyAnim = true;
	}
}

function uczAnimuj()
{
	
	siec.uczSiec(ciag, 0.5);
}
////////////////////////////////////////////////////////////////////////////////////////////
budujPunktyF();
rysujOsie();
rysujF();

var ciag = budujCiag(40);

var siec = new Siec(4);
siec.randW(-2.0,2.0);











