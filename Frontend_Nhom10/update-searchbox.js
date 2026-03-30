import { unlinkSync, writeFileSync } from 'fs';

const file = 'src/features/home/components/SearchBox.jsx';

try {
  unlinkSync(file);
  console.log('✓ Deleted:', file);
} catch (e) {
  console.log('File not found, creating new one');
}

const newContent = `import { useState } from 'react';

const SearchBox = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    let minSalary = 0;
    let maxSalary = 200000000;
    
    if (salaryRange) {
      const ranges = {
        '0-50': [0, 50000000],
        '50-100': [50000000, 100000000],
        '100-150': [100000000, 150000000],
        '150-200': [150000000, 200000000],
        '200+': [200000000, 999999999],
      };
      [minSalary, maxSalary] = ranges[salaryRange] || [0, 200000000];
    }

    onSearch({
      keyword,
      industry,
      salaryRange: [minSalary, maxSalary],
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-base font-semibold text-gray-900">Tìm kiếm nâng cao</h3>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Từ khóa</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Vị trí, kỹ năng, công ty..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Lĩnh vực</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm">
            <option value="">Tất cả lĩnh vực</option>
            <option value="IT">IT</option>
            <option value="Tài chính">Tài chính</option>
            <option value="Y tế">Y tế</option>
            <option value="Giáo dục">Giáo dục</option>
            <option value="Marketing">Marketing</option>
            <option value="Bán lẻ">Bán lẻ</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Mức lương</label>
          <select value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm">
            <option value="">Tất cả mức lương</option>
            <option value="0-50">VND: 0-50 triệu</option>
            <option value="50-100">VND: 50-100 triệu</option>
            <option value="100-150">VND: 100-150 triệu</option>
            <option value="150-200">VND: 150-200 triệu</option>
            <option value="200+">VND: 200+ triệu</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default SearchBox;`;

writeFileSync(file, newContent);
console.log('✓ Created new:', file);
