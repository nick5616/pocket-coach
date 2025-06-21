import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { Trophy, Star, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

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
      <DialogContent className="max-w-sm mx-4 rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{achievement.title}</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="p-6 text-center bg-gradient-to-br from-duolingo-green to-green-600 text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold mb-2"
          >
            {achievement.title}
          </motion.h3>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-100 mb-6"
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
              className="bg-white text-duolingo-green hover:bg-gray-50 font-semibold w-full"
              size="lg"
            >
              Awesome! 🎉
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
