import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-brand-700">ValintakoeF</div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Kirjaudu
          </Link>
          <Link
            href="/signup"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Aloita ilmaiseksi
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block bg-blue-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            Tekoälyavusteinen oppiminen
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Valmistaudu Valintakoe F:ään{' '}
            <span className="text-brand-600">älykkäämmin</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Henkilökohtainen opiskelusuunnitelma, 24/7 tekoälytuutorit, Pomodoro-ajastin,
            Feynman-tekniikka ja spaced repetition — kaikki yhdessä paikassa.
            Edullisempi kuin kilpailijat, tehokkaampi kuin perinteiset kurssit.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-brand-600 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-blue-200"
            >
              Kokeile ilmaiseksi
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Lue lisää
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon="🧠"
            title="Feynman-tekniikka"
            description="Selitä aihe omin sanoin — tekoäly arvioi ymmärryksesi ja näyttää puutteet."
          />
          <FeatureCard
            icon="🍅"
            title="Pomodoro-ajastin"
            description="25 min keskittymistä + 5 min tauko. Optimaalinen opiskelurytmi sisäänrakennettu."
          />
          <FeatureCard
            icon="🔄"
            title="Spaced repetition"
            description="SM-2-algoritmi ajoittaa kertauksen juuri oikeaan hetkeen — et unohda oppimaasi."
          />
          <FeatureCard
            icon="🤖"
            title="24/7 tekoälytuutori"
            description="Kysymys keskellä yötä? Tekoälytuutori auttaa milloin tahansa, selkeällä suomella."
          />
          <FeatureCard
            icon="📊"
            title="Harjoituskokeet"
            description="Rajattomasti harjoituskokeita jotka mukautuvat tasollesi. Realistinen Valintakoe F -formaatti."
          />
          <FeatureCard
            icon="💬"
            title="Opiskelijafoorumi"
            description="Jaa ongelmia ja ratkaisuja muiden kokelaiden kanssa. Et ole yksin."
          />
        </div>

        {/* Pricing teaser */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Paras valmistautuminen — ilman tuhansien eurojen hintaa
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kilpailijoiden kurssit maksavat €300–€1000. Me tarjoamme henkilökohtaisen,
            tekoälypohjaisen oppimiskokemuksen murto-osalla hinnasta.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 ValintakoeF. Rakennettu opiskelijoille, opiskelijoiden toimesta.</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
