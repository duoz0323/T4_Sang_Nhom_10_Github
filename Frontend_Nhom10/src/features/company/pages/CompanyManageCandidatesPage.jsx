import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import Header from '../../../components/layout/Header';
import CompanySidebar from '../../../components/layout/CompanySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const CompanyManageCandidatesPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialJobId = searchParams.get('jobId') || 'ALL';
    
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]); // Chứa danh sách các bài đăng để lọc
    const [stats, setStats] = useState({ total: 0, new: 0 });

    // States cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, ACCEPTED, REJECTED
    const [jobFilter, setJobFilter] = useState(initialJobId);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const jobsResponse = await jobAPI.getMyJobs();
            let allApps = [];
            let total = 0;
            let newApps = 0;

            if (jobsResponse?.data?.result) {
                const jobsData = jobsResponse.data.result;
                setJobs(jobsData); // Lưu lại jobs để render option lọc

                const promises = jobsData.map(j => jobAPI.getApplicationsByJobId(j.jobPostingId || j.id).catch(() => null));
                const resList = await Promise.all(promises);

                resList.forEach((res, idx) => {
                    if (res?.data?.result) {
                        res.data.result.forEach(app => {
                            total++;
                            if (app.status === 'PENDING') newApps++;

                            allApps.push({
                                id: app.id,
                                jobId: jobsData[idx].jobPostingId || jobsData[idx].id,
                                jobTitle: app.jobPosting?.title || jobsData[idx].title || 'Chưa cập nhật',
                                name: app.name || app.candidateProfile?.fullName || 'Ứng viên nặc danh',
                                email: app.email || app.candidateProfile?.email || 'Chưa cập nhật',
                                phone: app.phone || app.candidateProfile?.phoneNumber || 'Chưa cập nhật',
                                status: app.status,
                                location: app.candidateProfile?.address || (jobsData[idx].locations?.[0]?.name) || 'Không có thông tin',
                                experience: app.candidateProfile?.description ? 'Có thông tin kinh nghiệm' : 'Chưa cập nhật',
                                education: app.urlCV || app.candidateProfile?.cvPublicId ? 'Đã tải lên CV' : 'Không có thông tin',
                                avatar: app.candidateProfile?.avatar || 'https://i.pravatar.cc/150?img=' + (allApps.length + 10),
                                reason: app.status === 'REJECTED' ? 'Không phù hợp yêu cầu' : null,
                                cvUrl: app.urlCV,
                                appliedAt: app.appliedAt || new Date().toISOString()
                            });
                        });
                    }
                });

                allApps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
                setCandidates(allApps);
                setStats({ total, new: newApps });
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Lỗi khi tải danh sách ứng viên');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {

        if (!id) {
            toast.error('Không tìm thấy ID của ứng viên!');
            return;
        }
        try {
            await jobAPI.acceptApplication(id);
            toast.success('Đã chấp nhận ứng viên! Hãy liên hệ với họ để trao đổi thêm.');
            fetchData();
        } catch (error) {
            console.error('Lỗi khi thao tác:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Lỗi khi thao tác: ' + error.message);
        }
    };

    const handleReject = async (id) => {

        if (!id) {
            toast.error('Không tìm thấy ID của ứng viên!');
            return;
        }
        try {
            await jobAPI.rejectApplication(id);
            toast.info('Đã từ chối ứng viên.');
            fetchData();
        } catch (error) {
            console.error('Lỗi khi thao tác:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Lỗi khi thao tác: ' + error.message);
        }
    };

    // Logic Lọc và Tìm kiếm được tối ưu
    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const sTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (c.name || '').toLowerCase().includes(sTerm) ||
                (c.jobTitle || '').toLowerCase().includes(sTerm) ||
                (c.email || '').toLowerCase().includes(sTerm);

            const matchesStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
            const matchesJob = jobFilter === 'ALL' ? true : c.jobId === jobFilter;

            return matchesSearch && matchesStatus && matchesJob;
        });
    }, [candidates, searchTerm, statusFilter, jobFilter]);

    const renderActionButtons = (c) => {
        if (c.status === 'PENDING') {
            return (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <a href={c.cvUrl || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all" title="Xem CV">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                    </a>
                    <button onClick={() => handleAccept(c.id)} className="px-4 md:px-6 h-10 md:h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Chấp nhận
                    </button>
                    <button onClick={() => handleReject(c.id)} className="px-4 md:px-6 h-10 md:h-12 bg-error-container text-on-error-container rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-error-container/90 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Từ chối
                    </button>
                </div>
            );
        }
        if (c.status === 'ACCEPTED') {
            return (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <a href={c.cvUrl || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 rounded-xl transition-all" title="Xem CV">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                    </a>
                    <a href={`mailto:${c.email}`} className="px-4 md:px-6 h-10 md:h-12 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-teal-700 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        Liên hệ ứng viên
                    </a>
                    <div className="px-4 h-10 md:h-12 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl font-bold text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-teal-600">verified</span>
                        Đã duyệt
                    </div>
                </div>
            );
        }
        if (c.status === 'REJECTED') {
            return (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <a href={c.cvUrl || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all" title="Xem CV">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                    </a>
                    <div className="px-4 h-10 md:h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center gap-1 border border-slate-200">
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        Đã từ chối
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
            <Header />
            <div className="flex flex-1 pt-16">
                <CompanySidebar />

                <main className="flex-1 bg-surface min-h-screen overflow-y-auto">
                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        {/* Header section matching the image exactly */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-2 font-headline">QUẢN TRỊ NHÂN SỰ</p>
                                <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline mb-2">Danh sách Ứng viên</h2>
                                <p className="text-slate-600 text-lg">Quản lý và sàng lọc các hồ sơ ứng tuyển từ hệ thống JobMatch Executive.</p>
                            </div>
                            <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-8 border border-slate-100">
                                <div className="text-center">
                                    <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">TỔNG CỘNG</p>
                                </div>
                                <div className="w-px h-12 bg-slate-200"></div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-black text-teal-600">{stats.new}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">MỚI</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col xl:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm theo tên, email hoặc vị trí..." 
                                    className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none focus:ring-0 text-sm font-medium outline-none placeholder:text-slate-400" 
                                />
                            </div>
                            <div className="h-px xl:h-12 w-full xl:w-px bg-slate-100"></div>
                            
                            <div className="relative w-full xl:w-64 flex items-center px-2">
                                <select 
                                    value={jobFilter}
                                    onChange={(e) => setJobFilter(e.target.value)}
                                    className="w-full appearance-none bg-transparent border-none text-sm font-semibold text-slate-700 outline-none cursor-pointer p-2 pr-8"
                                >
                                    <option value="ALL">Tất cả bài đăng</option>
                                    {jobs.map((j, i) => (
                                        <option key={i} value={j.jobPostingId || j.id}>{j.title}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined text-slate-400 absolute right-4 pointer-events-none">expand_more</span>
                            </div>

                            <div className="flex gap-2 p-2 bg-surface-container-low rounded-lg overflow-x-auto flex-nowrap">
                                <button 
                                    onClick={() => setStatusFilter('ALL')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold shadow-sm whitespace-nowrap transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
                                    Tất cả
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('PENDING')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all ${statusFilter === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                    Mới
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('ACCEPTED')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all ${statusFilter === 'ACCEPTED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                    Đã duyệt
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('REJECTED')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all ${statusFilter === 'REJECTED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                    Từ chối
                                </button>
                            </div>
                        </div>

                        {/* Candidates List */}
                        <div className="space-y-4">
                            {loading ? (
                                <LoadingSpinner text="Đang tải dữ liệu ứng viên..." />
                            ) : candidates.length === 0 ? (
                                <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-slate-100 border-dashed">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inbox</span>
                                    <p className="text-slate-500 text-lg">Chưa có ứng viên nào nộp đơn.</p>
                                </div>
                            ) : filteredCandidates.length === 0 ? (
                                <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-slate-100 border-dashed">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                                    <p className="text-slate-500 text-lg">Không tìm thấy ứng viên nào phù hợp với bộ lọc.</p>
                                </div>
                            ) : (
                                filteredCandidates.map((c, idx) => (
                                    <div key={idx} className={`bg-surface-container-lowest p-6 rounded-2xl border ${c.status === 'PENDING' ? 'border-teal-100' : 'border-transparent'} hover:border-teal-200 shadow-sm transition-all flex flex-col xl:flex-row xl:items-center gap-6 ${c.status === 'REJECTED' ? 'opacity-75' : ''}`}>
                                        <div className="relative shrink-0">
                                            <img src={c.avatar} alt="Avatar" className={`w-20 h-20 rounded-xl object-cover shadow-sm ${c.status === 'REJECTED' ? 'grayscale' : ''}`} />
                                            {c.status === 'PENDING' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full shadow-sm"></div>}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div>
                                                    <h4 className="text-xl font-bold text-primary">{c.name}</h4>
                                                    <p className={`font-semibold text-sm ${c.status === 'PENDING' || c.status === 'ACCEPTED' ? 'text-teal-700' : 'text-slate-500'}`}>{c.jobTitle}</p>
                                                </div>
                                                <div>
                                                    {c.status === 'PENDING' && <span className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-100"><span className="material-symbols-outlined text-[14px]">fiber_new</span> MỚI</span>}
                                                    {c.status === 'ACCEPTED' && <span className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full"><span className="material-symbols-outlined text-[14px]">check_circle</span> ĐÃ DUYỆT</span>}
                                                    {c.status === 'REJECTED' && <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200"><span className="material-symbols-outlined text-[14px]">block</span> TỪ CHỐI</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">mail</span> {c.email}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">call</span> {c.phone}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span> {c.location}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span> Ứng tuyển: {new Date(c.appliedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {c.experience && c.experience !== 'Chưa cập nhật' && (
                                              <p className="text-sm text-slate-500 line-clamp-1"><span className="font-semibold">Mô tả:</span> {c.experience}</p>
                                            )}
                                        </div>
                                        <div className="shrink-0">
                                            {renderActionButtons(c)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CompanyManageCandidatesPage;
