import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import Maharashtralogo from '../assets/mahadbtlogo.jpeg';

function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'district_magistrate', label: 'District Magistrate' },
    { value: 'department_head', label: 'Department Head' },
    { value: 'department_officer', label: 'Department Officer' },
    { value: 'block_level_officer', label: 'Block Level Officer' },
    { value: 'gram_panchayat_officer', label: 'Gram Panchayat Officer' },
    { value: 'admin', label: 'Admin' },
  ];

  const levels = [
    { value: 'TOP', label: 'Top' },
    { value: 'MID', label: 'Mid' },
    { value: 'OPERATIONAL', label: 'Operational' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!email || !password || !name || !role || !level) {
      setError('All fields are required.');
      return;
    }

    try {
      // Step 1: Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Step 2: Insert into Authority table
      const { error: insertError } = await supabase.from('Authority').insert({
        email,
        name,
        role: role.toUpperCase(), // Match schema enum case
        level,
        jurisdiction: jurisdiction || null,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setSuccess('Signup successful! Please check your email for verification.');
      if (onSignupSuccess) onSignupSuccess();
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f3f4f8] to-[#e5e7eb]">
      <div className="px-8 py-6 bg-[#f8f9fc] shadow-xl rounded-lg w-[450px] border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={Maharashtralogo} alt="MH Government Logo" className="h-32 w-auto object-contain" />
          </div>
          <h4 className="text-xl text-gray-700 mt-1">JanMitra-AI Portal Signup</h4>
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-[#FF9933] rounded-full opacity-70"></div>
            <div className="h-1 w-12 bg-[#000080] rounded-full opacity-70"></div>
            <div className="h-1 w-12 bg-[#138808] rounded-full opacity-70"></div>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Role</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {roles.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Level</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="">Select Level</option>
                {levels.map((levelOption) => (
                  <option key={levelOption.value} value={levelOption.value}>
                    {levelOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Jurisdiction (Optional)</label>
              <input
                type="text"
                placeholder="Enter jurisdiction"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition duration-150"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white rounded-md hover:opacity-90 transition duration-150 font-medium text-lg shadow-md"
            >
              Sign Up
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>
              Already have an account?{' '}
              <a href="/" className="text-[#FF9933] hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;