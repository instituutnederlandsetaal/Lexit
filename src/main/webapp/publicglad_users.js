const user_table=`irena	alb	Irena Kapo	irena_8625
alexandra	bul	Alexandra Bagasheva	Sofia - Bulgaria	alexandra_7795
david	can	David Li	Hong Kong	david_5697
miguel	cat	Miguel Ángel Campos-Pardillos	Alicante - Spain	miguel_5500
ales	cze	Aleš Klégr	Prague - Czech Republic	ales_1453
ivana	cze	Ivana Bozdechová	Prague - Czech Republic	ivana_3243
henrik	dan	Henrik Gottlieb	Copenhagen - Denmark	henrik_9076
nicoline	alb,bul,can,cat,cze,dan,dut,fin,fre,glg,ger,ita,jpn,chi,nob,pol,rom,rus,spa	Nicoline van der Sijs	Nijmegen - Netherlands	nicoline_7548
elizabeth	fin	Elizabeth Peterson	Helsinki - Finland	elizabeth_7315
peppi	fin	Peppi Santaniemi	Helsinki - Finland	peppi_1609
ramon	fre	Ramón Martí Solano	Limoges - France	ramon_5556
john_h	fre	John Humbley	Paris - France	john_h_4988
vincent	fre	Vincent Renner	Lyon - France	vincent_3612
valerie	fre	Valérie Saugera	Connecticut - USA	valerie_2627
isabel	glg	Isabel Balteiro	Alicante - Spain	isabel_8944
ulrich	ger	Ulrich Busse	Halle - Germany	ulrich_1619
sabine	ger	Sabine Fiedler	Leipzig - Germany	sabine_2606
jaime	ger	Jaime Hunt	Newcastle - Australia	jaime_4947
rania	gre	Rania Papadopoulou	Patras - Greece	rania_7017
george	gre	George J. Xydopoulos	Patras - Greece	george_4347
virginia	ita	Virginia Pulcini	Torino - Italy	virginia_7628
cristiano	ita	Cristiano Furiassi	Torino - Italy	cristiano_1229
sabrina	ita	Sabrina Bonanzinga	Torino - Italy	sabrina_5752
valeria	ita	Valeria Fiasco	Rome - Italy	valeria_3751
keisuke	jpn	Keisuke Imamura	Tokyo - Japan	keisuke_6600
eyvonne	chi	Eyvonne Wang Yun	Taiyuan - China	eyvonne_5966
jenny	chi	Jenny Ren Jinni	Taiyuan - China	jenny_7545
sharon	chi	Sharon Jia Yunjie	Taiyuan - China	sharon_4549
gisle	nob	Gisle Andersen	Bergen - Norway	gisle_8132
anne-line	nob	Anne-Line Graedler	Hamar - Norway	anne-line_5917
elzbieta	pol	Elżbieta Mańczak-Wohlfeld	Cracow - Poland	elzbieta_9467
alicja	pol	Alicja Witalisz	Cracow - Poland	alicja_5600
anabella-gloria	rom	Anabella-Gloria Niculescu-Gorpin	Bucharest - Romania	anabella-gloria_4238
john_d	rus	John Dunn	Glasgow - UK	john_d_7713
carmen	spa	Carmen Isabel Luján García	Las Palmas - Spain	carmen_3203
elena	spa	Elena Álvarez Mellado	Madrid - Spain	elena_9979
eugenia	spa	Eugenia E. Núñez Nogueroles	Extremadura - Spain	eugenia_8959
jose_r	spa	José Luis Rojas Díaz	Bergen - Norway	jose_r_1467
josé_s	spa	José Antonio Sánchez Fajardo	Alicante - Spain	josé_s_8369
maria_gc	spa	María Isabel González Cruz	Las Palmas - Spain	maria_gc_2021
maria_ggm	spa	María Goretti García Morales	Las Palmas - Spain	maria_ggm_4130
maria_rm	spa	María Jesús Rodríguez Medina	Las Palmas - Spain	maria_rm_4661
maria_a	spa	María Vázquez Amador	Jerez de la Frontera - Spain	maria_a_8689
paloma	spa	Paloma López Zurita	Jerez de la Frontera - Spain	paloma_3296
jesse	dut,jpn,rus,pol	Jesse de Does
katrien	spa`

const u2l = {};

user_table.split(/\n/).forEach(l => {
  const a = l.split(/\t/)
  const user_name = a[0]
  const lang = a[1]
  
  // const n = Math.floor(10000 * (Math.random() * 0.9)) + 1000
  //const password = user_name + "_" + n
  u2l[user_name] = lang;
  
  //console.log(l + "\t" + password);
})
