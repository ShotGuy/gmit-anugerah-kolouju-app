
import { getRoleConfig } from "@/config/navigationItem";

export default function AppFooter({ role = "admin" }) {
  const config = getRoleConfig(role);

  return (
    <footer className="bg-gray-900 text-white lg:pl-64">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Role Info */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">
              GMIT Imanuel Oepura - {config.roleTitle}
            </h3>
            <p className="text-gray-300 text-sm mb-4">{config.description}</p>
            <div className="text-gray-300 text-sm">
              {config.roleTitle} Panel Version 1.0
            </div>
          </div> */}

          {/* Quick Links */}
          {/* <div>
            <h4 className="text-md font-semibold mb-4">
              Menu {config.roleTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              {config.footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="text-gray-300 hover:text-white transition-colors"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Contact Info */}
          {/* <div>
            <h4 className="text-md font-semibold mb-4">Kontak Gereja</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{churchContact.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>{churchContact.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{churchContact.email}</span>
              </div>
            </div>
          </div> */}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-300">
              © 2025 GMIT Betlehem Oesapa Barat. Sistem {config.roleTitle} Gereja.
            </div>
            {/* <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-300">
              <span>Dibuat dengan</span>
              <Heart className="w-4 h-4 mx-1 text-red-500" />
              <span>untuk melayani Tuhan</span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
