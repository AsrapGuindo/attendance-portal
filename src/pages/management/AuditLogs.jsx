import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, Filter, CalendarDays, X } from 'lucide-react'; // Added X for close button

const API_URL = "http://3.26.148.36/APIs/audit_logs.php";

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState({ old: null, new: null, action: '' });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else {
        setAuditLogs([]);
        setError(response.data.message || 'Unexpected response format.');
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (oldValues, newValues, actionType) => {
    try {
      // Parse JSON strings. If they are null or invalid, they will remain null.
      const parsedOld = oldValues ? JSON.parse(oldValues) : null;
      const parsedNew = newValues ? JSON.parse(newValues) : null;
      
      setSelectedLogDetails({ old: parsedOld, new: parsedNew, action: actionType });
      setShowDetailsModal(true);
    } catch (e) {
      console.error("Error parsing JSON for audit log details:", e);
      setSelectedLogDetails({ old: { error: "Invalid JSON" }, new: { error: "Invalid JSON" }, action: actionType });
      setShowDetailsModal(true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLogDetails({ old: null, new: null, action: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="ml-4 text-slate-600">Loading Audit Logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Missed Events Audit Logs</h1>
          <p className="text-slate-500 text-sm">Track all changes made to student missed events records.</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {auditLogs.length > 0 ? (
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Changed By</th>
                <th className="px-6 py-4">Changed At</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.AuditLogID} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.AuditLogID}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{log.RecordID || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.ActionType === 'INSERT' ? 'bg-green-100 text-green-800' :
                      log.ActionType === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      log.ActionType === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {log.ActionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{log.ChangedBy || 'System'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{log.ChangedAt}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleViewDetails(log.OldValues, log.NewValues, log.ActionType)}>
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-500">
            No audit logs found for Student Missed Events.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Audit Log Details - {selectedLogDetails.action}</h3>
              <button onClick={closeDetailsModal} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedLogDetails.old && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Old Values:</h4>
                  <pre className="bg-slate-50 p-4 rounded-md text-sm text-slate-800 overflow-x-auto">
                    {JSON.stringify(selectedLogDetails.old, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLogDetails.new && (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">New Values:</h4>
                  <pre className="bg-slate-50 p-4 rounded-md text-sm text-slate-800 overflow-x-auto">
                    {JSON.stringify(selectedLogDetails.new, null, 2)}
                  </pre>
                </div>
              )}
              {!selectedLogDetails.old && !selectedLogDetails.new && (
                <p className="text-slate-500 italic">No specific old or new values recorded for this action.</p>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 text-right">
              <button onClick={closeDetailsModal} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}