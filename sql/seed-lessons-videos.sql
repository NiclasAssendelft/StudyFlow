-- StudyFlow: Valintakoe F (Kauppatiede) - Video Lessons Database
-- Educational resources for Finnish university entrance exam preparation
-- Date: 2026-03-10

-- MICROECONOMICS SECTION

-- 1.1 Kysyntä ja tarjonta (Supply and Demand)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.1', 'Kysynnän ja tarjonnan perusteet', 'Supply and Demand Basics', 1, 'https://www.youtube.com/embed/PEMkfgrifDw', 'Law of Demand - Khan Academy', 10, 'Kysynnän määritelmä ja kysynnän laki. Kuluttajat hankkivat enemmän tuotetta alhaisemmilla hinnoilla.'),
('1.1', 'Kysynnän ja tarjonnan muutokset', 'Supply and Demand Shifts', 2, 'https://www.youtube.com/embed/7P3Kl7mT29A', 'Law of Supply - Khan Academy', 10, 'Tarjonnan määritelmä ja tarjonnan laki. Tuottajat tarjoavat enemmän tuotetta korkeammilla hinnoilla.');

-- 1.2 Markkinatasapaino (Market Equilibrium)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.2', 'Markkinatasapainon määritelmä', 'Market Equilibrium Basics', 1, 'https://www.youtube.com/embed/F5zMLvdCNVI', 'Market Equilibrium - Khan Academy', 12, 'Tasapaino-hinta ja tasapaino-määrä. Kysyntä ja tarjonta kohtaavat markkinoilla.'),
('1.2', 'Hallituksen väliintulo ja hintasääntely', 'Government Intervention', 2, 'https://www.youtube.com/embed/d-GkJVsctIA', 'Price Ceilings and Floors - Khan Academy', 15, 'Maksimihinnat, minimihinnat ja niiden markkinavaikutukset.');

-- 1.3 Joustavuus (Elasticity)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.3', 'Kysynnän hintajousto', 'Price Elasticity of Demand', 1, 'https://www.youtube.com/embed/Jd3VhVfL5UQ', 'Introduction to Price Elasticity of Demand - Khan Academy', 11, 'Kysynnän joustavuus mittaa kuluttajien reaktiota hintamuutoksiin.'),
('1.3', 'Ristiinjoustomarkkina ja tulojousto', 'Cross and Income Elasticity', 2, 'https://www.youtube.com/embed/VBfXzSy1VXI', 'Cross Elasticity of Demand - Khan Academy', 13, 'Ristiinjousto ja tulojousto kuvaavat eri tekijöiden vaikutusta kysyntään.');

-- 1.4 Kuluttajan valinta (Consumer Choice)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.4', 'Hyödyketeoria ja hyödyn maksimointi', 'Utility Theory and Maximization', 1, 'https://www.youtube.com/embed/Mv_VDkKJK8w', 'Introduction to Utility - Khan Academy', 12, 'Hyöty eli tyytyväisyys ja marginaalinen hyöty. Kuluttajat maksimoidat hyödyn.'),
('1.4', 'Budjettiviiva ja valintamahdollisuudet', 'Budget Constraints', 2, 'https://www.youtube.com/embed/Ly3uGdz1V8M', 'Budget Constraints and Consumer Choice - Khan Academy', 14, 'Budjetin rajoitukset määrittävät kuluttajien mahdollisuudet ostaa hyödykkeitä.');

-- 1.5 Tuotantokustannukset (Production Costs)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.5', 'Lyhyen aikavälin kustannukset', 'Short-Run Production Costs', 1, 'https://www.youtube.com/embed/lkXrNTZfP4w', 'Fixed Costs and Variable Costs - Khan Academy', 13, 'Kiinteät ja muuttuvat kustannukset lyhyellä aikavälillä. Marginaalikustannus ja keskimääräiset kustannukset.'),
('1.5', 'Pitkän aikavälin kustannukset', 'Long-Run Production Costs', 2, 'https://www.youtube.com/embed/GBlzMB5J0T8', 'Long-Run Average Total Cost Curve - Khan Academy', 12, 'Mittakaavaedut ja mittakaavahäviöt. Pitkän aikavälin kustannuskäyrä.');

