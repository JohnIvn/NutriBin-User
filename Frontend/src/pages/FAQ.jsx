import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots, FaPlus, FaMinus } from "react-icons/fa";

const faqsData = [
  {
    question: "What does the compost bin system do?",
    answer:
      "The compost bin system processes organic waste such as food scraps and plant materials and converts them into nutrient-rich fertilizer through controlled composting.",
  },
  {
    question: "What types of waste can be placed in the compost bin?",
    answer:
      "The system accepts biodegradable materials such as fruit and vegetable waste, leaves, grass clippings, and other organic matter. Non-biodegradable materials like plastics, metals, and chemicals should not be added.",
  },
  {
    question: "How does the system monitor the composting process?",
    answer:
      "The system uses sensors to monitor parameters such as temperature, humidity, and gas levels to ensure optimal conditions for efficient composting and safe operation.",
  },
  {
    question: "Does the compost bin require regular maintenance?",
    answer:
      "Minimal maintenance is required. Users need to periodically add organic waste, ensure proper moisture levels, and collect the finished fertilizer as instructed by the system.",
  },
  {
    question: "Is the system odor-free?",
    answer:
      "The system is designed to minimize odor through proper airflow and controlled composting conditions. Odors may occur if non-recommended materials are added.",
  },
  {
    question: "Can users track compost data and fertilizer output?",
    answer:
      "Yes. The system includes a monitoring interface that allows users to view compost status, historical data, and fertilizer output records.",
  },
];

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border border-[#3A4D39]/10 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none group cursor-pointer"
      >
        <span className={`font-bold text-lg pr-4 transition-colors duration-300 ${isOpen ? "text-[#3A4D39]" : "text-[#4F6F52] group-hover:text-[#3A4D39]"}`}>
          {question}
        </span>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-[#3A4D39] text-[#ECE3CE] rotate-180" : "bg-[#ECE3CE] text-[#3A4D39]"}`}>
          {isOpen ? <FaMinus size={12} /> : <FaPlus size={12} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-0 text-[#739072] leading-relaxed border-t border-[#ECE3CE]/30 mt-2">
              <div className="pt-4">{answer}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Faqs() {
  return (
    <div className="w-full min-h-screen bg-[#ECE3CE]/20 font-sans pt-20 pb-16">
      <div className="w-full max-w-4xl mx-auto px-6">
        
        {/* header */}
        <motion.div 
          className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-4 bg-[#3A4D39] rounded-2xl shadow-lg shadow-[#3A4D39]/20">
            <FaCommentDots className="text-[#ECE3CE] text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#3A4D39] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-[#4F6F52] text-lg font-medium max-w-xl">
              Everything you need to know about the NutriBin composting system and maintenance.
            </p>
          </div>
        </motion.div>

        {/* faqs */}
        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {faqsData.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 100, damping: 15 },
                },
              }}
            >
              <FaqItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}