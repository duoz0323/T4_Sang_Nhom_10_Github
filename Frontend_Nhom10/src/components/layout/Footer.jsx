import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Logo & Description */}
          <div className="col-span-1">
            <img 
              src="/images/logo.png" 
              alt="TalentLink Logo" 
              className="h-28 w-auto object-contain mb-4"
            />
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Nền tảng Săn đầu người - Kết nối ứng viên chất lượng với các doanh nghiệp hàng đầu tại Việt Nam.
            </p>
            <div className="flex gap-3">
              <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">share</span>
              </button>
              <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">language</span>
              </button>
            </div>
          </div>

          {/* Column 2: VỀ CHÚNG TÔI */}
          <div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              VỀ CHÚNG TÔI
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/recruitment-process" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Quy trình tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/media" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Báo cáo thị trường
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: PHÁP LÝ */}
          <div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              PHÁP LÝ
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link to="/policy" className="text-on-surface hover:text-primary transition-colors text-sm">
                  Quy chế hoạt động
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: LIÊN HỆ */}
          <div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              LIÊN HỆ
            </h4>
            <ul className="space-y-3">
              <li className="text-on-surface text-sm">
                Tầng 24, Ngôi Nhà Đức<br />
                33 Lê Duẩn, Quận 1, TP. HCM
              </li>
              <li className="text-on-surface text-sm">
                +84 (28) 3910 0000
              </li>
              <li>
                <a 
                  href="mailto:contact@jobmatch.vn" 
                  className="text-primary hover:underline text-sm"
                >
                  contact@jobmatch.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant text-xs">
            © 2026 JOBMATCH EXECUTIVE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-on-surface-variant hover:text-primary text-xs uppercase transition-colors">
              LINKEDIN
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary text-xs uppercase transition-colors">
              INSTAGRAM
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary text-xs uppercase transition-colors">
              FACEBOOK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