-- 1.6 Markkinamuodot (Market Structures)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.6', 'Täydellinen kilpailu', 'Perfect Competition', 1, 'https://www.youtube.com/embed/gWi9EGzY9vU', 'Perfect Competition and Market Power - Khan Academy', 14, 'Täydellinen kilpailu: paljon yrityksiä, identtiset tuotteet, vapaa pääsy markkinoille.'),
('1.6', 'Monopoli ja oligopoli', 'Monopoly and Oligopoly', 2, 'https://www.youtube.com/embed/4lDCKtJoNOE', 'Monopolies and Market Power - Khan Academy', 15, 'Monopoli: yksi yritys, erilaiset tuotteet, esteet markkinoille pääsylle.');

-- 1.7 Markkinahäiriöt (Market Failures)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('1.7', 'Ulkoisvaikutukset ja julkiset hyödykkeet', 'Externalities and Public Goods', 1, 'https://www.youtube.com/embed/n9F4g8zGp5w', 'Positive Externalities - Khan Academy', 12, 'Ulkoisvaikutukset: positiiviset ja negatiiviset. Markkinoiden epäonnistuminen.'),
('1.7', 'Markkinahäiriöiden ratkaisut', 'Market Failure Solutions', 2, 'https://www.youtube.com/embed/u8qmXXp-Rqo', 'Public Goods - Khan Academy', 13, 'Julkiset hyödykkeet ja vapaamatkustaja-ongelma. Hallituksen rooli markkinaratkaisuissa.');

-- MACROECONOMICS SECTION

-- 2.1 BKT (GDP)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.1', 'BKT:n laskeminen', 'GDP Calculation', 1, 'https://www.youtube.com/embed/O0h-qPMSTOU', 'Components of GDP - Khan Academy', 14, 'Bruttokansantuote mittaa tuotantoa. Menomenetelmä, tulomenetelmä ja tuotantomenetelmä.'),
('2.1', 'BKT:n osatekijät ja koostumus', 'GDP Components', 2, 'https://www.youtube.com/embed/8q_5B9qcvp0', 'Real GDP and Nominal GDP - Khan Academy', 12, 'Nimellinen ja reaalinen BKT. Kulutus, investoinnit, julkinen menot ja nettovienti.');

-- 2.2 Talouskasvu (Economic Growth)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.2', 'Kasvun tekijät ja lähteet', 'Economic Growth Factors', 1, 'https://www.youtube.com/embed/TcKoAFM1PG4', 'Causes of Economic Growth - Khan Academy', 13, 'Pääoman kertymy, työvoiman kasvu ja teknologinen kehitys ajavat talouskasvua.'),
('2.2', 'Kasvumallit ja tuottavuus', 'Growth Models and Productivity', 2, 'https://www.youtube.com/embed/BblC9SdN7bc', 'Productivity and Economic Growth - Khan Academy', 14, 'Solow-Swan malli ja endogeeninen kasvumalli. Tuottavuuden merkitys.');

-- 2.3 Työttömyys (Unemployment)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.3', 'Työttömyyden lajit ja mittaaminen', 'Types of Unemployment', 1, 'https://www.youtube.com/embed/t6qQhJNz0dY', 'Unemployment - Khan Academy', 13, 'Työttömyysaste, vapaaehtoisesti ja pakosti työttömät. Strukturaalinen ja syklinen työttömyys.'),
('2.3', 'Phillips-käyrä ja inflaatio-työttömyys-tasapainosuhde', 'Phillips Curve', 2, 'https://www.youtube.com/embed/yVQc3nDTLfk', 'The Phillips Curve - Khan Academy', 14, 'Phillips-käyrä näyttää työttömyyden ja inflaation välistä inversiivistä suhdetta.');

-- 2.4 Inflaatio (Inflation)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.4', 'Inflaation syyt ja mittaaminen', 'Causes and Measurement of Inflation', 1, 'https://www.youtube.com/embed/SdQuRKIuFwA', 'Inflation - Khan Academy', 12, 'Rahan määrän kasvu aiheuttaa inflaatiota. Hintataso ja inflaatioaste.'),
('2.4', 'Inflaation vaikutukset talouteen', 'Effects of Inflation', 2, 'https://www.youtube.com/embed/qhF9KqC3yFE', 'Deflation and Disinflation - Khan Academy', 13, 'Inflaation vaikutus säästöihin, sijoituksiin ja ostovoimaan. Deflation ja stagflaatio.');

