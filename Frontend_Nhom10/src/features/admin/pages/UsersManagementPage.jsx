import { useState } from 'react';
import UserTable from '../components/UserTable';
import Pagination from '../components/Pagination';
import DialogForm from '../components/DialogForm';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (userId) => {
    // TODO: Implement delete logic
    console.log('Delete user:', userId);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    // TODO: Refresh user list
    handleDialogClose();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
        <Pagination />
      </div>

      {isDialogOpen && (
        <DialogForm
          type={editingUser ? 'edit' : 'add'}
          user={editingUser}
          onClose={handleDialogClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
