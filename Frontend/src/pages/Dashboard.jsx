import React from "react";
import { 
  Bell, 
  Leaf, 
  Droplets, 
  Thermometer, 
  Activity, 
  Calendar,
  ArrowUpRight,
  History,
  Wind
} from "lucide-react";

const StatCard = ({ title, value, unit, icon: Icon, color, trend }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#3A4D39]/10 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
         <span className="flex items-center text-xs font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-1 rounded-full">
           <ArrowUpRight className="w-3 h-3 mr-1" /> {trend}
         </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-xs font-bold text-[#739072] uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-black text-[#3A4D39]">{value}</h3>
          <span className="text-sm font-medium text-[#739072]">{unit}</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  
  // mock data
  const announcements = [
    {
      id: 1,
      title: "System Update v2.1 Available",
      date: "2026-01-20",
      type: "update",
      content: "New firmware update for ESP32 modules improves connection stability."
    },
    {
      id: 2,
      title: "Scheduled Maintenance",
      date: "2026-01-22",
      type: "alert",
      content: "The system will be offline for 30 minutes on Jan 22 for database optimization."
    }
  ];

  // mock data trash logs
  const trashLogs = [
    {
      log_id: "a1b2-c3d4",
      nitrogen: "120 mg/kg",
      phosphorus: "45 mg/kg",
      potassium: "200 mg/kg",
      moisture: "65%",
      humidity: "55%",
      temperature: "30°C",
      ph: "6.8",
      date_created: "2026-01-20 10:30 AM"
    },
    {
      log_id: "e5f6-g7h8",
      nitrogen: "118 mg/kg",
      phosphorus: "42 mg/kg",
      potassium: "195 mg/kg",
      moisture: "62%",
      humidity: "54%",
      temperature: "31°C",
      ph: "6.7",
      date_created: "2026-01-20 09:15 AM"
    },
    {
      log_id: "i9j0-k1l2",
      nitrogen: "125 mg/kg",
      phosphorus: "50 mg/kg",
      potassium: "210 mg/kg",
      moisture: "70%",
      humidity: "60%",
      temperature: "29°C",
      ph: "7.0",
      date_created: "2026-01-19 04:45 PM"
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-400 mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              Dashboard
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Overview of compost status and recent activities.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#739072] uppercase tracking-wide">Current Date</p>
            <p className="text-lg font-bold text-[#3A4D39]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* announcements */}
            <div className="lg:col-span-4 bg-[#3A4D39] text-[#ECE3CE] rounded-3xl p-6 shadow-xl shadow-[#3A4D39]/10 flex flex-col h-full min-h-75">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Bell className="w-5 h-5 text-[#ECE3CE]" />
                    </div>
                    <h2 className="text-lg font-bold">Announcements</h2>
                </div>
                
                <div className="flex-1 space-y-4">
                    {announcements.map((item) => (
                        <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-0.5 bg-[#4F6F52] text-[10px] font-bold uppercase rounded-md tracking-wide">
                                    {item.type}
                                </span>
                                <span className="text-xs opacity-70 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {item.date}
                                </span>
                            </div>
                            <h3 className="font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-sm opacity-80 leading-relaxed">{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* npk and environment */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* NPK section */}
                <StatCard 
                    title="Nitrogen (N)" 
                    value="120" 
                    unit="mg/kg" 
                    icon={Leaf} 
                    color="bg-green-100 text-green-700"
                    trend="Optimal"
                />
                <StatCard 
                    title="Phosphorus (P)" 
                    value="45" 
                    unit="mg/kg" 
                    icon={Leaf} 
                    color="bg-teal-100 text-teal-700" 
                />
                <StatCard 
                    title="Potassium (K)" 
                    value="200" 
                    unit="mg/kg" 
                    icon={Leaf} 
                    color="bg-orange-100 text-orange-700" 
                />
                
                {/* environmental section */}
                <StatCard 
                    title="Moisture" 
                    value="65" 
                    unit="%" 
                    icon={Droplets} 
                    color="bg-blue-100 text-blue-700" 
                />
                <StatCard 
                    title="Temperature" 
                    value="30" 
                    unit="°C" 
                    icon={Thermometer} 
                    color="bg-red-100 text-red-700" 
                />
                 <StatCard 
                    title="Humidity" 
                    value="55" 
                    unit="%" 
                    icon={Wind} 
                    color="bg-cyan-100 text-cyan-700" 
                />
            </div>
        </div>

        {/* trash logs */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                        <History className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-[#3A4D39]">Recent Trash Logs</h2>
                </div>
                <button className="text-xs font-bold text-[#4F6F52] hover:text-[#3A4D39] hover:underline">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#ECE3CE]">
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider w-45">Date Created</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Nitrogen</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Phosphorus</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Potassium</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Moisture</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Humidity</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Temp</th>
                            <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">pH</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE3CE]">
                        {trashLogs.map((log) => (
                            <tr key={log.log_id} className="hover:bg-[#ECE3CE]/10 transition-colors">
                                <td className="p-4 text-sm font-bold text-[#3A4D39] whitespace-nowrap">
                                    {log.date_created}
                                </td>
                                <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.nitrogen}</td>
                                <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.phosphorus}</td>
                                <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.potassium}</td>
                                <td className="p-4 text-sm font-mono font-medium text-blue-600">{log.moisture}</td>
                                <td className="p-4 text-sm font-mono text-[#4F6F52]">{log.humidity}</td>
                                <td className="p-4 text-sm font-mono text-orange-600 font-medium">{log.temperature}</td>
                                <td className="p-4">
                                    <span className="inline-block px-2 py-1 rounded bg-[#3A4D39]/10 text-[#3A4D39] text-xs font-bold">
                                        {log.ph}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </section>
    </div>
  );
}