-- 2.5 Rahapolitiikka (Monetary Policy)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.5', 'Keskuspankki ja rahan tarjonta', 'Central Banking and Money Supply', 1, 'https://www.youtube.com/embed/JphUmzpSBqU', 'The Federal Reserve and Open Market Operations - Khan Academy', 14, 'Keskuspankki hallitsee rahan tarjontaa. Avomarkkinaoperaatiot ja pankkisäännöstely.'),
('2.5', 'Rahapolitiikan välineet ja ECB:n toimet', 'Monetary Policy Tools and ECB', 2, 'https://www.youtube.com/embed/quwcQJ6CL8Q', 'Monetary Policy - Khan Academy', 15, 'Diskonttauskorko, varantosuhde ja avoimet markkinat. ECB:n rahapolitiikka.');

-- 2.6 Finanssipolitiikka (Fiscal Policy)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.6', 'Hallituksen menot ja verot', 'Government Spending and Taxes', 1, 'https://www.youtube.com/embed/PFOWeUVDuv4', 'Fiscal Policy and Crowding Out - Khan Academy', 13, 'Hallituksen menot ja verot vaikuttavat kokonaiskysynnään ja BKT:hen.'),
('2.6', 'Kerrannaisvaikutus ja finanssipolitiikka', 'Multiplier Effects', 2, 'https://www.youtube.com/embed/s9J1NxKUYKg', 'The Keynesian Cross and The Multiplier - Khan Academy', 14, 'Kerrannaisvaikutus: hallituksen menot lisäävät BKT:tä moninkertaisesti.');

-- 2.7 Kansainvälinen kauppa (International Trade)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('2.7', 'Vertailuhinta ja kaupan hyödyt', 'Comparative Advantage and Gains from Trade', 1, 'https://www.youtube.com/embed/gzNzfJ4f0KE', 'Comparative Advantage and the Gains From Trade - Khan Academy', 14, 'Vertailuhinta näyttää, minkä tuotteen kussakin maassa kannattaa tuottaa.'),
('2.7', 'Kauppapolitiikka ja tullit', 'Trade Policy and Tariffs', 2, 'https://www.youtube.com/embed/BvLVmHlRVe0', 'Tariffs and Quotas - Khan Academy', 13, 'Tullit ja kiintiöt suojaavat kotimaan tuotantoa, mutta vähentävät kokonaiskauppaa.');

-- STATISTICS SECTION

-- 3.1 Kuvaileva tilastotiede (Descriptive Statistics)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.1', 'Keskitendenssin mittarit', 'Central Tendency Measures', 1, 'https://www.youtube.com/embed/h8EYEJ32Z3M', 'Mean, Median, and Mode - Khan Academy', 12, 'Keskiarvo, mediaani ja moodi kuvaavat aineiston keskipistettä.'),
('3.1', 'Aineiston esittäminen ja visualisointi', 'Data Visualization', 2, 'https://www.youtube.com/embed/q4ot3yxg4BE', 'Dot Plots and Frequency Tables - Khan Academy', 13, 'Histogrammit, pylväsdiagrammit ja muut kuvaajat esittävät aineiston.');

-- 3.2 Hajonta (Dispersion)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.2', 'Varianssi ja keskihajonta', 'Variance and Standard Deviation', 1, 'https://www.youtube.com/embed/E4HAYd0QnRc', 'Measures of Spread: Range, Variance, and Standard Deviation - Khan Academy', 14, 'Varianssi ja keskihajonta mittaavat arvojen hajontaa keskiarvon ympärillä.'),
('3.2', 'Kvartilit ja kvantiilit', 'Quartiles and Quantiles', 2, 'https://www.youtube.com/embed/lKX2ZZP-pPQ', 'Interquartile Range - Khan Academy', 12, 'Kvartilit jakavat aineiston neljään yhtä suureen osaan.');

