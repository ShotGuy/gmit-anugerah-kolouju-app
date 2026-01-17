import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta content="GMIT Betlehem Oesapa Barat" name="application-name" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="GMIT JBOB" name="apple-mobile-web-app-title" />
        <meta
          content="GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur. Ibadah Minggu, Cell Group, Sidi, Pernikahan, Baptis, Pelayanan Jemaat, dan kegiatan gereja lainnya di Kupang NTT."
          name="description"
        />
        <meta content="telephone=no" name="format-detection" />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta content="/browserconfig.xml" name="msapplication-config" />
        <meta content="#2B5797" name="msapplication-TileColor" />
        <meta content="#2B5797" name="theme-color" />

        {/* Additional SEO meta tags */}
        <meta
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          name="robots"
        />
        <meta
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          name="googlebot"
        />
        <meta
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          name="bingbot"
        />
        <meta content="GMIT Betlehem Oesapa Barat" name="author" />
        <meta content="GMIT Betlehem Oesapa Barat" name="publisher" />
        <meta content="id" name="language" />
        <meta content="ID-NT" name="geo.region" />
        <meta content="Kupang" name="geo.placename" />
        <meta content="-10.1718;123.6044" name="geo.position" />
        <meta content="-10.1718, 123.6044" name="ICBM" />

        {/* Enhanced SEO Keywords */}
        <meta
          content="GMIT, GMIT Betlehem Oesapa Barat, GMIT Jemaat Betlehem Oesapa Barat, JBOB, Gereja Betlehem Oesapa Barat Kupang, Gereja Kristen Kupang, Gereja Protestan Kupang, Gereja di Kupang, Ibadah Minggu Kupang, Ibadah Gereja Kupang, Pelayanan Gereja, Jemaat GMIT, Sidi GMIT, Baptis GMIT, Pernikahan Gereja, Kegiatan Gereja Kupang, NTT, Nusa Tenggara Timur, GMIT Kupang, GMIT JBOB"
          name="keywords"
        />

        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/site.webmanifest" rel="manifest" />
        <link color="#5bbad5" href="/safari-pinned-tab.svg" rel="mask-icon" />
        <link href="/favicon.ico" rel="shortcut icon" />

        {/* Preload critical resources moved to specific pages where they are actually used */}

        {/* DNS prefetch for external domains */}
        <link href="//beta.ourmanna.com" rel="dns-prefetch" />

        {/* Preconnect to external origins */}
        <link href="https://beta.ourmanna.com" rel="preconnect" />

        <meta content="summary_large_image" name="twitter:card" />
        <meta content="https://www.gmit-jbob.org" name="twitter:url" />
        <meta content="GMIT Betlehem Oesapa Barat - Gereja Masehi Injili di Timor" name="twitter:title" />
        <meta
          content="GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur. Ibadah, Pelayanan, dan Persekutuan Jemaat."
          name="twitter:description"
        />
        <meta
          content="https://www.gmit-jbob.org/logo-GMIT.png"
          name="twitter:image"
        />
        <meta content="@gmitjbob" name="twitter:site" />
        <meta content="@gmitjbob" name="twitter:creator" />

        {/* Enhanced Open Graph Tags */}
        <meta content="website" property="og:type" />
        <meta content="GMIT Betlehem Oesapa Barat - Gereja Masehi Injili di Timor" property="og:title" />
        <meta
          content="GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur. Ibadah, Pelayanan, dan Persekutuan Jemaat."
          property="og:description"
        />
        <meta content="GMIT Betlehem Oesapa Barat" property="og:site_name" />
        <meta content="https://www.gmit-jbob.org" property="og:url" />
        <meta
          content="https://www.gmit-jbob.org/logo-GMIT.png"
          property="og:image"
        />
        <meta content="1200" property="og:image:width" />
        <meta content="630" property="og:image:height" />
        <meta content="image/png" property="og:image:type" />
        <meta content="id_ID" property="og:locale" />
        <meta content="GMIT Betlehem Oesapa Barat" property="og:locality" />
        <meta content="Kupang" property="og:region" />
        <meta content="ID" property="og:country-name" />

        <link href="https://www.gmit-jbob.org" rel="canonical" />

        {/* Enhanced Schema.org Structured Data */}
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://www.gmit-jbob.org",
              "name": "GMIT Jemaat Betlehem Oesapa Barat",
              "alternateName": ["GMIT Betlehem Oesapa Barat", "JBOB", "GMIT JBOB"],
              "url": "https://www.gmit-jbob.org",
              "logo": "https://www.gmit-jbob.org/logo-GMIT.png",
              "image": "https://www.gmit-jbob.org/logo-GMIT.png",
              "description": "GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Kupang",
                "addressRegion": "Nusa Tenggara Timur",
                "addressCountry": "ID",
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -10.1718,
                "longitude": 123.6044,
              },
              "telephone": "", // Add phone number when available
              "email": "", // Add email when available
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Sunday"],
                "opens": "07:00",
                "closes": "11:00",
              },
              "publicAccess": true,
              "category": [
                "Religious Organization",
                "Christian Church",
                "Protestant Church",
                "Gereja Masehi Injili",
                "Church in Kupang"
              ],
              "areaServed": {
                "@type": "City",
                "name": "Kupang",
                "containedInPlace": {
                  "@type": "AdministrativeArea",
                  "name": "Nusa Tenggara Timur",
                  "containedInPlace": {
                    "@type": "Country",
                    "name": "Indonesia"
                  }
                }
              },
              "foundingDate": "", // Add founding date if available
              "founder": {
                "@type": "Organization",
                "name": "Gereja Masehi Injili di Timor"
              },
              "sameAs": [
                // Add social media URLs when available
              ],
              "potentialAction": {
                "@type": "Action",
                "name": "Join Service",
                "description": "Ibadah Minggu dan Kegiatan Gereja"
              },
              "branchOf": {
                "@type": "Organization",
                "name": "Gereja Masehi Injili di Timor (GMIT)"
              }
            }),
          }}
          type="application/ld+json"
        />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="aaaf6ef3-0eb3-43f0-a9c3-938de6e18ad1"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              // Check if we are in development mode (localhost)
              const isLocalhost = Boolean(
                window.location.hostname === 'localhost' ||
                window.location.hostname === '[::1]' ||
                window.location.hostname.match(
                  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
                )
              );

              if (isLocalhost) {
                // IN DEV: Unregister to prevent caching issues
                console.log('Dev mode detected: Unregistering Service Worker');
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              } else {
                // IN PROD: Register Service Worker
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            }
          `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />

        <NextScript />
      </body>
    </Html>
  );
}
