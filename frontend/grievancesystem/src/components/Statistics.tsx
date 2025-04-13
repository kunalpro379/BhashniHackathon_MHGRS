import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { translations } from '../translations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface StatisticsProps {
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
}

const Statistics: React.FC<StatisticsProps> = ({ language, theme }) => {
  const t = translations[language];

  const barData = {
    labels: ['Sanitation', 'Healthcare', 'Water Supply', 'Electricity', 'Roads'],
    datasets: [
      {
        label: 'Grievances',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: ['Resolved', 'Unresolved'],
    datasets: [
      {
        data: [300, 50],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <div className={`bg-white text-black p-6 rounded-lg shadow-md`}>
        <h3 className="text-lg font-semibold mb-4">{t.totalGrievances}</h3>
        <Bar data={barData} />
      </div>
      <div className={`bg-white text-black p-6 rounded-lg shadow-md`}>
        <h3 className="text-lg font-semibold mb-4">{t.resolvedGrievances}</h3>
        <Pie data={pieData} />
      </div>
    </div>
  );
};

export default Statistics;