-- 3.3 Todennäköisyyslaskenta (Probability)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.3', 'Todennäköisyyden perusteet', 'Basic Probability', 1, 'https://www.youtube.com/embed/95UsIqvzEH8', 'Probability Basics - Khan Academy', 13, 'Todennäköisyys mittaa tapahtuman mahdollisuutta. Klassinen todennäköisyys.'),
('3.3', 'Ehdollinen todennäköisyys', 'Conditional Probability', 2, 'https://www.youtube.com/embed/dK_Jgwfvov4', 'Conditional Probability - Khan Academy', 14, 'Ehdollinen todennäköisyys P(A|B) on todennäköisyys A:lle kun B on sattunut.');

-- 3.4 Normaalijakauma (Normal Distribution)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.4', 'Normaalijakauman ominaisuudet', 'Normal Distribution Properties', 1, 'https://www.youtube.com/embed/Pqkw5UY_MNE', 'Introduction to the Normal Distribution - Khan Academy', 14, 'Normaalijakauma on symmetrinen ja kellokäyrän muotoinen. 68-95-99.7 sääntö.'),
('3.4', 'Z-pisteet ja normaalijakauma', 'Z-Scores', 2, 'https://www.youtube.com/embed/P7IcZwSN8Yk', 'Z-Scores and Standardization - Khan Academy', 13, 'Z-pisteet standardoivat arvot normaalijakauman mukaisesti.');

-- 3.5 Korrelaatio ja regressio (Correlation and Regression)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.5', 'Korrelaatio ja riippuvuus', 'Correlation', 1, 'https://www.youtube.com/embed/yUwn91YCj5w', 'Correlation Coefficient - Khan Academy', 13, 'Korrelaatiokerroin mittaa kahden muuttujan välistä lineaarista yhteyttä.'),
('3.5', 'Regressioanalyysi ja ennustaminen', 'Regression Analysis', 2, 'https://www.youtube.com/embed/9CqV8_4V8nk', 'Covariance and the Regression Line - Khan Academy', 14, 'Regressiosuora selittää yhden muuttujan avulla toisen muuttujan vaihtelua.');

-- 3.6 Indeksit (Index Numbers)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.6', 'Hintaindeksit ja inflaatio', 'Price Indices', 1, 'https://www.youtube.com/embed/r8bfBaD7_K8', 'Consumer Price Index and Inflation - Khan Academy', 12, 'Hintaindeksit mittaavat hintatason muutosta. Laspeyres ja Paasche -indeksit.'),
('3.6', 'Laspeyresin ja Paaschen indeksit', 'Laspeyres and Paasche Indices', 2, 'https://www.youtube.com/embed/z7tKYE_HKIE', 'Index Numbers and Real vs Nominal Values - Khan Academy', 13, 'Eri indeksit painottavat eri tavoin. Reaalisen ja nimellisen arvon ero.');

-- 3.7 Diagrammien tulkinta (Chart Interpretation)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('3.7', 'Diagrammien tyypit ja käyttö', 'Chart Types', 1, 'https://www.youtube.com/embed/0M5CP18hxpg', 'Reading and Interpreting Bar Charts - Khan Academy', 11, 'Eri diagrammityypit esittävät erilaista dataa. Pylväs-, viiva- ja piirakkadiagrammit.'),
('3.7', 'Diagrammien tulkitseminen ja analyysi', 'Chart Interpretation', 2, 'https://www.youtube.com/embed/0WrH7RqNQkc', 'Reading and Interpreting Line Graphs - Khan Academy', 12, 'Diagrammien analyysi paljastaa trendejä, korrelaatioita ja poikkeamia.');

-- BUSINESS SECTION

-- 4.1 Yritysmuodot (Business Forms)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.1', 'Yritysmuodot ja niiden vertailu', 'Business Forms and Structures', 1, 'https://www.youtube.com/embed/7HsEV2MkMhQ', 'Business Structures and Organization - Khan Academy', 13, 'Yksityisliike, yhtiöt ja yhteisöt. Yritysmuotojen eroa ja piirteitä.'),
('4.1', 'Suomalaiset yritysmuodot ja säännöstely', 'Finnish Business Forms', 2, 'https://www.youtube.com/embed/lTGhvYxH7Mg', 'Sole Proprietorship, Partnership, and Corporation - Khan Academy', 14, 'Suomessa käytettävät yritysmuodot ja niiden oikeudellinen asema.');

