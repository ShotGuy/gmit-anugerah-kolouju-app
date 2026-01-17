import Head from "next/head";

export default function PageTitle({
  title,
  description,
  keywords,
  image = "/logo-GMIT.png",
  url,
  type = "website",
}) {
  const baseTitle = "GMIT Betlehem Oesapa Barat";
  const fullTitle = title ? `${title} - ${baseTitle}` : baseTitle;
  const baseDescription =
    description ||
    "GMIT Jemaat Betlehem Oesapa Barat (JBOB) - Gereja Masehi Injili di Timor yang melayani jemaat dengan penuh kasih dan dedikasi di Kupang, Nusa Tenggara Timur.";
  const baseUrl = "https://www.gmit-jbob.org";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImage = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta content={baseDescription} name="description" />
      {keywords ? (
        <meta content={`${keywords}, GMIT, GMIT Jemaat Betlehem Oesapa Barat, JBOB, Gereja Kupang, Gereja Kristen, Ibadah Minggu, Pelayanan Gereja, Kegiatan Gereja`} name="keywords" />
      ) : (
        <meta content="GMIT, GMIT Jemaat Betlehem Oesapa Barat, JBOB, Gereja Masehi Injili di Timor, Gereja Kupang, Ibadah Minggu, Pelayanan Gereja, Kegiatan Gereja, Sidi, Baptis, Pernikahan, Nusa Tenggara Timur" name="keywords" />
      )}
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta content="index, follow" name="robots" />
      <meta content="GMIT Jemaat Betlehem Oesapa Barat" name="author" />
      <meta content="GMIT Jemaat Betlehem Oesapa Barat" name="publisher" />
      <meta content="id" name="language" />

      {/* Favicon */}
      <link href="/favicon.ico" rel="icon" />
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
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" />

      {/* Open Graph */}
      <meta content={type} property="og:type" />
      <meta content={fullTitle} property="og:title" />
      <meta content={baseDescription} property="og:description" />
      <meta content={fullImage} property="og:image" />
      <meta content={fullUrl} property="og:url" />
      <meta content="GMIT Betlehem Oesapa Barat" property="og:site_name" />
      <meta content="id_ID" property="og:locale" />

      {/* Twitter Card */}
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={fullTitle} name="twitter:title" />
      <meta content={baseDescription} name="twitter:description" />
      <meta content={fullImage} name="twitter:image" />
      <meta content="@gmitjbob" name="twitter:site" />

      {/* Canonical URL */}
      <link href={fullUrl} rel="canonical" />

      {/* Schema.org structured data */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GMIT Jemaat Betlehem Oesapa Barat",
            alternateName: "JBOB",
            url: baseUrl,
            logo: fullImage,
            description: baseDescription,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kupang",
              addressRegion: "Nusa Tenggara Timur",
              addressCountry: "ID",
            },
            sameAs: [
              // Add social media URLs when available
            ],
          }),
        }}
        type="application/ld+json"
      />
    </Head>
  );
}
