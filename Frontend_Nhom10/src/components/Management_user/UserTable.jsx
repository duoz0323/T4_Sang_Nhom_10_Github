import { Edit2, Trash2,ChevronDown } from "lucide-react";
import Pagination from "./Pagination";

export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3.5 text-left text-xs text-gray-600 uppercase tracking-wider bg-gray-50">
              Id
            </th>
            <th className="px-6 py-3.5 text-left text-xs text-gray-600 uppercase tracking-wider bg-gray-50">
              Email
            </th>
            <th className="px-6 py-3.5 text-left text-xs text-gray-600 uppercase tracking-wider bg-gray-50">
              Role
            </th>
            <th className="px-6 py-3.5 text-right text-xs text-gray-600 uppercase tracking-wider bg-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users &&
            users.map((user) => (
              <tr
                key={user.userId}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3.5">
                    <div>
                      <div className="text-sm text-gray-900">{user.userId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    {user.email}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border
                    ${
                      user.roles === "ADMIN"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : user.roles === "USER"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {user.roles}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user.userId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Pagination users={users}/>
    </div>
  );
}
