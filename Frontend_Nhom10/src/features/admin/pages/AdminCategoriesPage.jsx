import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import { locationAPI, industryAPI, skillAPI } from '../../../services/api';
import api from '../../../services/api';


const TAB_CONFIG = [
  {
    key: 'location',
    label: 'Địa điểm',
    icon: 'location_on',
    plural: 'địa điểm',
    color: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', border: 'border-[#2e7d32]', btn: 'bg-[#2e7d32] hover:bg-[#1b5e20]' },
    getAll:    () => api.get('/locations'),
    create:    (name) => api.post('/locations', { city: name }),
    update:    (id, name) => api.put(`/locations/${id}`, { city: name }),
    remove:    (id) => api.delete(`/locations/${id}`),
    getId:     (item) => item.locationId || item.id,
    getName:   (item) => item.city || item.name || '', 
  },
  {
    key: 'industry',
    label: 'Lĩnh vực',
    icon: 'work',
    plural: 'lĩnh vực',
    color: { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', border: 'border-[#1565c0]', btn: 'bg-[#1565c0] hover:bg-[#0d47a1]' },
    getAll:    () => api.get('/industries'),
    create:    (name) => api.post('/industries', { nameIndustry: name }), 
    update:    (id, name) => api.put(`/industries/${id}`, { nameIndustry: name }),
    remove:    (id) => api.delete(`/industries/${id}`),
    getId:     (item) => item.industryId || item.id,
    getName:   (item) => item.nameIndustry || item.name || '', 
  },
  {
    key: 'skill',
    label: 'Kỹ năng',
    icon: 'psychology',
    plural: 'kỹ năng',
    color: { bg: 'bg-[#f3e5f5]', text: 'text-[#6a1b9a]', border: 'border-[#6a1b9a]', btn: 'bg-[#6a1b9a] hover:bg-[#4a148c]' },
    getAll:    () => api.get('/skills'),
    create:    (name) => api.post('/skills', { skillName: name, name: name }),
    update:    (id, name) => api.put(`/skills/${id}`, { skillName: name, name: name }),
    remove:    (id) => api.delete(`/skills/${id}`),
    getId:     (item) => item.skillId || item.id,
    getName:   (item) => item.skillName || item.name || '',
  },
];

const AdminCategoriesPage = () => {
  const [activeTab, setActiveTab] = useState('location');
  const [data, setData] = useState({ location: [], industry: [], skill: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form thêm mới
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Form sửa
  const [editingItem, setEditingItem] = useState(null); // { id, name }
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Xóa
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // item cần xác nhận xóa

  const tab = TAB_CONFIG.find(t => t.key === activeTab);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [locRes, indRes, skRes] = await Promise.all([
        TAB_CONFIG[0].getAll().catch(() => null),
        TAB_CONFIG[1].getAll().catch(() => null),
        TAB_CONFIG[2].getAll().catch(() => null),
      ]);
      setData({
        location: locRes?.data?.result || [],
        industry: indRes?.data?.result || [],
        skill:    skRes?.data?.result  || [],
      });
    } catch {
      toast.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Thêm mới
  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      setAdding(true);
      const res = await tab.create(name);
      const newItem = res?.data?.result || { id: Date.now(), name };
      setData(prev => ({ ...prev, [activeTab]: [...prev[activeTab], newItem] }));
      toast.success(`Đã thêm ${tab.plural} "${name}"`);
      setNewName('');
    } catch {
      toast.error(`Thêm thất bại. Kiểm tra lại kết nối hoặc quyền admin.`);
    } finally {
      setAdding(false);
    }
  };

  // Bắt đầu sửa
  const startEdit = (item) => {
    setEditingItem(tab.getId(item));
    setEditName(item.name);
  };

  // Lưu sửa
  const handleSave = async (item) => {
    const id = tab.getId(item);
    const name = editName.trim();
    if (!name || name === item.name) { setEditingItem(null); return; }
    try {
      setSaving(true);
      await tab.update(id, name);
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(d =>
          tab.getId(d) === id ? { ...d, name } : d
        ),
      }));
      toast.success('Đã cập nhật');
      setEditingItem(null);
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận xóa
  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = tab.getId(confirmDelete);
    try {
      setDeletingId(id);
      await tab.remove(id);
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(d => tab.getId(d) !== id),
      }));
      toast.success('Đã xóa');
    } catch {
      toast.error('Xóa thất bại. Danh mục này có thể đang được sử dụng.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const currentList = data[activeTab] || [];
  const filtered = !search
    ? currentList
    : currentList.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <div className="flex flex-1 pt-16">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">

            {/* Tiêu đề */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary">Quản lý danh mục</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Thêm, sửa, xóa địa điểm, lĩnh vực ngành nghề và kỹ năng trong hệ thống
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {TAB_CONFIG.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(t.key); setSearch(''); setEditingItem(null); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    activeTab === t.key
                      ? `${t.color.bg} ${t.color.border} shadow-md`
                      : 'bg-white border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`material-symbols-outlined text-2xl ${activeTab === t.key ? t.color.text : 'text-on-surface-variant'}`}>
                      {t.icon}
                    </span>
                    <span className={`text-2xl font-extrabold ${activeTab === t.key ? t.color.text : 'text-primary'}`}>
                      {data[t.key]?.length || 0}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold ${activeTab === t.key ? t.color.text : 'text-on-surface-variant'}`}>
                    {t.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Form thêm mới */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                  <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                    <span className={`material-symbols-outlined text-lg ${tab.color.text}`}>{tab.icon}</span>
                    Thêm {tab.plural} mới
                  </h2>
                  <form onSubmit={handleAdd} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-1.5">
                        Tên {tab.plural}
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder={`Nhập tên ${tab.plural}...`}
                        className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={adding || !newName.trim()}
                      className={`w-full py-2.5 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${tab.color.btn}`}
                    >
                      {adding
                        ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Đang thêm...</>
                        : <><span className="material-symbols-outlined text-base">add</span> Thêm {tab.plural}</>
                      }
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-outline-variant space-y-2">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Lưu ý</p>
                    <p className="text-xs text-on-surface-variant">
                      Không thể xóa danh mục đang được sử dụng trong tin tuyển dụng hoặc hồ sơ ứng viên/doanh nghiệp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                  {/* Tabs header */}
                  <div className="flex items-center gap-2 px-4 pt-4 pb-0 border-b border-outline-variant">
                    {TAB_CONFIG.map(t => (
                      <button
                        key={t.key}
                        onClick={() => { setActiveTab(t.key); setSearch(''); setEditingItem(null); }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                          activeTab === t.key
                            ? `${t.color.text} border-current`
                            : 'text-on-surface-variant border-transparent hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{t.icon}</span>
                        {t.label}
                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          activeTab === t.key ? `${t.color.bg} ${t.color.text}` : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {data[t.key]?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="p-4 border-b border-outline-variant">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={`Tìm ${tab.plural}...`}
                        className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* List */}
                  {loading ? (
                    <div className="p-5 space-y-2">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-11 bg-surface-container animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-14 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl block mb-2">{tab.icon}</span>
                      <p className="font-medium">Chưa có {tab.plural} nào</p>
                      <p className="text-sm mt-1">Thêm mới từ form bên trái</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant overflow-y-auto max-h-[55vh]">
                      {filtered.map((item, i) => {
                        const id = tab.getId(item);
                        const isEditing = editingItem === id;
                        return (
                          <div key={id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container transition-colors group">
                            {/* Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tab.color.bg}`}>
                              <span className={`material-symbols-outlined text-sm ${tab.color.text}`}>{tab.icon}</span>
                            </div>

                            {/* Tên — hoặc input khi đang sửa */}
                           {isEditing ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSave(item); if (e.key === 'Escape') setEditingItem(null); }}
                                autoFocus
                                className="flex-1 px-2 py-1 border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            ) : (
                            <span className="flex-1 text-sm font-medium text-on-surface">{tab.getName(item)}</span>
                            )}

                            {/* Nút hành động */}
                            <div className={`flex items-center gap-1 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSave(item)}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
                                  >
                                    {saving ? '...' : 'Lưu'}
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1.5 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition"
                                  >
                                    Hủy
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs text-on-surface-variant mr-2">#{id}</span>
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                                    title="Sửa"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(item)}
                                    disabled={deletingId === id}
                                    className="p-1.5 text-[#c62828] hover:bg-[#fce4ec] rounded-lg transition-colors disabled:opacity-50"
                                    title="Xóa"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      {deletingId === id ? 'hourglass_empty' : 'delete'}
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer count */}
                  {!loading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-outline-variant bg-surface-container text-xs text-on-surface-variant">
                      Hiển thị {filtered.length} / {currentList.length} {tab.plural}
                      {search && ` (đang lọc theo "${search}")`}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#fce4ec] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c62828] text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Xác nhận xóa</h3>
                <p className="text-sm text-on-surface-variant">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-sm text-on-surface mb-5">
              Bạn có chắc muốn xóa <span className="font-semibold">"{confirmDelete.name}"</span> khỏi danh sách {tab.plural}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 py-2.5 bg-[#c62828] text-white rounded-xl text-sm font-semibold hover:bg-[#b71c1c] transition disabled:opacity-50"
              >
                {deletingId ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCategoriesPage;
