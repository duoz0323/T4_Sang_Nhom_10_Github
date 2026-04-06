import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Làm thế nào để viết CV thu hút nhà tuyển dụng Executive?",
    excerpt: "Bí quyết để làm nổi bật kinh nghiệm lãnh đạo và những thành tựu định lượng trong hồ sơ của bạn...",
    category: "Sự nghiệp",
    author: "Nguyễn Văn A",
    date: "05/04/2026",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop",
    readTime: "5 phút đọc"
  },
  {
    id: 2,
    title: "Xu hướng tuyển dụng nhân sự cấp cao năm 2026",
    excerpt: "Tìm hiểu về những kỹ năng và phẩm chất mà các tập đoàn Fortune 500 đang tìm kiếm ở các ứng viên tiềm năng...",
    category: "Thị trường",
    author: "Trần Thị B",
    date: "02/04/2026",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop",
    readTime: "8 phút đọc"
  },
  {
    id: 3,
    title: "Cân bằng giữa công việc và cuộc sống cho nhà quản lý",
    excerpt: "Chiến lược quản lý thời gian hiệu quả để duy trì hiệu suất làm việc cao mà vẫn dành thời gian cho gia đình...",
    category: "Lifestyle",
    author: "Phạm Văn C",
    date: "28/03/2026",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
    readTime: "6 phút đọc"
  },
  {
    id: 4,
    title: "Phỏng vấn vị trí Giám đốc: Những câu hỏi hóc búa nhất",
    excerpt: "Cách trả lời các câu hỏi về tầm nhìn chiến lược và khả năng giải quyết khủng hoảng trong các buổi phỏng vấn quan trọng...",
    category: "Kỹ năng phỏng vấn",
    author: "Lê Thị D",
    date: "20/03/2026",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
    readTime: "10 phút đọc"
  }
];

const BlogPage = () => {
  return (
    <div className="bg-surface font-body text-on-surface flex flex-col min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-widest uppercase text-xs">Blog & Tin tức</span>
            <h1 className="text-4xl md:text-5xl font-black font-headline text-primary mt-4 mb-6">
              Kiến thức & <span className="text-secondary">Cảm hứng</span> Sự nghiệp
            </h1>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Cập nhật những xu hướng mới nhất về thị trường lao động cao cấp, bí quyết thăng tiến và chiến lược phát triển bản thân.
            </p>
          </div>

          {/* Featured Post (Optional first item) */}
          <div className="mb-16">
            <div className="relative h-[400px] rounded-3xl overflow-hidden group">
              <img 
                src={BLOG_POSTS[0].image} 
                alt={BLOG_POSTS[0].title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary text-xs font-bold uppercase tracking-wider">
                  {BLOG_POSTS[0].category}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-4 font-headline leading-tight">
                  {BLOG_POSTS[0].title}
                </h2>
                <p className="text-slate-200 text-lg mb-6 line-clamp-2 font-light">
                  {BLOG_POSTS[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-slate-300 text-sm">
                  <span className="font-medium">{BLOG_POSTS[0].author}</span>
                  <span>•</span>
                  <span>{BLOG_POSTS[0].date}</span>
                  <span>•</span>
                  <span>{BLOG_POSTS[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.slice(1).map((post) => (
              <article key={post.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 group">
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-3">
                    <span className="font-medium">{post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors font-headline leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-6 line-clamp-3 font-light leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <span className="text-xs text-outline italic">{post.readTime}</span>
                    <button className="text-secondary font-bold text-sm flex items-center gap-1 group/btn">
                      Đọc tiếp 
                      <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination/Load More */}
          <div className="mt-16 text-center">
            <button className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95">
              Xem thêm bài viết
            </button>
          </div>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-container">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black font-headline text-white mb-4">Đừng bỏ lỡ bài viết nào</h2>
          <p className="text-on-primary-container text-lg mb-8 font-light">Đăng ký để nhận những kiến thức và cơ hội nghề nghiệp mới nhất trực tiếp vào hộp thư của bạn.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary focus:bg-white/20 outline-none transition-all" 
              placeholder="Địa chỉ email của bạn" 
              type="email" 
            />
            <button className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-secondary/20">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
