import { useEffect, useState } from "react";
import { Mail, Lock, Shield, Save, X } from "lucide-react";
import api from "../../lib/axios";
import { toast } from "sonner";

export default function UserForm({ type, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    roles: "USER",
  });
  useEffect(() => {
  if (type === "update" && user) {
    setFormData({
      email: user.email,
      password: "",
      roles: user.roles[0] || "USER",
    });
  }
  }, [type, user]);
  const handleCreateUser = async (data) => {
    const res = await api.post("/users", data);
    if (res.status === 200) {
      toast.success("Tạo tài khoản thành công");
      onSuccess();
    } else {
      toast.error("Tạo tài khoản thất bại");
    }
  };

  const handleUpdateUser = async (data) => {
    const res = await api.put(`/users/${user.userId}`, data);
    if (res.status === 200) {
      toast.success("Cập nhật tài khoản thành công");
      onSuccess();
    } else {
      toast.error("Cập nhật tài khoản thất bại");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "create") {
      await handleCreateUser(formData);
    } else if (type === "update" && user) {
      await handleUpdateUser(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="vd: admin@gmail.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            required={type === 'create'}
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={type === 'create' ? "••••••••" : "Để trống nếu không đổi"}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Phân quyền (Roles)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="roles"
            value={formData.roles}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none cursor-pointer"
          >
            <option value="USER">Thành viên (USER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end space-x-3 border-t mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Hủy
        </button>

        <button
          type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Lưu
        </button>
      </div>
    </form>
  );
}