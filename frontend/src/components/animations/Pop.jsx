import { motion } from 'framer-motion';


export function Pop({ children }) {
  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      {children}
    </motion.div>
  );
}
