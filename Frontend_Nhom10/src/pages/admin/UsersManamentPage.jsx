import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import api from '../../lib/axios';
import UserTable from '../../components/users/UserTable';
import Dialog from '../../components/ui/Dialog';
import DialogForm from '../../components/users/DialogForm';
import { Toaster, toast } from 'sonner';

export default function UsersManagementPage() {
    const [users, setUsers] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.result || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenCreateForm = () => {
        setFormMode('create');
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleOpenUpdateForm = (user) => {
        setFormMode('update');
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedUser(null);
    };
    
    const handleFormSuccess = () => {
        handleCloseForm();
        fetchUsers(); 
    };

    const handleDeleteUser = async (userId) => {
        try {
          const res = await api.delete(`/users/${userId}`);
          if(res.status === 200){
            toast.success("Xóa tài khoản thành công");
            fetchUsers(); 
          }else{
            toast.error("Xóa tài khoản thất bại");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("An error occurred while deleting the user.");
        }
    };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="w-full min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl mb-2 text-gray-900">User Management</h1>
                <p className="text-gray-600 text-sm">Manage team members, roles, and permissions across your organization</p>
              </div>             
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>       
                <button 
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                  onClick={handleOpenCreateForm}
                >
                    <Plus className="w-4.5 h-4.5" />
                    Add User
                </button>
              </div>
            </div>
            <div className="mt-4">
              <UserTable users={users} onEdit={handleOpenUpdateForm} onDelete={handleDeleteUser} />
            </div>
        </div>
      </div>
      <Dialog 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
        title={formMode === 'create' ? 'Create New User' : 'Update User'}
      >
        <DialogForm 
            type={formMode}
            user={selectedUser}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
        />
      </Dialog>
    </>
  );
}