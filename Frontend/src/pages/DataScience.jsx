import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import {
  RefreshCw,
  FlaskConical,
  Sprout,
  Calculator,
  TrendingUp,
  Leaf,
  Cpu,
  History,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { useUser } from "@/contexts/UserContextHook";

function DataScience() {
  const [data, setData] = useState(null);
  const { user } = useUser();
  const customerId = user?.customer_id;
  const [history, setHistory] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMachines = async () => {
    try {
      const res = await Requests({
        url: `/data-science/machines/${customerId}`,
      });
      if (res?.data?.ok) {
        console.log(res.data);
        setMachines(res.data.machines);
      }
    } catch (err) {
      console.error("Failed to fetch machines", err);
    }
  };

  const fetchData = async (machineId) => {
    try {
      setIsRefreshing(true);
      const url = machineId
        ? `/data-science/analytics?machine_id=${machineId}`
        : "/data-science/analytics";
      const res = await Requests({ url });
      setData(res?.data || null);

      // Fetch history
      const historyUrl = machineId
        ? `/data-science/history?machine_id=${machineId}`
        : "/data-science/history";
      const historyRes = await Requests({ url: historyUrl });
      if (historyRes?.data?.ok) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch analytics metrics", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    fetchData(selectedMachine);
  }, [selectedMachine]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6]">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-[#4F6F52]" />
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] min-h-screen">
      {/* Machine Selection Top Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#3A4D39]/10 sticky top-0 z-20 w-full shadow-sm">
        <div className="flex items-center gap-4 w-full h-16 md:h-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 shrink-0 pr-6 border-r border-[#ECE3CE]">
            <div className="p-2 bg-[#4F6F52]/10 rounded-xl">
              <Cpu className="w-5 h-5 text-[#4F6F52]" />
            </div>
            <span className="text-sm font-bold text-[#3A4D39] hidden sm:block">
              Select Unit
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 min-w-0 py-2">
            <button
              onClick={() => setSelectedMachine(null)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 shrink-0 ${
                selectedMachine === null
                  ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-lg"
                  : "bg-white border-[#ECE3CE] text-[#739072] hover:border-[#4F6F52]/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>All Units</span>
              </div>
            </button>

            {machines.map((machine) => (
              <button
                key={machine.machine_id}
                onClick={() => setSelectedMachine(machine.machine_id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 shrink-0 ${
                  selectedMachine === machine.machine_id
                    ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-lg"
                    : "bg-white border-[#ECE3CE] text-[#739072] hover:border-[#4F6F52]/30"
                }`}
              >
                Unit {machine.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-8 py-8 sm:py-12 space-y-10 max-w-7xl mx-auto">
        {/* Header Section - Simplified */}
        <Motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#3A4D39] mb-3">
                Soil Analysis Dashboard
              </h1>
              <p className="text-[#739072] text-lg">
                Fertilizer recommendations based on soil composition
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => fetchData(selectedMachine)}
              disabled={isRefreshing}
              className="bg-[#4F6F52] text-white hover:bg-[#3A4D39] transition-all duration-200 shadow-lg px-8 h-12 rounded-xl font-semibold"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh Data</span>
            </Button>
          </div>
        </Motion.header>

        {/* Current Soil Readings - Simplified */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-[#3A4D39] mb-6 flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-[#4F6F52]" />
            Current Soil Composition
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: "Nitrogen",
                val: data?.current_readings?.n,
                color: "bg-[#4F6F52]",
                unit: "ppm",
              },
              {
                label: "Phosphorus",
                val: data?.current_readings?.p,
                color: "bg-[#5C8D89]",
                unit: "ppm",
              },
              {
                label: "Potassium",
                val: data?.current_readings?.k,
                color: "bg-[#D4A373]",
                unit: "ppm",
              },
              {
                label: "pH Level",
                val: data?.current_readings?.ph,
                color: "bg-[#4F6F52]",
                unit: "",
              },
            ].map((item, idx) => (
              <Motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              >
                <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden h-full">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-[#739072] mb-2">
                      {item.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#3A4D39]">
                        {item.val?.toFixed(1)}
                      </span>
                      {item.unit && (
                        <span className="text-lg text-[#739072]">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </div>
        </Motion.section>

        {/* Recommended Crops - Simplified to show only top 3 */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-[#3A4D39] flex items-center gap-3">
            <Sprout className="w-6 h-6 text-[#4F6F52]" />
            Recommended Crops
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {data?.recommendations?.length > 0 ? (
                data?.recommendations?.slice(0, 3).map((crop, idx) => (
                  <Motion.div
                    key={`${selectedMachine}-${crop.name}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                  >
                    <Card
                      className={`h-full border-none shadow-lg bg-white rounded-2xl overflow-hidden ${
                        idx === 0 ? "ring-2 ring-[#4F6F52]" : ""
                      }`}
                    >
                      {idx === 0 && (
                        <div className="bg-[#4F6F52] text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
                          <Award className="w-4 h-4" />
                          Best Match
                        </div>
                      )}

                      <CardHeader className="p-6">
                        <div className="w-16 h-16 bg-[#4F6F52]/10 rounded-xl flex items-center justify-center mb-4">
                          <Leaf className="w-8 h-8 text-[#4F6F52]" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-[#3A4D39] mb-2">
                          {crop.name}
                        </CardTitle>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-[#4F6F52]">
                            {crop.score}
                          </span>
                          <span className="text-lg text-[#739072]">
                            % Match
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 pt-0 space-y-3">
                        <div className="bg-[#FAF9F6] p-4 rounded-xl space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#739072]">
                              Ideal NPK
                            </span>
                            <span className="text-sm font-bold text-[#3A4D39]">
                              {crop.ideal_npk}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#739072]">
                              pH Range
                            </span>
                            <span className="text-sm font-bold text-[#3A4D39]">
                              {crop.ph_range}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-[#3A4D39]/20">
                  <FlaskConical className="w-12 h-12 text-[#739072]/40 mx-auto mb-4" />
                  <p className="text-[#739072]">
                    No data available. Please refresh.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Motion.section>

        {/* History - Simplified to show only last 5 entries */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6 pb-12"
        >
          <h2 className="text-2xl font-bold text-[#3A4D39] flex items-center gap-3">
            <History className="w-6 h-6 text-[#4F6F52]" />
            Recent History
          </h2>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#ECE3CE]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#739072]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#739072]">
                      NPK Values
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#739072]">
                      Top Recommendation
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#739072]">
                      Match Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE3CE]">
                  {history.length > 0 ? (
                    history.slice(0, 5).map((log, idx) => (
                      <Motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="hover:bg-[#FAF9F6] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#3A4D39]">
                          {new Date(log.date_created).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 text-sm">
                            <span className="text-[#4F6F52] font-semibold">
                              N: {parseFloat(log.n).toFixed(0)}
                            </span>
                            <span className="text-[#5C8D89] font-semibold">
                              P: {parseFloat(log.p).toFixed(0)}
                            </span>
                            <span className="text-[#D4A373] font-semibold">
                              K: {parseFloat(log.k).toFixed(0)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#3A4D39]">
                          {log.recommended_plants_1}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-[#4F6F52]/10 text-[#4F6F52] border-none font-semibold">
                            {log.csi_score_1}%
                          </Badge>
                        </td>
                      </Motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <History className="w-10 h-10 text-[#739072]/40 mx-auto mb-3" />
                        <p className="text-[#739072]">No history available</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Motion.section>
      </main>
    </div>
  );
}

export default DataScience;
