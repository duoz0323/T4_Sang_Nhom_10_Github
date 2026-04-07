const HeroSection = () => {
  return (
    <div className="space-y-5">
      {/* Badge */}
      <div className="inline-block">
        <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">
          CƠ HỘI LÃNH ĐẠO CẤP CAO
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
        Kết nối ứng viên & doanh nghiệp{' '}
        <span className="text-teal-600">nhanh chóng</span>
      </h1>
      
      {/* Description */}
      <p className="text-base text-gray-600 leading-relaxed max-w-xl">
        Truy cập các vị trí cao cấp được tuyển từ các công ty kiến trúc hàng đầu
        thế giới. Chúng tôi tập trung vào tầm nhìn, di sản và tác động chuyên môi.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-3">
        <button className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors">
          Bắt đầu ngay
        </button>
        <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:border-teal-600 hover:text-teal-600 transition-colors">
          Xem tin tuyển dụng
        </button>
      </div>

      {/* Features Badges */}
      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm text-gray-600">Quản lý CV thông minh</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-sm text-gray-600">Thông báo thời gian thực</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
