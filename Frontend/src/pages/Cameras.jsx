import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import React, { useEffect, useState } from "react";

export default function Cameras() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="px-12 text-left">
        <h1 className="text-3xl font-bold text-black pt-4 ">Cameras</h1>
        <h1 className="text-m text-gray-600 py-4">Cameras inside the machine.</h1>
        <hr className="border-t-2 border-gray-400 w-full pb-4" />
      </div>
      <div className="flex flex-row px-12 justify-between gap-6 mt-2 pb-20">
        <div className="flex flex-col w-full md:w-1/2 h-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white">Loading video...</span>
            </div>
          ) : (
            <video controls autoPlay className="w-full h-full py-2">
              <source src="/video.mp4" type="video/mp4" />
            </video>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-600 hover:bg-amber-700">
                <TableHead className="text-white font-bold">Date</TableHead>
                <TableHead className="text-white font-bold">Time</TableHead>
                <TableHead className="text-white font-bold">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-gray-900 bg-white">
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-1/2 h-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white">Loading video...</span>
            </div>
          ) : (
            <video controls autoPlay className="w-full h-full py-2">
              <source src="/video.mp4" type="video/mp4" />
            </video>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-600 hover:bg-amber-700">
                <TableHead className="text-white font-bold">Date</TableHead>
                <TableHead className="text-white font-bold">Time</TableHead>
                <TableHead className="text-white font-bold">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-gray-900 bg-white">
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-9-12</TableCell>
                <TableCell>9:00 AM</TableCell>
                <TableCell>No Anomaly Found</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
