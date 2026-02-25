import React, { useEffect, useState } from "react";
import ModuleCard from "@/components/ui/ModuleCard";
import { toast } from "sonner";
import {
  RefreshCw,
  Cpu,
  Fan,
  Eye,
  Droplets,
  Wind,
  Activity,
  Flame,
  Cog,
  CheckCircle2,
  AlertTriangle,
  Server,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { motion as Motion } from "framer-motion";

export default function Modules() {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;
  const customerId = user?.customer_id;

  useEffect(() => {
    if (!machineId) return;

    console.log("Fetching modules for:", machineId);
    async function fetchModules() {
      try {
        const res = await Requests({
          url: `/module-analytics/${machineId}`,
        });
        const data = res.data;
        if (data.ok) {
          setModules(data.data.modules);
        }

        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, [machineId]);

  const requestRepair = async (moduleName) => {
    if (!machineId || !customerId) {
      toast.warning("Missing machine or user information");
      return;
    }
    if (!moduleName) {
      toast.warning("Please specify a module to repair");
      return;
    }

    try {
      const res = await Requests({
        method: "POST",
        url: "/module-analytics/repair",
        data: {
          machineId,
          customerId,
          module: moduleName,
        },
      });

      if (res.data?.ok) {
        toast.success(
          `Repair request for ${moduleName} submitted successfully`,
        );
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to request repair";
      toast.error(message);
    }
  };

  // Calculate module statistics
  const getModuleStats = () => {
    if (!modules) return { total: 0, online: 0, offline: 0 };

    const moduleValues = Object.values(modules);
    const total = moduleValues.length;
    const offline = moduleValues.filter(
      (val) => val === true || val === 1,
    ).length;
    const online = total - offline;

    return { total, online, offline };
  };

  const stats = getModuleStats();

  if (loading) {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                  <Server className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Hardware Diagnostics
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                System Modules
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl mb-3">
                Real-time hardware status and diagnostics monitoring.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">
                  Click any offline module to submit a repair request
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Status Badge */}
              <div className="px-5 py-3 bg-white border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5">
                <div className="flex items-center gap-2.5">
                  <Motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Activity className="w-6 h-6 text-[#4F6F52]" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </Motion.div>
                  <span className="font-bold text-[#3A4D39] text-sm sm:text-base">
                    Diagnostic Running
                  </span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-white border border-[#4F6F52]/20 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Online
                  </div>
                  <div className="text-lg font-black text-green-600">
                    {stats.online}
                  </div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white border border-red-200 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Offline
                  </div>
                  <div className="text-lg font-black text-red-600">
                    {stats.offline}
                  </div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white border border-[#3A4D39]/20 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Total
                  </div>
                  <div className="text-lg font-black text-[#3A4D39]">
                    {stats.total}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Main Grid */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Controllers Column */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#3A4D39]/10 to-[#4F6F52]/10 rounded-xl shadow-sm">
                  <Cpu className="w-5 h-5 text-[#3A4D39]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#3A4D39]">
                    Controllers
                  </h2>
                  <p className="text-xs text-[#739072] font-medium">
                    Processing Units
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                <span className="text-xs font-black text-[#739072]">
                  4 Units
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
              <ModuleCard
                title="Arduino Q"
                icon={Cpu}
                offline={modules?.arduino_q}
                subtext="Main Logic Unit"
                onClick={() => requestRepair("Repair need for Arduino Q")}
              />
              <ModuleCard
                title="ESP32 Filter"
                icon={Cpu}
                offline={modules?.esp32_filter}
                subtext="Filterings"
                onClick={() => requestRepair("Repair need for ESP32 Filter")}
              />
              <ModuleCard
                title="ESP32 Sensors"
                icon={Cpu}
                offline={modules?.esp32_sensors}
                subtext="Processing Unit"
                onClick={() => requestRepair("Repair need for ESP32 sensors")}
              />
              <ModuleCard
                title="ESP32 Servo"
                icon={Cpu}
                offline={modules?.esp32_servo}
                subtext="Ventilation Control"
                onClick={() => requestRepair("Repair need for ESP32 Servo")}
              />
            </div>
          </Motion.div>

          {/* Actuators Column */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm">
                  <Cog className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#3A4D39]">
                    Actuators
                  </h2>
                  <p className="text-xs text-[#739072] font-medium">
                    Mechanical Systems
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                <span className="text-xs font-black text-[#739072]">
                  5 Units
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
              <ModuleCard
                title="Servo A"
                icon={Cog}
                offline={modules?.servo_a}
                subtext="Gate Control"
                onClick={() => requestRepair("Repair need for Servo A")}
              />
              <ModuleCard
                title="Servo B"
                icon={Cog}
                offline={modules?.servo_b}
                subtext="Valve Control"
                onClick={() => requestRepair("Repair need for Servo B")}
              />
              <ModuleCard
                title="Servo Diverter"
                icon={Cog}
                offline={modules?.servo_mixer}
                subtext="Mixing of materials"
                onClick={() => requestRepair("Repair need for Servo Mixer")}
              />
              <ModuleCard
                title="Grinder Motor"
                icon={Cog}
                offline={modules?.grinder}
                subtext="High Torque Grinder"
                onClick={() => requestRepair("Repair need for Grinder")}
              />
              <ModuleCard
                title="Exhaust Fan"
                icon={Fan}
                offline={modules?.exhaust}
                subtext="Air Out"
                onClick={() => requestRepair("Repair need for Exhaust Fan")}
              />
            </div>
          </Motion.div>

          {/* Sensors Column */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#3A4D39]">Sensors</h2>
                  <p className="text-xs text-[#739072] font-medium">
                    Data Collection
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                <span className="text-xs font-black text-[#739072]">
                  11 Units
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
              <ModuleCard
                title="Camera"
                icon={Eye}
                offline={modules?.camera}
                subtext="Input Monitoring"
                onClick={() => requestRepair("Repair need for Camera")}
              />
              <ModuleCard
                title="Humidity Sensor"
                icon={Droplets}
                offline={modules?.humidity}
                subtext="DHT22"
                onClick={() => requestRepair("Repair need for Humidity Sensor")}
              />
              <ModuleCard
                title="Methane Sensor"
                icon={Wind}
                offline={modules?.methane}
                subtext="MQ-4 Gas Sensor"
                onClick={() => requestRepair("Repair need for Methane Sensor")}
              />
              <ModuleCard
                title="Carbon Monoxide"
                icon={AlertTriangle}
                offline={modules?.carbon_monoxide}
                subtext="MQ-7 CO Sensor"
                onClick={() =>
                  requestRepair("Repair need for Carbon Monoxide Sensor")
                }
              />
              <ModuleCard
                title="Air Quality"
                icon={Wind}
                offline={modules?.air_quality}
                subtext="MQ-135"
                onClick={() =>
                  requestRepair("Repair need for Air Quality Sensor")
                }
              />
              <ModuleCard
                title="Combustible Gas"
                icon={Flame}
                offline={modules?.combustible_gasses}
                subtext="MQ-2 Sensor"
                onClick={() =>
                  requestRepair("Repair need for Combustible Gassses Sensor")
                }
              />
              <ModuleCard
                title="NPK Sensor"
                icon={Activity}
                offline={modules?.npk}
                subtext="Soil Analysis"
                onClick={() => requestRepair("Repair need for NPK Sensor")}
              />
              <ModuleCard
                title="Moisture Sensor"
                icon={Droplets}
                offline={modules?.moisture}
                subtext="Capacitive Probe"
                onClick={() => requestRepair("Repair need for Moisture Sensor")}
              />
              <ModuleCard
                title="Reed Switch"
                icon={CheckCircle2}
                offline={modules?.reed}
                subtext="Door / Lid Detection"
                onClick={() =>
                  requestRepair("Repair need for Reed Switch Sensor")
                }
              />
              <ModuleCard
                title="Ultrasonic"
                icon={Activity}
                offline={modules?.ultrasonic}
                subtext="Distance Measurement"
                onClick={() =>
                  requestRepair("Repair need for Ultrasonic Sensor")
                }
              />
              <ModuleCard
                title="Weight Sensor"
                icon={Activity}
                offline={modules?.weight}
                subtext="Load Cell"
                onClick={() => requestRepair("Repair need for Weight Sensor")}
              />
            </div>
          </Motion.div>
        </Motion.div>
      </div>
    </div>
  );
}
