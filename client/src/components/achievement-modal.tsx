import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { Trophy, Star, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import styles from './achievement-modal.module.css';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    type: string;
    title: string;
    description: string;
    data?: any;
  };
}

export default function AchievementModal({
  isOpen,
  onClose,
  achievement,
}: AchievementModalProps) {
  const getIcon = () => {
    switch (achievement.type) {
      case "workout_complete":
        return Trophy;
      case "streak":
        return Star;
      case "goal_achieved":
        return Target;
      default:
        return Zap;
    }
  };

  const Icon = getIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.container}>
        <DialogHeader style={{ position: 'absolute', left: '-9999px' }}>
          <DialogTitle>{achievement.title}</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={styles.content}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={styles.iconContainer}
          >
            <Icon className={styles.icon} />
          </motion.div>
          
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={styles.title}
          >
            {achievement.title}
          </motion.h3>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.description}
          >
            {achievement.description}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              className={styles.button}
              size="lg"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
