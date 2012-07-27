({
	"nl" : {
		"question1"	: 'Hoeveel mensen waren er op <var>person( 1 )</var>s  verjaardagsfeestje?',
		"question2"	: 'Hoeveel geld heeft <var>person( 1 )</var> uitgegeven?',
		"question3"	: 'Hoeveel geld heeft <var>person( 1 )</var> uitgegeven aan ingeblikt voedsel?',
		"question4"	: 'Hoeveel liter gas was er over in de tank?',
		"question5"	: 'Hoeveel volwassenen waren aanwezig bij de picknick?',
		"question6"	: 'Hoeveel kopjes met chocolade vlokken heeft <var>person(1)</var> in totaal nodig?',
		
		"problem1"	: '<var>person( 1 )</var> heeft <var>INVITEES</var> vrienden uitgenodigd voor <var>his( 1 )</var> verjaardagsfeestje. Sommige mensen hadden andere plannen en waren verhinderd, maar <code>\\frac{<var>N</var>}{<var>D</var>}</code> van de mensen die <var>person( 1 )</var> had uitgenodigd konden wel komen.',
		"problem2"	: '<var>person( 1 )</var> heeft een tijdje gespaard en heeft nu €<var>AMOUNT</var>.00 in <var>his( 1 )</var> spaarpot. Van dit geld heeft <var>he( 1 )</var> <code>\\frac{<var>N</var>}{<var>D</var>}</code> deel uitgegeven aan boeken.',
		"problem3"	: 'Elke dag stopt <var>person( 1 )</var> het losgeld uit <var>his( 1 )</var> zakken in een glazen potje. Na <var>randRange( 10, 30 )</var> weken heeft <var>he( 1 )</var> € <var>AMOUNT</var>.00 gespaard. <var>person( 1 )</var> besluit om <code>\\frac{<var>N</var>}{<var>D</var>}</code> van het geld in het glazen potje aan ingeblikt voedsel voor de daklozenopvang te besteden.',
		"problem4"	: 'Voordat hij op vakantie gaat, vult <var>person( 1 )</var> <var>his( 1 )</var> gastank, welke <var>GALLONS</var> liters gas kan bevatten. Na <var>0.5 * randRange( 3 / 0.5, 10 / 0.5 )</var> uur merkt <var>person( 1 )</var> op dat de gastank voor <code>\\frac{<var>N</var>}{<var>D</var>}</code> gevuld is.',
		"problem5"	: '<var>ATTENDEES</var> mensen houden een picknick in het park. <code>\\frac{<var>N</var>}{<var>D</var>}</code> deel van de mensen op de picknick zijn volwassen.',
		"problem6"	: '<var>person(1)</var> heeft koekjes gebakken voor een benefiet. Op basis van het recept dat <var>He(1)</var> gebruikt is <code>\\frac{<var>N</var>}{<var>D</var>}</code> van een kopje chocolade vlokken nodig.',
		"problem7"	: 'Op basis van het recept dat <var>person(1)</var> gebruikt is <var>BATCHES</var> van een kopje chocolade vlokken nodig.',
		
		"hint1"		: 'We moeten erachter komen welk deel <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> is van <code><var>INVITEES</var></code> om te beantwoorden hoeveel mensen er op het feestje waren.',
		"hint2"		: 'We kunnen het antwoord op <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code><var>INVITEES</var></code> vinden door <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> met <code class="hint_orange"><var>INVITEES</var></code> te vermenigvuldigen.',
		"hint3"		: 'We kunnen al zien dat <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code class="hint_orange"><var>INVITEES</var></code> <code class="hint_green"><var>SOLUTION</var></code> is:',
		"hint4"		: 'Er waren <strong><var>SOLUTION</var> mensen op <var>person( 1 )</var>s feestje.',
		"hint5"		: 'Om erachter te komen hoeveel <var>person(1)</var> uitgegeven heeft, moeten we berekenen wat <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code>€<var>AMOUNT</var>.00</code> is.',
		"hint6"		: 'We kunnen het antwoord op <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code>$<var>AMOUNT</var>.00</code> vinden door <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> met <code class="hint_orange"><var>AMOUNT</var></code> te vermenigvuldigen.',
		"hint7"		: 'We kunnen al zien dat <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code class="hint_orange"><var>AMOUNT</var></code> <code class="hint_green"><var>SOLUTION</var></code> is:',
		"hint8"		: '<strong><var>person( 1 )</var> heeft €<var>SOLUTION</var>.00 uitgegeven aan boeken.',
		"hint9"		: 'Om te beantwoorden hoeveel <var>person(1)</var> heeft uitgegeven, moeten we achterhalen wat <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> deel van <code>€<var>AMOUNT</var>.00</code> is.',
		"hint10"	: 'We kunnen het antwoord op <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code>$<var>AMOUNT</var>.00</code> vinden door <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> met <code class="hint_orange"><var>AMOUNT</var></code> te vermenigvuldigen.',
		"hint11"	: 'We kunnen al zien dat <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code class="hint_orange"><var>AMOUNT</var></code> <code class="hint_green"><var>SOLUTION</var></code> is:',
		"hint12"	: '<strong><var>person( 1 )</var> heeft €<var>SOLUTION</var>.00 uitgegeven aan geblikt voedsel voor de daklozenopvang',
		"hint13"	: 'Omdat er een deel van het gas in<var>his( 1 )</var> gastank over was, hoeven we alleen uit te zoeken wat <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code><var>GALLONS</var></code> liter is om uit te zoeken hoeveel gas er over was in de gastank.',
		"hint14"	: 'We kunnen het antwoord op <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code><var>GALLONS</var></code> vinden door <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> met <code class="hint_orange"><var>GALLONS</var></code> te vermenigvuldigen.',
		"hint15"	: 'We kunnen al zien dat <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code class="hint_orange"><var>GALLONS</var></code> <code class="hint_green"><var>SOLUTION</var></code> is:',
		"hint16"	: '<strong><var>person( 1 )</var> had <var>SOLUTION</var> liter gas over in <var>his( 1 )</var> gastank toen hij <var>he( 1 )</var> dit controleerde.</strong>',
		"hint17"	: 'We moeten erachter komen wat <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code><var>ATTENDEES</var></code> is om uit te vinden hoeveel mensen op de picknick volwassenen waren.',
		"hint18"	: 'We kunnen het antwoord op <code>\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code><var>ATTENDEES</var></code> vinden door <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> met <code class="hint_orange"><var>ATTENDEES</var></code> te vermenigvuldigen.',
		"hint19"	: 'We kunnen al zien dat <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> van <code class="hint_orange"><var>ATTENDEES</var></code> <code class="hint_green"><var>SOLUTION</var></code> is:',
		"hint20"	: 'Er waren <strong><var>SOLUTION</var> volwassenen op de picknick.</strong>',
		"hint21"	: 'Om te achterhalen hoeveel kopjes chocolade vlokken <var>person(1)</var> nodig heeft, vermenigvuldigen we <code class="hint_blue">\\dfrac{<var>N</var>}{<var>D</var>}</code> kopje met de <code class="hint_orange"><var>BATCHES</var></code> bakplaten.',
		"hint22"	: '<strong><var>person(1)</var> heeft <var>plural(<var>SOLUTION</var>,"kopjes")</var> chocolade vlokken nodig om voldoende koekjes te maken voor de benefietverkoop.</strong>'
		}
})