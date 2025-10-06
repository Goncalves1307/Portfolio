import { Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-primary-500">Diogo</span>
              <span>.dev</span>
            </h3>
            <p className="text-gray-400 mb-6">
              A passionate computer science student and developer building
              impactful digital solutions through code and creativity.
            </p>
            <p className="text-sm text-gray-500">
              © {currentYear} Diogo Soares. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 flex flex-col ">
              {["About", "Projects", "Skills", "Contact"].map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                Contact{" "}
                <span className="text-primary-500 ml-1">Information</span>
              </h3>

              <div className="space-y-6 mb-8">
                {/* Email */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                    <Mail className="text-primary-600 dark:text-primary-400 w-20 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Email</h4>
                    <a
                      href="mailto:diogo.soares.g2003@icloud.com"
                      className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      diogo.soares.g2003@icloud.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mr-4">
                    <MapPin className="text-secondary-600 dark:text-secondary-400 w-20 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Matosinhos, Portugal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
