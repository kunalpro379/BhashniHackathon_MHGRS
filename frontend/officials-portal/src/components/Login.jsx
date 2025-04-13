import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Maharashtralogo from '../assets/mahadbtlogo.jpeg';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');

  const roles = [
    { value: 'district_magistrate', label: 'District Magistrate' },
    { value: 'department_head', label: 'Department Head' },
    { value: 'department_officer', label: 'Department Officer' },
    { value: 'block_level_officer', label: 'Block Level Officer' },
    { value: 'gram_panchayat_officer', label: 'Gram Panchayat Officer' },
  ];

  const departments = [
    'Revenue',
    'Police',
    'Health',
    'Education',
    'Agriculture',
    'Public Works',
    'Social Welfare',
    'Rural Development',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user data from Authority table using the authenticated email
      const { data: userData, error: fetchError } = await supabase
        .from('Authority')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !userData) throw fetchError || new Error('User not found in Authority table');

      // Map Supabase role to frontend role (adjust based on your schema)
      const mappedRole = userData.role.toLowerCase().replace(/_/g, '_'); // Adjust mapping as needed
      const loginDetails = {
        id: userData.id,
        email: userData.email,
        role: mappedRole,
        department: userData.departmentId ? departments.find((d) => d.toLowerCase() === userData.departmentId.toLowerCase()) : null,
        jurisdiction: userData.jurisdiction || 'Default Jurisdiction',
        name: userData.name,
      };

      // Print login details to console
      console.log('Login Details:', loginDetails);

      // Pass login details to App.jsx
      onLogin(mappedRole, loginDetails);

      // Redirect to dashboard (handled by App.jsx)
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f3f4f8] to-[#e5e7eb]">
      <div className="px-8 py-6 bg-[#f8f9fc] shadow-xl rounded-lg w-[450px] border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={Maharashtralogo} alt="MH Government Logo" className="h-32 w-auto object-contain" />
          </div>
          <h4 className="text-xl text-gray-700 mt-1">JanMitra-AI Portal Login</h4>
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-[#FF9933] rounded-full opacity-70"></div>
            <div className="h-1 w-12 bg-[#000080] rounded-full opacity-70"></div>
            <div className="h-1 w-12 bg-[#138808] rounded-full opacity-70"></div>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">आपकी भूमिका (Your Role)</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {(role === 'department_head' || role === 'department_officer') && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">विभाग (Department)</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">उपयोगकर्ता नाम (Username)</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">पासवर्ड (Password)</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={()=>handleSubmit()}
              className="w-full py-3 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white rounded-md hover:opacity-90 transition duration-150 font-medium text-lg shadow-md"
            >
              प्रवेश करें (Login)
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            <a href="#" className="hover:text-[#FF9933]">
              Forgot Password?
            </a>
            <div className="mt-2">Need Help? Contact Support</div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;