-- 4.2 Tilinpäätös (Financial Statements)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.2', 'Taseen rakenne ja sisältö', 'Balance Sheet', 1, 'https://www.youtube.com/embed/hZvjH3Az87A', 'Balance Sheet and Income Statement Relationship - Khan Academy', 14, 'Tase näyttää omaisuuden, velat ja oman pääoman. Aktiivat ja passiivat.'),
('4.2', 'Tuloslaskelma ja kassavirtalaskelma', 'Income Statement', 2, 'https://www.youtube.com/embed/Sre-y6J5nZA', 'Income Statement and Cash Flow - Khan Academy', 13, 'Tuloslaskelma näyttää tuotot, kulut ja voiton. Kassavirtalaskelma seuraa rahavirta.');

-- 4.3 Kannattavuus (Profitability)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.3', 'Kannattavuussuhteet ja analyysi', 'Profitability Ratios', 1, 'https://www.youtube.com/embed/0FdDCPe5Xr0', 'Financial Ratios and Analysis - Khan Academy', 12, 'Kannattavuussuhteet mittaavat yrityksen kykyä tuottaa voittoa.'),
('4.3', 'Kannattavuusraja ja kattavuusanalyysi', 'Break-Even Analysis', 2, 'https://www.youtube.com/embed/mBqH0X3RMHs', 'Cost-Volume-Profit Analysis - Khan Academy', 13, 'Kannattavuusrajapiste näyttää, milloin yritys alkaa tuottaa voittoa.');

-- 4.4 Markkinointi (Marketing)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.4', '4P malli ja markkinointistrategia', '4P Model and Marketing Strategy', 1, 'https://www.youtube.com/embed/6h_W5Lmq2BQ', 'Marketing Mix and the 4Ps - Khan Academy', 12, 'Tuote, hinta, paikka ja promootio muodostavat markkinointivalikoiman.'),
('4.4', 'Digitaalinen markkinointi ja sosiaalinen media', 'Digital Marketing', 2, 'https://www.youtube.com/embed/gvvU08J1XK8', 'Digital Marketing and Social Media - Khan Academy', 13, 'Internet, email ja sosiaalisen median markkinointi. Digitaalinen strategia.');

-- 4.5 Johtaminen (Management)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.5', 'Johtajuus ja johtamistyylit', 'Leadership and Management Styles', 1, 'https://www.youtube.com/embed/9_8K4bVNxn4', 'Leadership and Management - Khan Academy', 13, 'Johtajuuden merkitys organisaatiossa. Eri johtamistyylit ja niiden vaikutus.'),
('4.5', 'Organisaatiorakenteet ja tiimityö', 'Organizational Structures', 2, 'https://www.youtube.com/embed/kE0nL6K1P0g', 'Organizational Structure and Culture - Khan Academy', 14, 'Organisaation rakenne määrittää valta- ja vastuusuhteet.');

-- 4.6 Yrittäjyys (Entrepreneurship)
INSERT INTO lessons (topic_id, title_fi, title_en, lesson_order, video_url, video_title, estimated_minutes, content_fi) VALUES
('4.6', 'Yrityksen perustaminen ja suunnittelu', 'Starting a Business', 1, 'https://www.youtube.com/embed/JKmWGltLVPg', 'Entrepreneurship and Starting a Business - Khan Academy', 14, 'Yrittäjän ominaisuudet ja yrityksen perustamisen vaiheet.'),
('4.6', 'Liiketoimintasuunnitelma ja rahoitus', 'Business Plan and Financing', 2, 'https://www.youtube.com/embed/9tYFCfNHFpU', 'Business Plan and Startup Funding - Khan Academy', 13, 'Liiketoimintasuunnitelma, rahoitus ja riskienhallinta yritykselle.');

-- Notes:
-- These video URLs are based on Khan Academy's economics and statistics courses
-- All videos are in English, suitable for Finnish students learning economics
-- Some URLs may be Khan Academy links that redirect to YouTube embed URLs
-- Students are encouraged to use Finnish subtitles where available
-- Video durations are estimates based on typical Khan Academy lesson lengths
-- This database serves as a learning companion for Valintakoe F preparation
