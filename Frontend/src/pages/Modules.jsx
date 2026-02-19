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
  BrickWallFire,
  Cog,
  CheckCircle2,
  AlertTriangle,
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

        console.log(data)
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
        toast.success(`Repair request for ${moduleName} submitted successfully`);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to request repair";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 text-[#4F6F52]" />
        </Motion.div>
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
              Hardware status and diagnostics.
            </p>
            <p className="text-[#4F6F52] font-bold mt-1 text-lg">
              Please click the module if the module is offline to make a repair
              request.
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
                4 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
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
          </div>

          {/* motors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-700">
                <Cog className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#3A4D39]">Actuators</h2>
              <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                5 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
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
          </div>

          {/* sensors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#3A4D39]">Sensors</h2>
              <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">
                11 Units
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
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
                title="Carbon Monoxide Sensor"
                icon={AlertTriangle}
                offline={modules?.carbon_monoxide}
                subtext="MQ-7 CO Sensor"
                onClick={() =>
                  requestRepair("Repair need for Carbon Monoxide Sensor")
                }
              />
              <ModuleCard
                title="Air Quality Sensor"
                icon={Wind}
                offline={modules?.air_quality}
                subtext="MQ-135"
                onClick={() =>
                  requestRepair("Repair need for Air Quality Sensor")
                }
              />
              <ModuleCard
                title="Combustible Gas Sensor"
                icon={BrickWallFire}
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
                title="Reed Switch Sensor"
                icon={CheckCircle2}
                offline={modules?.reed}
                subtext="Door / Lid Detection"
                onClick={() =>
                  requestRepair("Repair need for Reed Switch Sensor")
                }
              />
              <ModuleCard
                title="Ultrasonic Sensor"
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
          </div>
        </div>
      </section>
    </div>
  );
}
