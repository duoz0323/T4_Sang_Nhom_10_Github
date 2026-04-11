// Hình nền kinh doanh cho các trang xác thực
const BusinessHeroBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Nền gradient dự phòng */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900 via-slate-800 to-slate-900" />

      {/* Hình ảnh hero đô thị kinh doanh */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/img/image.png')`
        }}
      />
      
      {/* Overlay nhẹ để text dễ đọc hơn */}
      <div className="absolute inset-0 bg-slate-900/40" />
      
      {/* Overlay gradient cho phần form */}
      <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 via-transparent to-transparent" />
    </div>
  );
};

export default BusinessHeroBackground;
