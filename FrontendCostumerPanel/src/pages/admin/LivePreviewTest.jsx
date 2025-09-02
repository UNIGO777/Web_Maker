import React from 'react';
import LivePreview from './LivePreview';

function LivePreviewTest() {
  const code = `

function Navbar({ logo, brand, links }) {
  console.log('useState available:', typeof React.useState);
  const [isOpen, setIsOpen] = React.useState(false);
  console.log('isOpen state:', isOpen);

  return (
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-100 p-2 text-sm">
            <strong>useState Test:</strong> isOpen = {isOpen ? 'true' : 'false'} | useState type: {typeof React.useState}
          </div>
          <div className="flex justify-between h-16 items-center">

          {/* Logo + Brand */}
          <div className="flex items-center space-x-3">
            {logo && (
              <img
                src={logo}
                alt={brand}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <a
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
            >
              {brand}
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 hover:text-indigo-600 font-medium relative group transition"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                console.log('Button clicked, current isOpen:', isOpen);
                setIsOpen(!isOpen);
                console.log('Setting isOpen to:', !isOpen);
              }}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 font-medium transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// Example usage
const navbarProps = {
  logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png", // replace with your logo
  brand: "Brian Jones",
  links: [
    { label: "Home", href: "#" },
    { label: "Blog", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

if (window.root && window.ReactDOM) {
  window.root.render(React.createElement(Navbar, navbarProps));
} else if (window.ReactDOM && window.ReactDOM.render) {
  ReactDOM.render(React.createElement(Navbar, navbarProps), document.getElementById('root'));
} else {
  console.error('Neither root nor ReactDOM.render is available');
}
`;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Preview Test</h1>
      <LivePreview code={code} />
    </div>
  );
}

export default LivePreviewTest;