// Obsah kurzu A1. Každá lekce: gramatika (tahák), slovíčka/fráze, doplňovačky.
// es = španělsky, cz = česky, esAlt = další uznávané španělské odpovědi.
// fill: s = věta s ___, a = správná odpověď, opts = možnosti, cz = překlad věty.

const LESSONS = [
  {
    id: 'l1', title: 'Saludos', cz: 'Pozdravy a představení',
    grammar: [
      { title: 'Sloveso SER = být', body: `
        <table class="conj">
          <tr><td>yo</td><td><b>soy</b></td><td>já jsem</td></tr>
          <tr><td>tú</td><td><b>eres</b></td><td>ty jsi</td></tr>
          <tr><td>él / ella / usted</td><td><b>es</b></td><td>on / ona / vy (zdvořile) je</td></tr>
        </table>
        <p>Zájmeno se ve španělštině často vynechává, stejně jako v češtině: <i>Soy de Chlumec.</i> = Jsem z Chlumce.</p>` },
      { title: 'Otázky a zvolání', body: `
        <p>Otázka i zvolání mají znaménko <b>na začátku</b> (vzhůru nohama) i na konci:</p>
        <p class="ex">¿Cómo estás? · ¡Hola!</p>
        <p><b>Me llamo…</b> = Jmenuji se… &nbsp;·&nbsp; <b>¿Cómo te llamas?</b> = Jak se jmenuješ?</p>` }
    ],
    items: [
      { es: 'hola', cz: 'ahoj' },
      { es: 'buenos días', cz: 'dobré ráno / dobrý den' },
      { es: 'buenas tardes', cz: 'dobré odpoledne' },
      { es: 'buenas noches', cz: 'dobrý večer / dobrou noc' },
      { es: 'adiós', cz: 'nashle / sbohem' },
      { es: 'hasta luego', cz: 'zatím / uvidíme se' },
      { es: 'por favor', cz: 'prosím' },
      { es: 'gracias', cz: 'děkuju' },
      { es: 'de nada', cz: 'není zač' },
      { es: 'perdón', cz: 'promiň / pardon' },
      { es: 'sí', cz: 'ano' },
      { es: 'yo soy', cz: 'já jsem' },
      { es: 'tú eres', cz: 'ty jsi' },
      { es: 'ella es', cz: 'ona je' },
      { es: '¿Cómo te llamas?', cz: 'Jak se jmenuješ?' },
      { es: 'Me llamo Ana.', cz: 'Jmenuju se Ana.' },
      { es: 'Mucho gusto.', cz: 'Těší mě.', esAlt: ['encantado', 'encantada'] },
      { es: '¿Cómo estás?', cz: 'Jak se máš?' },
      { es: 'Estoy bien.', cz: 'Mám se dobře.', esAlt: ['bien', 'muy bien', 'estoy muy bien'] },
      { es: '¿De dónde eres?', cz: 'Odkud jsi?' },
      { es: 'Soy de la República Checa.', cz: 'Jsem z České republiky.', esAlt: ['soy de republica checa', 'soy de chequia'] }
    ],
    fill: [
      { s: 'Yo ___ de Chlumec.', a: 'soy', opts: ['soy', 'eres', 'es'], cz: 'Jsem z Chlumce.' },
      { s: '¿Tú ___ Pablo?', a: 'eres', opts: ['soy', 'eres', 'es'], cz: 'Ty jsi Pablo?' },
      { s: 'Ella ___ Ana.', a: 'es', opts: ['soy', 'eres', 'es'], cz: 'Ona je Ana.' },
      { s: '¿Cómo te ___?', a: 'llamas', opts: ['llamo', 'llamas', 'llama'], cz: 'Jak se jmenuješ?' },
      { s: 'Me ___ Ondřej.', a: 'llamo', opts: ['llamo', 'llamas', 'llama'], cz: 'Jmenuju se Ondřej.' }
    ]
  },
  {
    id: 'l2', title: 'Números y colores', cz: 'Čísla a barvy',
    grammar: [
      { title: 'Čísla 0–20', body: `
        <p class="ex">0 cero · 1 uno · 2 dos · 3 tres · 4 cuatro · 5 cinco · 6 seis · 7 siete · 8 ocho · 9 nueve · 10 diez</p>
        <p class="ex">11 once · 12 doce · 13 trece · 14 catorce · 15 quince · 16 dieciséis · 17 diecisiete · 18 dieciocho · 19 diecinueve · 20 veinte</p>
        <p>Desítky: 30 treinta · 40 cuarenta · 50 cincuenta · 100 cien. Mezi desítky a jednotky dáváš <b>y</b>: 35 = <i>treinta y cinco</i>.</p>` },
      { title: 'Barvy mění koncovku', body: `
        <p>Barva se řídí podstatným jménem, stejně jako v češtině:</p>
        <p class="ex">el coche roj<b>o</b> · la casa roj<b>a</b> · los coches roj<b>os</b></p>
        <p>Barvy na <b>-e</b> nebo souhlásku se v rodě nemění: <i>verde, azul</i>.</p>
        <p><b>Tengo 20 años.</b> = Je mi 20 let (doslova „mám 20 let“).</p>` }
    ],
    items: [
      { es: 'uno', cz: 'jedna' }, { es: 'dos', cz: 'dva' }, { es: 'tres', cz: 'tři' },
      { es: 'cuatro', cz: 'čtyři' }, { es: 'cinco', cz: 'pět' }, { es: 'seis', cz: 'šest' },
      { es: 'siete', cz: 'sedm' }, { es: 'ocho', cz: 'osm' }, { es: 'nueve', cz: 'devět' },
      { es: 'diez', cz: 'deset' }, { es: 'quince', cz: 'patnáct' }, { es: 'veinte', cz: 'dvacet' },
      { es: 'cien', cz: 'sto' },
      { es: 'rojo', cz: 'červený' }, { es: 'azul', cz: 'modrý' }, { es: 'verde', cz: 'zelený' },
      { es: 'amarillo', cz: 'žlutý' }, { es: 'negro', cz: 'černý' }, { es: 'blanco', cz: 'bílý' },
      { es: '¿Cuántos años tienes?', cz: 'Kolik ti je let?' },
      { es: 'Tengo veinte años.', cz: 'Je mi dvacet let.', esAlt: ['tengo 20 años'] }
    ],
    fill: [
      { s: 'La casa es ___.', a: 'blanca', opts: ['blanco', 'blanca', 'blancos'], cz: 'Ten dům je bílý.' },
      { s: 'El coche es ___.', a: 'negro', opts: ['negro', 'negra', 'negras'], cz: 'To auto je černé.' },
      { s: 'Yo ___ veinte años.', a: 'tengo', opts: ['tengo', 'tienes', 'soy'], cz: 'Je mi dvacet let.' },
      { s: 'Tengo veinte ___.', a: 'años', opts: ['años', 'anos', 'año'], cz: 'Je mi dvacet let.' },
      { s: 'Treinta ___ cinco.', a: 'y', opts: ['y', 'e', 'o'], cz: 'Třicet pět.' }
    ]
  },
  {
    id: 'l3', title: 'La familia', cz: 'Rodina a sloveso tener',
    grammar: [
      { title: 'Sloveso TENER = mít', body: `
        <table class="conj">
          <tr><td>yo</td><td><b>tengo</b></td><td>mám</td></tr>
          <tr><td>tú</td><td><b>tienes</b></td><td>máš</td></tr>
          <tr><td>él / ella</td><td><b>tiene</b></td><td>má</td></tr>
        </table>
        <p class="ex">Tengo una hermana. · ¿Tienes hermanos?</p>` },
      { title: 'Můj, tvůj, jeho', body: `
        <table class="conj">
          <tr><td><b>mi</b> padre</td><td><b>mis</b> padres</td><td>můj / moji</td></tr>
          <tr><td><b>tu</b> madre</td><td><b>tus</b> hermanos</td><td>tvůj / tvoji</td></tr>
          <tr><td><b>su</b> hijo</td><td><b>sus</b> hijos</td><td>jeho / její</td></tr>
        </table>
        <p><b>los padres</b> = rodiče, <b>los hermanos</b> = sourozenci (i bratři).</p>` }
    ],
    items: [
      { es: 'la familia', cz: 'rodina' }, { es: 'el padre', cz: 'otec' }, { es: 'la madre', cz: 'matka' },
      { es: 'los padres', cz: 'rodiče' }, { es: 'el hermano', cz: 'bratr' }, { es: 'la hermana', cz: 'sestra' },
      { es: 'el hijo', cz: 'syn' }, { es: 'la hija', cz: 'dcera' }, { es: 'el abuelo', cz: 'dědeček' },
      { es: 'la abuela', cz: 'babička' }, { es: 'la novia', cz: 'přítelkyně (holka)' }, { es: 'el novio', cz: 'přítel (kluk)' },
      { es: 'el amigo', cz: 'kamarád' }, { es: 'la amiga', cz: 'kamarádka' },
      { es: 'mi padre', cz: 'můj otec' }, { es: 'tu madre', cz: 'tvoje matka' }, { es: 'su hermano', cz: 'jeho bratr' },
      { es: 'Tengo un hermano.', cz: 'Mám bratra.' },
      { es: '¿Tienes hermanos?', cz: 'Máš sourozence?' },
      { es: 'Mi hermana tiene veinte años.', cz: 'Moje sestra má dvacet let.', esAlt: ['mi hermana tiene 20 años'] }
    ],
    fill: [
      { s: '___ padre se llama Pavel.', a: 'mi', opts: ['mi', 'tu', 'mis'], cz: 'Můj otec se jmenuje Pavel.' },
      { s: 'Yo ___ una hermana.', a: 'tengo', opts: ['tengo', 'tienes', 'tiene'], cz: 'Mám sestru.' },
      { s: '¿___ hermanos?', a: 'tienes', opts: ['tengo', 'tienes', 'tiene'], cz: 'Máš sourozence?' },
      { s: 'Mis ___ son de Praga.', a: 'padres', opts: ['padre', 'padres', 'madre'], cz: 'Moji rodiče jsou z Prahy.' },
      { s: 'Ella ___ un novio.', a: 'tiene', opts: ['tengo', 'tienes', 'tiene'], cz: 'Ona má přítele.' }
    ]
  },
  {
    id: 'l4', title: 'La comida', cz: 'Jídlo, chci a chutná mi',
    grammar: [
      { title: 'QUERER = chtít', body: `
        <table class="conj">
          <tr><td>yo</td><td><b>quiero</b></td><td>chci</td></tr>
          <tr><td>tú</td><td><b>quieres</b></td><td>chceš</td></tr>
          <tr><td>él / ella / usted</td><td><b>quiere</b></td><td>chce / chcete</td></tr>
        </table>
        <p class="ex">Quiero un café, por favor.</p>` },
      { title: 'ME GUSTA = líbí se mi / chutná mi', body: `
        <p>Jedna věc → <b>gusta</b>, víc věcí → <b>gustan</b>:</p>
        <p class="ex">Me gusta el queso. · Me gustan las manzanas.</p>
        <p><b>Tengo hambre</b> = mám hlad, <b>tengo sed</b> = mám žízeň. Hlad se ve španělštině „má“.</p>` }
    ],
    items: [
      { es: 'el agua', cz: 'voda' }, { es: 'el café', cz: 'káva' }, { es: 'la cerveza', cz: 'pivo' },
      { es: 'el vino', cz: 'víno' }, { es: 'la leche', cz: 'mléko' }, { es: 'el pan', cz: 'chleba' },
      { es: 'el queso', cz: 'sýr' }, { es: 'la carne', cz: 'maso' }, { es: 'el pollo', cz: 'kuře' },
      { es: 'el pescado', cz: 'ryba (k jídlu)' }, { es: 'el arroz', cz: 'rýže' }, { es: 'la fruta', cz: 'ovoce' },
      { es: 'la manzana', cz: 'jablko' }, { es: 'el desayuno', cz: 'snídaně' }, { es: 'la cena', cz: 'večeře' },
      { es: 'Tengo hambre.', cz: 'Mám hlad.' }, { es: 'Tengo sed.', cz: 'Mám žízeň.' },
      { es: 'Quiero un café.', cz: 'Chci kávu.' },
      { es: 'Me gusta el queso.', cz: 'Chutná mi sýr.' },
      { es: 'La cuenta, por favor.', cz: 'Účet, prosím.' }
    ],
    fill: [
      { s: 'Me ___ el café.', a: 'gusta', opts: ['gusta', 'gustan', 'gusto'], cz: 'Chutná mi káva.' },
      { s: 'Me ___ las manzanas.', a: 'gustan', opts: ['gusta', 'gustan', 'gusto'], cz: 'Chutnají mi jablka.' },
      { s: '___ un vino, por favor.', a: 'quiero', opts: ['quiero', 'quieres', 'quiere'], cz: 'Chci víno, prosím.' },
      { s: '¿Qué ___ tú?', a: 'quieres', opts: ['quiero', 'quieres', 'quiere'], cz: 'Co chceš ty?' },
      { s: 'Tengo ___.', a: 'sed', opts: ['sed', 'hambre', 'años'], cz: 'Mám žízeň.' }
    ]
  },
  {
    id: 'l5', title: 'En la ciudad', cz: 'Město, hay, ser × estar',
    grammar: [
      { title: 'HAY = je / jsou (tam)', body: `
        <p><b>Hay</b> říká, že něco existuje. Nemění se, platí pro jednu i víc věcí:</p>
        <p class="ex">Hay un parque. · Hay dos bancos. · ¿Hay una farmacia cerca?</p>` },
      { title: 'SER × ESTAR', body: `
        <p>Obě znamenají „být“, ale:</p>
        <p><b>ser</b>: kdo/co je, odkud je, povaha. <i>Soy estudiante. Soy de Chlumec.</i></p>
        <p><b>estar</b>: <b>kde</b> je a <b>jak</b> se má teď. <i>Madrid está en España. Estoy cansado.</i></p>
        <table class="conj">
          <tr><td>yo</td><td><b>estoy</b></td></tr><tr><td>tú</td><td><b>estás</b></td></tr><tr><td>él / ella</td><td><b>está</b></td></tr>
        </table>` }
    ],
    items: [
      { es: 'la calle', cz: 'ulice' }, { es: 'la plaza', cz: 'náměstí' }, { es: 'el banco', cz: 'banka' },
      { es: 'la farmacia', cz: 'lékárna' }, { es: 'el supermercado', cz: 'supermarket' },
      { es: 'el restaurante', cz: 'restaurace' }, { es: 'la estación', cz: 'nádraží' },
      { es: 'el hospital', cz: 'nemocnice' }, { es: 'la escuela', cz: 'škola' }, { es: 'el parque', cz: 'park' },
      { es: 'cerca', cz: 'blízko' }, { es: 'lejos', cz: 'daleko' },
      { es: 'a la derecha', cz: 'vpravo' }, { es: 'a la izquierda', cz: 'vlevo' }, { es: 'todo recto', cz: 'rovně' },
      { es: '¿Dónde está el banco?', cz: 'Kde je banka?' },
      { es: 'Hay un parque.', cz: 'Je tam park.' },
      { es: '¿Hay una farmacia cerca?', cz: 'Je tu poblíž lékárna?' },
      { es: 'Estoy cansado.', cz: 'Jsem unavený.', esAlt: ['estoy cansada'] },
      { es: 'Soy estudiante.', cz: 'Jsem student.' }
    ],
    fill: [
      { s: '¿Dónde ___ la estación?', a: 'está', opts: ['es', 'está', 'hay'], cz: 'Kde je nádraží?' },
      { s: '___ un museo en la plaza.', a: 'hay', opts: ['hay', 'está', 'es'], cz: 'Na náměstí je muzeum.' },
      { s: 'Madrid ___ en España.', a: 'está', opts: ['es', 'está', 'hay'], cz: 'Madrid je ve Španělsku.' },
      { s: 'Yo ___ estudiante.', a: 'soy', opts: ['soy', 'estoy', 'hay'], cz: 'Jsem student.' },
      { s: 'Hoy ___ cansado.', a: 'estoy', opts: ['soy', 'estoy', 'es'], cz: 'Dneska jsem unavený.' }
    ]
  },
  {
    id: 'l6', title: 'Mi día', cz: 'Můj den, hodiny, slovesa na -ar',
    grammar: [
      { title: 'Slovesa na -AR', body: `
        <p>Vzor <b>trabajar</b> (pracovat). Odtrhneš -ar a přidáš koncovku:</p>
        <table class="conj">
          <tr><td>yo</td><td>trabaj<b>o</b></td><td>nosotros</td><td>trabaj<b>amos</b></td></tr>
          <tr><td>tú</td><td>trabaj<b>as</b></td><td>vosotros</td><td>trabaj<b>áis</b></td></tr>
          <tr><td>él/ella</td><td>trabaj<b>a</b></td><td>ellos</td><td>trabaj<b>an</b></td></tr>
        </table>
        <p>Stejně: <i>estudiar, desayunar, cenar, escuchar…</i></p>` },
      { title: 'Kolik je hodin?', body: `
        <p class="ex">¿Qué hora es? · Es la una. · Son las dos. · Son las ocho y media.</p>
        <p>Jedna hodina = <b>es la</b>, ostatní = <b>son las</b>. „V“ kolik = <b>a las</b>: <i>a las siete</i>.</p>
        <p>Zvratná slovesa: <b>me</b> levanto, <b>te</b> levantas, <b>se</b> levanta (vstávám, vstáváš, vstává).</p>` }
    ],
    items: [
      { es: 'trabajar', cz: 'pracovat' }, { es: 'estudiar', cz: 'studovat / učit se' },
      { es: 'desayunar', cz: 'snídat' }, { es: 'comer', cz: 'jíst / obědvat' }, { es: 'dormir', cz: 'spát' },
      { es: 'la mañana', cz: 'ráno / dopoledne' }, { es: 'la tarde', cz: 'odpoledne' }, { es: 'la noche', cz: 'noc / večer' },
      { es: 'siempre', cz: 'vždycky' }, { es: 'a veces', cz: 'někdy' }, { es: 'nunca', cz: 'nikdy' },
      { es: 'hoy', cz: 'dnes' }, { es: 'mañana', cz: 'zítra' },
      { es: '¿Qué hora es?', cz: 'Kolik je hodin?' },
      { es: 'Son las dos.', cz: 'Jsou dvě hodiny.' },
      { es: 'Son las ocho y media.', cz: 'Je půl deváté.' },
      { es: 'Me levanto a las siete.', cz: 'Vstávám v sedm.' },
      { es: 'Trabajo por la tarde.', cz: 'Pracuju odpoledne.' },
      { es: 'Estudio español.', cz: 'Učím se španělsky.' }
    ],
    fill: [
      { s: 'Yo ___ en un restaurante.', a: 'trabajo', opts: ['trabajo', 'trabajas', 'trabaja'], cz: 'Pracuju v restauraci.' },
      { s: 'Me ___ a las seis.', a: 'levanto', opts: ['levanto', 'levantas', 'levanta'], cz: 'Vstávám v šest.' },
      { s: '___ las tres.', a: 'son', opts: ['es', 'son', 'está'], cz: 'Jsou tři hodiny.' },
      { s: 'Ella ___ español.', a: 'estudia', opts: ['estudio', 'estudias', 'estudia'], cz: 'Ona se učí španělsky.' },
      { s: 'Nosotros ___ a las nueve.', a: 'cenamos', opts: ['ceno', 'cenamos', 'cenan'], cz: 'Večeříme v devět.' }
    ]
  },
  {
    id: 'l7', title: 'La casa', cz: 'Bydlení a kde co je',
    grammar: [
      { title: 'Slovesa na -IR: VIVIR = bydlet', body: `
        <table class="conj">
          <tr><td>yo</td><td>viv<b>o</b></td><td>nosotros</td><td>viv<b>imos</b></td></tr>
          <tr><td>tú</td><td>viv<b>es</b></td><td>vosotros</td><td>viv<b>ís</b></td></tr>
          <tr><td>él/ella</td><td>viv<b>e</b></td><td>ellos</td><td>viv<b>en</b></td></tr>
        </table>` },
      { title: 'Kde to je?', body: `
        <p><b>en</b> v / na · <b>encima de</b> na (nahoře) · <b>debajo de</b> pod · <b>al lado de</b> vedle</p>
        <p class="ex">El móvil está encima de la mesa.</p>
        <p><b>de + el = del</b>: <i>al lado del sofá</i>.</p>` }
    ],
    items: [
      { es: 'la casa', cz: 'dům' }, { es: 'el piso', cz: 'byt' }, { es: 'la habitación', cz: 'pokoj' },
      { es: 'la cocina', cz: 'kuchyně' }, { es: 'el baño', cz: 'koupelna' }, { es: 'el salón', cz: 'obývák' },
      { es: 'la mesa', cz: 'stůl' }, { es: 'la silla', cz: 'židle' }, { es: 'la cama', cz: 'postel' },
      { es: 'la puerta', cz: 'dveře' }, { es: 'la ventana', cz: 'okno' }, { es: 'el sofá', cz: 'gauč' },
      { es: 'grande', cz: 'velký' }, { es: 'pequeño', cz: 'malý' },
      { es: 'encima de', cz: 'na (nahoře na)' }, { es: 'debajo de', cz: 'pod' }, { es: 'al lado de', cz: 'vedle' },
      { es: 'Vivo en un piso.', cz: 'Bydlím v bytě.' },
      { es: 'Mi casa es pequeña.', cz: 'Můj dům je malý.' },
      { es: '¿Dónde vives?', cz: 'Kde bydlíš?' }
    ],
    fill: [
      { s: 'Yo ___ en Chlumec.', a: 'vivo', opts: ['vivo', 'vives', 'vive'], cz: 'Bydlím v Chlumci.' },
      { s: '¿Dónde ___ tú?', a: 'vives', opts: ['vivo', 'vives', 'vive'], cz: 'Kde bydlíš ty?' },
      { s: 'El gato está ___ la cama.', a: 'debajo de', opts: ['debajo de', 'encima de', 'al lado de'], cz: 'Kočka je pod postelí.' },
      { s: 'Mi habitación es ___.', a: 'pequeña', opts: ['pequeño', 'pequeña', 'pequeños'], cz: 'Můj pokoj je malý.' },
      { s: 'La silla está al lado ___ la mesa.', a: 'de', opts: ['de', 'en', 'a'], cz: 'Židle je vedle stolu.' }
    ]
  },
  {
    id: 'l8', title: 'El tiempo libre', cz: 'Volný čas a dny v týdnu',
    grammar: [
      { title: 'Me gusta + sloveso', body: `
        <p class="ex">Me gusta leer. · No me gusta correr. · ¿Te gusta el fútbol?</p>
        <p>Se slovesem je to vždy <b>gusta</b>: <i>me gusta bailar y cantar</i>.</p>` },
      { title: 'Dny a JUGAR', body: `
        <p><b>el lunes</b> = v pondělí (jednou) · <b>los lunes</b> = v pondělky (pokaždé)</p>
        <p><b>jugar</b> (hrát): j<b>ue</b>go, j<b>ue</b>gas, j<b>ue</b>ga, jugamos. Hrát <i>co</i> = <b>jugar al</b> fútbol.</p>` }
    ],
    items: [
      { es: 'el lunes', cz: 'pondělí' }, { es: 'el martes', cz: 'úterý' }, { es: 'el miércoles', cz: 'středa' },
      { es: 'el jueves', cz: 'čtvrtek' }, { es: 'el viernes', cz: 'pátek' }, { es: 'el sábado', cz: 'sobota' },
      { es: 'el domingo', cz: 'neděle' }, { es: 'el fin de semana', cz: 'víkend' },
      { es: 'leer', cz: 'číst' }, { es: 'escuchar música', cz: 'poslouchat hudbu' },
      { es: 'ver una película', cz: 'dívat se na film' }, { es: 'jugar al fútbol', cz: 'hrát fotbal' },
      { es: 'salir con amigos', cz: 'chodit ven s kamarády' }, { es: 'el deporte', cz: 'sport' },
      { es: 'Me gusta leer.', cz: 'Rád čtu.' },
      { es: 'No me gusta correr.', cz: 'Nerad běhám.' },
      { es: '¿Qué haces el fin de semana?', cz: 'Co děláš o víkendu?' },
      { es: 'Juego al fútbol los sábados.', cz: 'V sobotu hraju fotbal.' }
    ],
    fill: [
      { s: 'Me gusta ___ música.', a: 'escuchar', opts: ['escuchar', 'escucho', 'escuchas'], cz: 'Rád poslouchám hudbu.' },
      { s: 'Yo ___ al tenis.', a: 'juego', opts: ['juego', 'jugo', 'juega'], cz: 'Hraju tenis.' },
      { s: '¿Te ___ leer?', a: 'gusta', opts: ['gusta', 'gustan', 'gusto'], cz: 'Čteš rád?' },
      { s: 'Los ___ juego al fútbol.', a: 'sábados', opts: ['sábado', 'sábados', 'sábada'], cz: 'O sobotách hraju fotbal.' },
      { s: 'No me ___ correr.', a: 'gusta', opts: ['gusta', 'gustan', 'gusto'], cz: 'Nerad běhám.' }
    ]
  },
  {
    id: 'l9', title: 'De compras', cz: 'Nakupování a oblečení',
    grammar: [
      { title: 'Tento, tato: ESTE / ESTA', body: `
        <table class="conj">
          <tr><td><b>este</b> vestido</td><td>tyto šaty (m.)</td></tr>
          <tr><td><b>esta</b> camiseta</td><td>toto tričko (ž.)</td></tr>
          <tr><td><b>estos</b> zapatos</td><td>tyto boty (m. mn.)</td></tr>
          <tr><td><b>estas</b> chaquetas</td><td>tyto bundy (ž. mn.)</td></tr>
        </table>` },
      { title: 'Kolik to stojí?', body: `
        <p class="ex">¿Cuánto cuesta la chaqueta? · ¿Cuánto cuestan los zapatos?</p>
        <p>Jedna věc = <b>cuesta</b>, víc věcí = <b>cuestan</b>.</p>
        <p>V obchodě se prodavači vyká: <b>¿Tiene…?</b> = Máte…?</p>` }
    ],
    items: [
      { es: 'la tienda', cz: 'obchod' }, { es: 'la ropa', cz: 'oblečení' }, { es: 'la camiseta', cz: 'tričko' },
      { es: 'los pantalones', cz: 'kalhoty' }, { es: 'los zapatos', cz: 'boty' }, { es: 'la chaqueta', cz: 'bunda' },
      { es: 'el vestido', cz: 'šaty' }, { es: 'caro', cz: 'drahý' }, { es: 'barato', cz: 'levný' },
      { es: 'el dinero', cz: 'peníze' }, { es: 'la talla', cz: 'velikost (oblečení)' },
      { es: '¿Cuánto cuesta?', cz: 'Kolik to stojí?' },
      { es: 'Cuesta diez euros.', cz: 'Stojí to deset eur.', esAlt: ['cuesta 10 euros'] },
      { es: 'Quiero esta camiseta.', cz: 'Chci tohle tričko.' },
      { es: '¿Tiene otra talla?', cz: 'Máte jinou velikost?' },
      { es: 'Es muy caro.', cz: 'Je to moc drahé.' },
      { es: '¿Puedo pagar con tarjeta?', cz: 'Můžu platit kartou?' }
    ],
    fill: [
      { s: '¿Cuánto ___ los zapatos?', a: 'cuestan', opts: ['cuesta', 'cuestan', 'cuesto'], cz: 'Kolik stojí ty boty?' },
      { s: '¿Cuánto ___ la chaqueta?', a: 'cuesta', opts: ['cuesta', 'cuestan', 'cuesto'], cz: 'Kolik stojí ta bunda?' },
      { s: 'Quiero ___ camiseta.', a: 'esta', opts: ['este', 'esta', 'estos'], cz: 'Chci tohle tričko.' },
      { s: 'Me gustan ___ pantalones.', a: 'estos', opts: ['este', 'esta', 'estos'], cz: 'Líbí se mi tyhle kalhoty.' },
      { s: 'Es muy ___.', a: 'barato', opts: ['caro', 'barato', 'grande'], cz: 'Je to moc levné.' }
    ]
  },
  {
    id: 'l10', title: 'El tiempo', cz: 'Počasí, roční období, měsíce',
    grammar: [
      { title: 'Počasí s HACE', body: `
        <p class="ex">Hace calor. · Hace frío. · Hace sol. · Hace buen tiempo.</p>
        <p>Déšť a sníh mají vlastní sloveso: <b>llueve</b> (prší), <b>nieva</b> (sněží).</p>` },
      { title: 'Měsíce', body: `
        <p class="ex">enero · febrero · marzo · abril · mayo · junio · julio · agosto · septiembre · octubre · noviembre · diciembre</p>
        <p>Píšou se <b>malým</b> písmenem. V květnu = <b>en mayo</b>.</p>` }
    ],
    items: [
      { es: 'Hace calor.', cz: 'Je horko.' }, { es: 'Hace frío.', cz: 'Je zima (chladno).' },
      { es: 'Hace sol.', cz: 'Svítí slunce.' }, { es: 'Llueve.', cz: 'Prší.' }, { es: 'Nieva.', cz: 'Sněží.' },
      { es: 'Hace buen tiempo.', cz: 'Je hezky.' }, { es: 'Hace mal tiempo.', cz: 'Je ošklivo.' },
      { es: '¿Qué tiempo hace?', cz: 'Jaké je počasí?' },
      { es: 'la primavera', cz: 'jaro' }, { es: 'el verano', cz: 'léto' }, { es: 'el otoño', cz: 'podzim' },
      { es: 'el invierno', cz: 'zima (období)' },
      { es: 'enero', cz: 'leden' }, { es: 'marzo', cz: 'březen' }, { es: 'mayo', cz: 'květen' },
      { es: 'julio', cz: 'červenec' }, { es: 'septiembre', cz: 'září' }, { es: 'diciembre', cz: 'prosinec' },
      { es: 'Mi cumpleaños es en mayo.', cz: 'Narozeniny mám v květnu.' }
    ],
    fill: [
      { s: 'Hoy ___ frío.', a: 'hace', opts: ['hace', 'es', 'está'], cz: 'Dnes je zima.' },
      { s: 'En invierno ___.', a: 'nieva', opts: ['nieva', 'hace sol', 'hace calor'], cz: 'V zimě sněží.' },
      { s: 'En verano hace ___.', a: 'calor', opts: ['calor', 'frío', 'nieva'], cz: 'V létě je horko.' },
      { s: 'Mi cumpleaños es ___ abril.', a: 'en', opts: ['en', 'de', 'a'], cz: 'Narozeniny mám v dubnu.' },
      { s: 'Hoy ___ buen tiempo.', a: 'hace', opts: ['hace', 'es', 'hay'], cz: 'Dnes je hezky.' }
    ]
  },
  {
    id: 'l11', title: 'El cuerpo', cz: 'Tělo a u doktora',
    grammar: [
      { title: 'ME DUELE = bolí mě', body: `
        <p>Funguje jako <i>me gusta</i>: jedna věc <b>duele</b>, víc věcí <b>duelen</b>.</p>
        <p class="ex">Me duele la cabeza. · Me duelen los pies.</p>
        <p>Část těla má ve španělštině člen, ne „můj“: <i>me duele <b>la</b> cabeza</i>.</p>` },
      { title: 'Jak se cítíš: ESTAR', body: `
        <p class="ex">Estoy enfermo. · Estoy cansada. · ¿Qué te pasa?</p>
        <p>Stav = vždycky <b>estar</b>.</p>` }
    ],
    items: [
      { es: 'la cabeza', cz: 'hlava' }, { es: 'la mano', cz: 'ruka (dlaň)' }, { es: 'el brazo', cz: 'paže' },
      { es: 'la pierna', cz: 'noha' }, { es: 'el pie', cz: 'chodidlo' }, { es: 'el estómago', cz: 'žaludek / břicho' },
      { es: 'los ojos', cz: 'oči' }, { es: 'la boca', cz: 'pusa' }, { es: 'el diente', cz: 'zub' },
      { es: 'la espalda', cz: 'záda' }, { es: 'el médico', cz: 'doktor' },
      { es: 'Me duele la cabeza.', cz: 'Bolí mě hlava.' },
      { es: 'Me duelen los pies.', cz: 'Bolí mě nohy.' },
      { es: 'Estoy enfermo.', cz: 'Jsem nemocný.', esAlt: ['estoy enferma'] },
      { es: 'Necesito un médico.', cz: 'Potřebuju doktora.' },
      { es: '¿Qué te pasa?', cz: 'Co ti je?' }
    ],
    fill: [
      { s: 'Me ___ la espalda.', a: 'duele', opts: ['duele', 'duelen', 'dolor'], cz: 'Bolí mě záda.' },
      { s: 'Me ___ los ojos.', a: 'duelen', opts: ['duele', 'duelen', 'dolor'], cz: 'Bolí mě oči.' },
      { s: '___ enfermo.', a: 'estoy', opts: ['soy', 'estoy', 'tengo'], cz: 'Jsem nemocný.' },
      { s: '¿Qué te ___?', a: 'pasa', opts: ['pasa', 'duele', 'gusta'], cz: 'Co ti je?' },
      { s: 'Necesito un ___.', a: 'médico', opts: ['médico', 'banco', 'museo'], cz: 'Potřebuju doktora.' }
    ]
  },
  {
    id: 'l12', title: 'Viajar', cz: 'Cestování a budoucnost s IR A',
    grammar: [
      { title: 'IR = jít / jet', body: `
        <table class="conj">
          <tr><td>yo</td><td><b>voy</b></td><td>nosotros</td><td><b>vamos</b></td></tr>
          <tr><td>tú</td><td><b>vas</b></td><td>vosotros</td><td><b>vais</b></td></tr>
          <tr><td>él/ella</td><td><b>va</b></td><td>ellos</td><td><b>van</b></td></tr>
        </table>
        <p>Kam = <b>a</b>: <i>Voy a Madrid.</i> · <b>a + el = al</b>: <i>Voy al aeropuerto.</i></p>` },
      { title: 'Budoucnost: IR A + sloveso', body: `
        <p>Nejjednodušší budoucí čas: <b>voy a</b> + infinitiv.</p>
        <p class="ex">Voy a comer. = Budu jíst. · Vamos a viajar. = Budeme cestovat.</p>
        <p>Dopravní prostředek = <b>en</b>: <i>en tren, en avión</i>. Pěšky = <b>a pie</b>.</p>` }
    ],
    items: [
      { es: 'el tren', cz: 'vlak' }, { es: 'el autobús', cz: 'autobus' }, { es: 'el avión', cz: 'letadlo' },
      { es: 'el coche', cz: 'auto' }, { es: 'el billete', cz: 'jízdenka' }, { es: 'el aeropuerto', cz: 'letiště' },
      { es: 'la maleta', cz: 'kufr' }, { es: 'el pasaporte', cz: 'pas' }, { es: 'la playa', cz: 'pláž' },
      { es: 'las vacaciones', cz: 'prázdniny / dovolená' },
      { es: 'Voy a Madrid.', cz: 'Jedu do Madridu.' },
      { es: 'Vamos a la playa.', cz: 'Jdeme na pláž.' },
      { es: 'Voy a viajar en tren.', cz: 'Pojedu vlakem.' },
      { es: 'Un billete para Barcelona, por favor.', cz: 'Jednu jízdenku do Barcelony, prosím.' },
      { es: '¿A qué hora sale el tren?', cz: 'V kolik jede vlak?' },
      { es: 'Tengo una reserva.', cz: 'Mám rezervaci.' }
    ],
    fill: [
      { s: 'Yo ___ a Madrid.', a: 'voy', opts: ['voy', 'vas', 'va'], cz: 'Jedu do Madridu.' },
      { s: 'Mañana voy ___ comer paella.', a: 'a', opts: ['a', 'de', 'en'], cz: 'Zítra budu jíst paellu.' },
      { s: 'Viajo ___ avión.', a: 'en', opts: ['en', 'a', 'de'], cz: 'Cestuju letadlem.' },
      { s: 'Nosotros ___ a la playa.', a: 'vamos', opts: ['voy', 'vamos', 'van'], cz: 'Jdeme na pláž.' },
      { s: '¿Tú ___ a Barcelona?', a: 'vas', opts: ['voy', 'vas', 'va'], cz: 'Jedeš do Barcelony?' }
    ]
  }
];

// Přidělí ID a rozdělí lekce na části po ~7 položkách.
(function prepare() {
  LESSONS.forEach((L) => {
    L.items.forEach((it, i) => { it.id = L.id + '-' + i; it.lesson = L.id; });
    L.fill.forEach((f, i) => { f.id = L.id + '-f' + i; });
    const n = L.items.length;
    const parts = Math.max(1, Math.ceil(n / 7));
    const size = Math.ceil(n / parts);
    L.parts = [];
    for (let p = 0; p < parts; p++) L.parts.push(L.items.slice(p * size, (p + 1) * size));
  });
})();
