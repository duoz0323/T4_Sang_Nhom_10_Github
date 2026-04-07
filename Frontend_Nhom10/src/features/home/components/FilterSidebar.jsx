import { useState, useEffect } from 'react';

const FilterSidebar = ({ filters, onFilterChange, totalJobs }) => {
  const [industries, setIndustries] = useState([
    'IT',
    'Tài chính',
    'Y tế',
    'Giáo dục',
    'Marketing',
    'Bán lẻ',
  ]);

  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(200);

  useEffect(() => {
    onFilterChange({
      salaryRange: [salaryMin * 1000000, salaryMax * 1000000],
    });
  }, [salaryMin, salaryMax]);

  const handleIndustryChange = (industry) => {
    onFilterChange({
      industry: filters.industry === industry ? '' : industry,
    });
  };

  const handleClearFilters = () => {
    setSalaryMin(0);
    setSalaryMax(200);
    onFilterChange({
      keyword: '',
      location: '',
      industry: '',
      salaryRange: [0, 200000000],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-teal-600 hover:text-teal-700"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Total Jobs */}
      <div className="mb-6 p-3 bg-teal-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Tìm thấy{' '}
          <span className="font-semibold text-teal-600">{totalJobs}</span> công
          việc
        </p>
      </div>

      {/* Industry Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Ngành nghề</h4>
        <div className="space-y-2">
          {industries.map((industry) => (
            <label
              key={industry}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.industry === industry}
                onChange={() => handleIndustryChange(industry)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{industry}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Mức lương (triệu VNĐ/tháng)
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Từ</label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={salaryMin}
              onChange={(e) => setSalaryMin(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <p className="text-sm text-gray-700 mt-1">{salaryMin} triệu</p>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Đến</label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={salaryMax}
              onChange={(e) => setSalaryMax(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <p className="text-sm text-gray-700 mt-1">
              {salaryMax === 200 ? '200+ triệu' : `${salaryMax} triệu`}
            </p>
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Địa điểm</h4>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        >
          <option value="">Tất cả địa điểm</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
          <option value="Cần Thơ">Cần Thơ</option>
          <option value="Hải Phòng">Hải Phòng</option>
        </select>
      </div>

      {/* Job Type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Loại hình công việc
        </h4>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Remote', 'Hybrid'].map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
