////////////////////////////////////////////////////////////////////
//// funkcje aktywacyjne ktore zostana przypisane neuronom

var fSigm = 
{
	b: 1.0,
	ustawB: function(b)
	{
		this.b = b;
	},
	obl: function(s)
	{
		return 1.0/(1.0+Math.pow(Math.E,-1.0*this.b*s));
	},
	oblPochodna: function(s) // f(x)' = f(x)*(1-f(x))
	{
		var fs = this.obl(s);
		return fs*(1-fs);
	}
}

var fBrak = 
{
	// odzwierciedla brak funkcji aktywacyjnej
	// pozostawienie metod ujednolica interfejs
	obl: function(s)
	{
		return s;
	},
	oblPochodna: function(s) // (x)' = 1;
	{
		return 1;
	}
}

////////////////////////////////////////////////////////////////////
//// siec

function Neuron(fAktywacji, iloscX)
{
	this.w = []; // wagi wejsc
	this.x = []; // sygnały wejsciowe
				 // ich zapamietanie wymagane do późniejszej modyfikacji wag
	this.f = fAktywacji;
	this.y;
	this.blad = 0;
	this.bias = 1;
	this.s = 0;
	
	this.init = function(iloscX)
	{
		for(var i = 0; i<iloscX; i++)
		{
			this.w.push(0);
			this.x.push(0);
		}
	}
	this.init(iloscX);
	
	this.randW = function(min,max)
	{
		for(var i = 0; i<this.x.length; i++)
		{
			this.w[i] = Math.random()*(max-min)+min;
		}
	}
	
	this.resetuj = function()
	{
		this.blad = 0;
		this.s = 0;
	}
	
	this.oblS = function(xi) // x na wejsciu
	{
		this.x = xi;
		for(var i = 0; i<this.x.length; i++)
		{
			this.s = this.s + this.x[i]*this.w[i];
		}
		this.s = this.s + this.bias;
	}
	
	this.oblY = function()
	{
		this.y = this.f.obl(this.s);
	}
	
	// finalnie blad neuronu ma stanowić
	// 1) dla warstwy wyjściowej: (f'(s))(d-y)
	// 2) dla warstw (1..K-1): (f'(s))δk+1 * wk+1, czyli wykorzystac bledy i wagi neuronów warstwy wyższej
	//										  	   z którymi istnieją połączenia
	this.ustawBlad = function(blad)
	{
		this.blad = this.f.oblPochodna(this.s)*blad;
	}
	
	// funkcje nalezy wywolac po wyliczeniu wartości bledu dla neuronu (powyżej)
	this.modWaga = function(wspolUcz) 
	{
		// ze wzoru (6.124) - wi(t+1) = wi(t)+2*stalaNauki*δi*xi, przy czym δi = ε*f'(s)
		for(var i = 0; i<this.w.length; i++)
		{
			var deltaw = wspolUcz * this.blad * this.x[i];
			this.w[i] = this.w[i] + deltaw;
		}
	}
}

function Siec(iloscUkryta)
{
	this.wejscie = new Neuron(fSigm,1);
	this.ukryta = [];
	this.wyjscie = new Neuron(fBrak,iloscUkryta);
	this.iteracja = 0;
	
	this.init = function(iloscUkryta)
	{
		for(var i = 0; i<iloscUkryta; i++)
		{
			this.ukryta.push(new Neuron(fSigm,1));
		}
	}
	this.init(iloscUkryta);
	
	this.resetuj = function()
	{
		this.wejscie.resetuj();
		this.wyjscie.resetuj();
		for(var i = 0; i<this.ukryta.length; i++)
		{
			this.ukryta[i].resetuj();
		}
	}
	
	this.randW = function(min,max)
	{
		this.wejscie.randW(min,max);
		this.wyjscie.randW(min,max);
		for(var i = 0; i<this.ukryta.length; i++)
		{
			this.ukryta[i].randW(min,max);
		}
	}
	
	// operacja liczy y sieci
	this.dzialajProbka = function(x)
	{
		var xi = [];
		xi.push(x);
		this.wejscie.oblS(xi);
		this.wejscie.oblY();
		
		// sygnaly przekazywane do neuronów warstwy ukrytej
		// i wyliczane sygnaly wyjsciowe
		xi = [];
		xi.push(this.wejscie.y);
		for(var i = 0; i<this.ukryta.length; i++)
		{
			this.ukryta[i].oblS(xi);
			this.ukryta[i].oblY();
		}
		
		// sygnaly przekazywane do neuronu w warstwie wyjsciowej
		xi = [];
		for(var i = 0; i<this.ukryta.length; i++)
		{
			xi.push(this.ukryta[i].y);
		}
		this.wyjscie.oblS(xi);
		this.wyjscie.oblY();
	}
	
	this.modWagi = function(d,stalaNauki)
	{
		// blad neuronu wyjsciowego 
		var bladD = d - this.wyjscie.y;
		this.wyjscie.ustawBlad(bladD);
		
		// warstwa ukryta
		for(var i = 0; i<this.ukryta.length; i++)
		{
			this.ukryta[i].ustawBlad(this.wyjscie.blad*this.wyjscie.w[i]);
		}
		
		// neuron wejsciowy
		var calyBlad = 0;
		for(var i = 0; i<this.ukryta.length; i++)
		{
			calyBlad = calyBlad + this.ukryta[i].blad*this.ukryta[i].w[0];
		}
		this.wejscie.ustawBlad(calyBlad);
		
		// modyfikacja wag
		this.wyjscie.modWaga(stalaNauki);
		for(var i = 0; i<this.ukryta.length; i++)
		{
			this.ukryta[i].modWaga(stalaNauki);
		}
		this.wejscie.modWaga(stalaNauki);
	}
	
	this.uczSiec = function(ciagNauki,stalaNauki)
	{
		var ciagSieci = [];
		
		var bladEpoki = 0; // Σ(δ^2)
		for(var i = 0; i<ciagNauki.length; i++)
		{
			var probka = ciagNauki[i];
			siec.dzialajProbka(probka[0]);
			bladEpoki = bladEpoki + Math.pow(probka[1] - this.wyjscie.y,2.0);
			
			ciagSieci.push([probka[0],this.wyjscie.y]);
			
			siec.modWagi(probka[1],stalaNauki);
			siec.resetuj();
		}
		//bladEpoki = bladEpoki * 0.5;
		//if(bladEpoki>bladKontrolny) // znalezione minimum funkcji błędu
				//break;				    // oby globalne 
				
		//bladKontrolny = bladEpoki;
		this.iteracja++;
		
		rysujSiec(ciagSieci);
	}
}














