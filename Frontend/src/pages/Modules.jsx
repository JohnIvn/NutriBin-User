import React, { useEffect, useState } from "react";
import ModuleCard from "@/components/ui/ModuleCard";
import {
  Cpu,
  Fan,
  Eye,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Zap,
  Cog,
  Wifi,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";

export default function Modules() {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;

  console.log("machine_id snapshot:", selectedMachine?.machine_id);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, [machineId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#3A4D39] font-bold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-400 mx-auto px-6 pt-8 space-y-8">
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              System Modules
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Real-time hardware status and diagnostics.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4F6F52] animate-pulse" />
              <span className="font-bold text-[#3A4D39] text-sm">
                System Diagnostic Running
              </span>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* micro-controllers */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#3A4D39]">Controllers</h2>
              <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                5 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard
                title="Arduino Q"
                icon={Cpu}
                offline={!modules?.arduino_q}
                subtext="Main Logic Unit"
              />
              <ModuleCard
                title="ESP32 Filter"
                icon={Cpu}
                offline={!modules?.esp32_filter}
                subtext="Filterings"
              />
              <ModuleCard
                title="ESP32 Grinder"
                icon={Cpu}
                offline={!modules?.esp32_grinder}
                subtext="Processing Unit"
              />
              <ModuleCard
                title="ESP32 Exhaust"
                icon={Cpu}
                offline={!modules?.esp32_exhaust}
                subtext="Ventilation Control"
              />
            </div>
          </div>

          {/* motors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-700">
                <Cog className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#3A4D39]">Actuators</h2>
              <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                7 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard
                title="Servo A"
                icon={Cog}
                offline={!modules?.servo_a}
                subtext="Gate Control"
              />
              <ModuleCard
                title="Servo B"
                icon={Cog}
                offline={!modules?.servo_b}
                subtext="Valve Control"
              />
              <ModuleCard
                title="Servo Diverter"
                icon={Cog}
                offline={!modules?.servo_diverter}
                subtext="Material Routing"
              />
              <ModuleCard
                title="Grinder Motor"
                icon={Cog}
                offline={!modules?.grinder}
                subtext="High Torque Grinder"
              />
              <ModuleCard
                title="Mixer Motor"
                icon={Cog}
                offline={!modules?.mixer}
                subtext="Mixing System"
              />
              <ModuleCard
                title="Exhaust Fan (In)"
                icon={Fan}
                offline={!modules?.exhaust_fan_in}
                subtext="Air Intake"
              />
              <ModuleCard
                title="Exhaust Fan (Out)"
                icon={Fan}
                offline={!modules?.exhaust_fan_out}
                subtext="Air Exhaust"
              />
            </div>
          </div>

          {/* sensors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#3A4D39]">Sensors</h2>
              <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                9 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard
                title="Camera 1"
                icon={Eye}
                offline={!modules?.camera_1}
                subtext="Input Monitoring"
              />
              <ModuleCard
                title="Camera 2"
                icon={Eye}
                offline={!modules?.camera_2}
                subtext="Processing View"
              />
              <ModuleCard
                title="Humidity Sensor"
                icon={Droplets}
                offline={!modules?.humidity}
                subtext="DHT22"
              />
              <ModuleCard
                title="Temperature Sensor"
                icon={Thermometer}
                offline={!modules?.temperature}
                subtext="Internal Probe"
              />
              <ModuleCard
                title="Methane Sensor"
                icon={Wind}
                offline={!modules?.methane}
                subtext="MQ-4 Gas Sensor"
              />
              <ModuleCard
                title="Nitrogen Sensor"
                icon={Activity}
                offline={!modules?.nitrogen}
                subtext="Soil Analysis"
              />
              <ModuleCard
                title="Water Level"
                icon={Droplets}
                offline={!modules?.water}
                subtext="Tank Monitoring"
              />
              <ModuleCard
                title="NPK Sensor"
                icon={Activity}
                offline={!modules?.npk}
                subtext="Nutrient Detection"
              />
              <ModuleCard
                title="Moisture Sensor"
                icon={Droplets}
                offline={!modules?.moisture}
                subtext="Capacitive Probe"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
