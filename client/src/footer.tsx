function Footer() {
  const todayDate = new Date().getFullYear();

  return (
    <footer className="bg-[#4a90a1] border-t border-secondary mt-auto py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-center sm:text-left">
          <p className="text-xs sm:text-sm text-white">
            © {todayDate} TicVision. All rights reserved.
          </p>

          <div className="flex gap-4 justify-center sm:justify-end sm:gap-6">
            <a
              href="https://vgiezs4h7sp.typeform.com/to/PBeAe1Yq"
              className="text-xs sm:text-sm text-white"
            >
              <strong>
                Feedback Form
              </strong>
            </a>
            <span className="text-white">|</span>
            <a
              href="https://www.termsfeed.com/live/7b535df7-4adb-424e-9592-321ef0e23384"
              className="text-xs sm:text-sm text-white"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;