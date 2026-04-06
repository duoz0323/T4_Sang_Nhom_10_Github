import { Link } from 'react-router';

const JobCard = ({ job }) => {
  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    const millions = salary / 1000000;
    return `${millions.toFixed(0)} triệu VNĐ`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(job.deadline);

  return (
    <Link
      to={`/jobs/${job.jobPostingId}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-teal-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Job Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
            {job.title}
          </h3>

          {/* Company Info (placeholder - backend không có company name) */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-sm">Công ty hàng đầu</span>
          </div>

          {/* Description (truncated) */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {job.description || 'Không có mô tả'}
          </p>

          {/* Job Details */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Salary */}
            <div className="flex items-center gap-1.5 text-sm">
              <svg
                className="w-4 h-4 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                {formatSalary(job.salaryRequire)}
              </span>
            </div>

            {/* Locations */}
            {job.locations && job.locations.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <svg
                  className="w-4 h-4 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-700">
                  {job.locations.map((loc) => loc.city).join(', ')}
                </span>
              </div>
            )}

            {/* Deadline */}
            {job.deadline && (
              <div className="flex items-center gap-1.5 text-sm">
                <svg
                  className="w-4 h-4 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700">{formatDate(job.deadline)}</span>
              </div>
            )}
          </div>

          {/* Skills/Industries */}
          <div className="flex flex-wrap gap-2">
            {job.industries &&
              job.industries.slice(0, 3).map((industry) => (
                <span
                  key={industry.industryJobId}
                  className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                >
                  {industry.nameIndustry}
                </span>
              ))}
            
            {job.industries &&
              job.industries[0]?.skills &&
              job.industries[0].skills.slice(0, 2).map((skill) => (
                <span
                  key={skill.jobSkillId}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {skill.skillName}
                </span>
              ))}
          </div>
        </div>

        {/* Status Badge */}
        <div className="ml-4 flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {job.status === 'ACTIVE' ? 'Đang tuyển' : job.status}
          </span>

          {daysRemaining !== null && daysRemaining > 0 && (
            <span className="text-xs text-gray-500">
              Còn {daysRemaining} ngày
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
