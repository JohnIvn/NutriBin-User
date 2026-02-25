import { useEffect, useState } from "react";
import Requests from "@/utils/Requests";
import {
  RefreshCw,
  FlaskConical,
  Sprout,
  Calculator,
  Info,
  TrendingUp,
  Microscope,
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
            <span className="text-xs font-black text-[#3A4D39] uppercase tracking-wider hidden sm:block">
              Unit Selector
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 min-w-0 py-2">
            <button
              onClick={() => setSelectedMachine(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 shrink-0 ${
                selectedMachine === null
                  ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-lg shadow-[#4F6F52]/20 scale-105"
                  : "bg-white border-[#ECE3CE] text-[#739072] hover:border-[#4F6F52]/30 hover:bg-[#4F6F52]/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Overview</span>
              </div>
            </button>

            {machines.map((machine) => (
              <button
                key={machine.machine_id}
                onClick={() => setSelectedMachine(machine.machine_id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 shrink-0 ${
                  selectedMachine === machine.machine_id
                    ? "bg-[#4F6F52] border-[#4F6F52] text-white shadow-lg shadow-[#4F6F52]/20 scale-105"
                    : "bg-white border-[#ECE3CE] text-[#739072] hover:border-[#4F6F52]/30 hover:bg-[#4F6F52]/5"
                }`}
              >
                UNIT {machine.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-8 py-8 sm:py-12 space-y-8 max-w-7xl mx-auto">
        {/* Network Overview Summary */}
        {!selectedMachine && data?.summary && (
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] border-none text-white shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Cpu className="w-20 h-20" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                  Monitored Units
                </p>
                <h3 className="text-5xl font-black mb-2">
                  {data.summary.total_machines}
                </h3>
                <p className="text-white/50 text-xs">
                  Active hardware units in network
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#3A4D39]/10 shadow-xl overflow-hidden relative group hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <p className="text-[#739072] text-xs font-bold uppercase tracking-widest mb-2">
                  Total Data Points
                </p>
                <h3 className="text-5xl font-black text-[#4F6F52] mb-2">
                  {data.summary.total_readings.toLocaleString()}
                </h3>
                <p className="text-[#739072] text-xs">
                  Aggregated chemical samples
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#3A4D39]/10 shadow-xl overflow-hidden relative group hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <p className="text-[#739072] text-xs font-bold uppercase tracking-widest mb-2">
                  System Health
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-5xl font-black text-[#4F6F52]">100</h3>
                  <span className="text-2xl font-bold text-[#739072]">%</span>
                </div>
                <p className="text-[#739072] text-xs">
                  All sensors reporting correctly
                </p>
              </CardContent>
            </Card>
          </Motion.div>
        )}

        {/* Header Section */}
        <Motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    {selectedMachine
                      ? `Unit ${selectedMachine.toUpperCase()}`
                      : "Laboratory Analysis"}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Analytics <span className="text-[#739072]">Insights</span>
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Advanced computational analysis of fertilizer chemical profiles
                with automated soil-to-crop suitability matching using the{" "}
                <span className="text-[#4F6F52] font-bold">CSI Algorithm</span>.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => fetchData(selectedMachine)}
              disabled={isRefreshing}
              className="bg-[#4F6F52] text-white hover:bg-[#3A4D39] active:scale-95 transition-all duration-200 shadow-lg shadow-[#4F6F52]/20 px-8 h-12 rounded-2xl font-bold border-none disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>
                {selectedMachine ? "Sync Unit Data" : "Update Analytics"}
              </span>
            </Button>
          </div>
        </Motion.header>

        {/* Analytics Dashboard Grid */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Composition Summary */}
          <Card className="lg:col-span-4 border-none shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" />
                    Soil Composition
                  </CardTitle>
                  <CardDescription className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Real-time chemical metrics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    label: "Nitrogen (N)",
                    val: data?.current_readings?.n,
                    color: "bg-[#4F6F52]",
                    unit: "ppm",
                  },
                  {
                    label: "Phosphorus (P)",
                    val: data?.current_readings?.p,
                    color: "bg-[#5C8D89]",
                    unit: "ppm",
                  },
                  {
                    label: "Potassium (K)",
                    val: data?.current_readings?.k,
                    color: "bg-[#D4A373]",
                    unit: "ppm",
                  },
                ].map((item, idx) => (
                  <Motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-[#739072] uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-xl font-black text-[#3A4D39] tabular-nums">
                        {item.val?.toFixed(2)}{" "}
                        <span className="text-xs text-[#739072] font-medium ml-0.5">
                          {item.unit}
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#ECE3CE] rounded-full overflow-hidden">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((item.val / 200) * 100, 100)}%`,
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "circOut",
                          delay: 0.5 + idx * 0.1,
                        }}
                        className={`h-full ${item.color} shadow-sm`}
                      />
                    </div>
                  </Motion.div>
                ))}

                <div className="pt-6 border-t-2 border-dashed border-[#ECE3CE]">
                  <div className="flex justify-between items-center bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 p-4 rounded-xl border-2 border-[#3A4D39]/10">
                    <span className="text-xs font-bold text-[#739072] uppercase tracking-wider">
                      Soil Acidity (pH)
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#4F6F52]" />
                      <span className="text-3xl font-black text-[#4F6F52] leading-none">
                        {data?.current_readings?.ph?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Logic */}
          <Card className="lg:col-span-8 border-none shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="h-full p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#4F6F52]/10 to-[#3A4D39]/10 rounded-xl">
                  <Calculator className="w-6 h-6 text-[#4F6F52]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#3A4D39] uppercase tracking-tight">
                    Suitability Algorithm (CSI)
                  </CardTitle>
                  <p className="text-xs text-[#739072] font-medium">
                    Euclidean Spatial Analysis in NPK Dimensions
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#FAF9F6] to-[#ECE3CE]/50 rounded-2xl p-8 mb-6 border-2 border-dashed border-[#3A4D39]/10">
                <code className="text-[#4F6F52] text-xl sm:text-2xl md:text-3xl font-black tracking-tighter select-all text-center block leading-loose break-all">
                  {data?.formula}
                </code>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-white text-xs uppercase font-bold text-[#739072] border-[#ECE3CE] px-3 py-1"
                  >
                    Δ = variance
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white text-xs uppercase font-bold text-[#739072] border-[#ECE3CE] px-3 py-1"
                  >
                    sqrt = Euclidean vector
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white text-xs uppercase font-bold text-[#739072] border-[#ECE3CE] px-3 py-1"
                  >
                    max(0,100) = index floor/ceiling
                  </Badge>
                </div>
              </div>

              <div className="bg-[#4F6F52]/5 p-5 rounded-xl border-l-4 border-[#4F6F52]">
                <div className="flex gap-4 items-start">
                  <Info className="w-5 h-5 text-[#4F6F52] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-black text-[#4F6F52] uppercase tracking-widest">
                      Logic & Validation
                    </span>
                    <p className="text-sm text-[#3A4D39] leading-relaxed font-medium">
                      {data?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Motion.section>

        {/* Recommendations Section */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 border-[#3A4D39]/10">
                <Sprout className="w-7 h-7 text-[#4F6F52]" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#3A4D39] tracking-tight">
                  Targeted Crops
                </h2>
                <p className="text-sm text-[#739072] font-medium">
                  Optimized matches for current chemical profile
                </p>
              </div>
            </div>
            <Badge className="bg-[#4F6F52] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[#4F6F52]/20 text-xs tracking-wide border-none">
              <Award className="w-4 h-4 mr-2" />
              Optimal Detection: Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <AnimatePresence mode="wait">
              {data?.recommendations?.length > 0 ? (
                data?.recommendations?.map((crop, idx) => (
                  <Motion.div
                    key={`${selectedMachine}-${crop.name}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Card
                      className={`h-full border-none shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl relative group transition-all duration-300 hover:shadow-2xl ${
                        idx === 0 ? "ring-2 ring-[#4F6F52]" : ""
                      }`}
                    >
                      {idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-[#4F6F52] text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg z-10 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Best Match
                        </div>
                      )}

                      <CardHeader className="p-6 pb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#ECE3CE]/60 to-[#4F6F52]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Leaf
                            className={`w-7 h-7 ${
                              idx === 0 ? "text-[#4F6F52]" : "text-[#739072]"
                            }`}
                          />
                        </div>
                        <CardTitle className="text-xl font-bold text-[#3A4D39]">
                          {crop.name}
                        </CardTitle>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-4xl font-black text-[#4F6F52]">
                            {crop.score}
                          </span>
                          <span className="text-xs font-bold text-[#4F6F52]/50 uppercase tracking-tight">
                            CSI
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 pt-0 space-y-3">
                        <div className="space-y-2.5 pt-4 border-t border-[#ECE3CE]">
                          <div className="flex justify-between items-center bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/30 p-3 rounded-lg border border-[#3A4D39]/10">
                            <span className="text-[10px] font-bold text-[#739072] uppercase">
                              Ideal NPK
                            </span>
                            <span className="font-mono text-xs text-[#4F6F52] font-black">
                              {crop.ideal_npk}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/30 p-3 rounded-lg border border-[#3A4D39]/10">
                            <span className="text-[10px] font-bold text-[#739072] uppercase">
                              pH range
                            </span>
                            <span className="font-mono text-xs text-[#4F6F52] font-black">
                              {crop.ph_range}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-[#ECE3CE] h-2.5 rounded-full overflow-hidden">
                          <Motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${crop.score}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                            className={`h-full ${
                              crop.score > 80
                                ? "bg-[#4F6F52]"
                                : crop.score > 60
                                  ? "bg-[#D4A373]"
                                  : "bg-[#739072]"
                            }`}
                          ></Motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-[#3A4D39]/20 shadow-sm">
                  <div className="p-6 bg-[#ECE3CE]/40 rounded-2xl w-fit mx-auto mb-4">
                    <FlaskConical className="w-12 h-12 text-[#739072]/40" />
                  </div>
                  <p className="text-[#739072] font-medium px-4 max-w-md mx-auto">
                    No analytical data available for this unit. System awaiting
                    fertilizer readings.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Motion.section>

        {/* Historical Logs Section */}
        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6 pb-12"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 border-[#3A4D39]/10">
              <History className="w-6 h-6 text-[#4F6F52]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#3A4D39] tracking-tight">
                Recommendation History
              </h2>
              <p className="text-xs text-[#739072] font-medium">
                Archived CSI processing results for this unit
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
                    <th className="px-6 py-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                      NPK Profile
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                      Primary Match (Score)
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                      Other Recommendations
                    </th>
                    <th className="px-6 py-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE3CE]/50">
                  {history.length > 0 ? (
                    history.map((log, idx) => (
                      <Motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                        className="hover:bg-[#FAF9F6] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-[#3A4D39]">
                            {new Date(log.date_created).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Badge className="text-[10px] border-[#4F6F52]/20 text-[#4F6F52] bg-[#4F6F52]/10 font-bold">
                              N: {parseFloat(log.n).toFixed(0)}
                            </Badge>
                            <Badge className="text-[10px] border-[#5C8D89]/20 text-[#5C8D89] bg-[#5C8D89]/10 font-bold">
                              P: {parseFloat(log.p).toFixed(0)}
                            </Badge>
                            <Badge className="text-[10px] border-[#D4A373]/20 text-[#D4A373] bg-[#D4A373]/10 font-bold">
                              K: {parseFloat(log.k).toFixed(0)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#3A4D39]">
                              {log.recommended_plants_1}
                            </span>
                            <span className="text-xs font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-1 rounded-lg">
                              {log.csi_score_1}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {[
                              log.recommended_plants_2,
                              log.recommended_plants_3,
                              log.recommended_plants_4,
                              log.recommended_plants_5,
                            ]
                              .filter(Boolean)
                              .map((plant, pIdx) => (
                                <div
                                  key={pIdx}
                                  title={plant}
                                  className="w-9 h-9 rounded-full bg-white border-2 border-[#ECE3CE] flex items-center justify-center text-xs font-bold text-[#739072] shadow-sm hover:z-10 hover:scale-110 transition-transform"
                                >
                                  {plant.substring(0, 1)}
                                </div>
                              ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[#4F6F52]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-tight">
                              Processed
                            </span>
                          </div>
                        </td>
                      </Motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="p-6 bg-[#ECE3CE]/40 rounded-2xl w-fit mx-auto mb-4">
                          <History className="w-10 h-10 text-[#739072]/40" />
                        </div>
                        <p className="text-[#739072] text-sm font-medium">
                          No historical archives found for this selection.
                        </p>
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
