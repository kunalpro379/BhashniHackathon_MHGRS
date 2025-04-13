import React, { useState } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, Search, Filter, TrendingUp, Calendar, User, Building2 } from 'lucide-react';
import { translations } from '../translations';
import { dummyGrievances } from '../data/dummyData';
import GrievanceDetails from './GrievanceDetails';
import type { Grievance } from '../types/grievance';

interface GrievanceListProps {
  language: 'en' | 'hi';
}

const GrievanceList: React.FC<GrievanceListProps> = ({ language }) => {
  const t = translations[language];
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredGrievances = dummyGrievances.filter(grievance => {
    const matchesSearch = grievance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grievance.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grievance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'InProgress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'UnderReview':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      InProgress: { color: 'bg-blue-100 text-blue-800', icon: <TrendingUp className="w-4 h-4" /> },
      Resolved: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      Escalated: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const renderGrievanceCard = (grievance: any) => (
    <div className="bg-white text-black rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {grievance.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">ID: {grievance.id}</p>
          </div>
          {renderStatusBadge(grievance.status)}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{grievance.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{grievance.location.district}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{new Date(grievance.submissionDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
            <span>{grievance.department}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span>{grievance.assignedTo?.name || 'Unassigned'}</span>
          </div>
        </div>

        {grievance.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {grievance.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setSelectedGrievance(grievance)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </button>
          {grievance.priority && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              grievance.priority === 'high' ? 'bg-red-100 text-red-800' :
              grievance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {grievance.priority.charAt(0).toUpperCase() + grievance.priority.slice(1)} Priority
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Bar */}
      <div className="bg-white text-black p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search grievances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrievances.map((grievance) => renderGrievanceCard(grievance))}
      </div>

      {/* Empty State */}
      {filteredGrievances.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grievances found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

export default GrievanceList;