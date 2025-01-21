function Footer() {
    return (
      <footer className="border-t border-secondary bg-secondary-light mt-12 sm:mt-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
            <p className="text-xs sm:text-sm text-text-secondary">
              © {new Date().getFullYear()} TicVision. All rights reserved.
            </p>

            <div className="flex gap-4 justify-center sm:justify-end sm:gap-6">
              <a
                href="https://www.termsfeed.com/live/7b535df7-4adb-424e-9592-321ef0e23384"
                className="text-xs sm:text-sm text-text-secondary hover:text-primary"
              >
                Privacy Policy
              </a>
              <span className="text-text-secondary">|</span>
              <a
                href="https://vgiezs4h7sp.typeform.com/to/PBeAe1Yq"
                className="text-xs sm:text-sm text-text-secondary hover:text-primary"
              >
                Feedback Form
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  