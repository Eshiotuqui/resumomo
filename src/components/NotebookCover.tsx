import { motion } from 'framer-motion';

interface NotebookCoverProps {
  onOpen: () => void;
}

export default function NotebookCover({ onOpen }: NotebookCoverProps) {
  return (
    <motion.div
      className="relative w-[90vw] max-w-[700px] h-[70vh] max-h-[500px] cursor-pointer"
      onClick={onOpen}
      whileHover={{ scale: 1.02, rotateY: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Back cover shadow */}
      <div className="absolute inset-0 bg-rose-900 rounded-r-lg rounded-l-sm translate-x-2 translate-y-2 opacity-30" />

      {/* Main cover */}
      <div className="relative w-full h-full bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 rounded-r-lg rounded-l-sm notebook-shadow overflow-hidden">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.15'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Spine */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-rose-700 to-transparent" />

        {/* Spiral binding */}
        <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly items-center z-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="spiral-ring" />
          ))}
        </div>

        {/* Cover content */}
        <div className="flex flex-col items-center justify-center h-full pl-12 pr-8">
          {/* Decorative top line */}
          <motion.div
            className="w-48 h-0.5 bg-white/40 mb-6"
            initial={{ width: 0 }}
            animate={{ width: 192 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Title with lettering style */}
          <motion.h1
            className="font-lettering text-4xl sm:text-6xl text-white text-center leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Resumo
          </motion.h1>
          <motion.h2
            className="font-lettering text-2xl sm:text-4xl text-white/90 text-center mt-1 drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            do Momo
          </motion.h2>

          {/* Decorative bottom line */}
          <motion.div
            className="w-48 h-0.5 bg-white/40 mt-6"
            initial={{ width: 0 }}
            animate={{ width: 192 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />

          {/* Decorative elements */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <p className="font-caveat text-white/70 text-lg">clique para abrir</p>
            <div className="w-2 h-2 rounded-full bg-white/50" />
          </motion.div>

          {/* Corner decorations */}
          <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
        </div>
      </div>
    </motion.div>
  );
}
