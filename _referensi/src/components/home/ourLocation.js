export default function OurLocation() {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Kunjungi Kami
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Bergabunglah dengan keluarga besar GMIT Betlehem Oesapa Barat
          </p>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Map */}
            <div className="lg:col-span-2">
              <iframe
                allowFullScreen=""
                className="w-full h-64 lg:h-80"
                height="300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.4203793668125!2d123.62715267487363!3d-10.14984678996333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2c56833a1bc16a89%3A0x562f5e0fe5a7835!2sGMIT%20Jemaat%20Betlehem%20Oesapa%20Barat!5e1!3m2!1sid!2sid"
                style={{ border: 0 }}
                width="600"
              />
            </div>

            {/* Address Info */}
            <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-600 dark:to-gray-500">
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Alamat Gereja</h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Oesapa Barat<br />
                  Kec. Kelapa Lima<br />
                  Kota Kupang, NTT<br />
                  <span className="font-medium">GMIT Betlehem Oesapa Barat</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
