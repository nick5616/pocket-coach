import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import { Sparkles, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import styles from "./exercise-ai-editor.module.css";

interface ExerciseAIEditorProps {
  exerciseId: number;
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExerciseAIEditor({ 
  exerciseId, 
  exerciseName, 
  isOpen, 
  onClose, 
  onSuccess 
}: ExerciseAIEditorProps) {
  const [editInstruction, setEditInstruction] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const editMutation = useMutation({
    mutationFn: async (instruction: string) => {
      const response = await apiRequest("POST", `/api/exercises/${exerciseId}/edit-with-ai`, {
        editInstruction: instruction
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Exercise Updated!",
        description: data.changesSummary || "Exercise successfully updated with your changes.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["/api/workouts", "exercises"] 
      });
      
      setEditInstruction("");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error("AI edit error:", error);
      toast({
        title: "Edit Failed",
        description: "Could not process your edit instruction. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!editInstruction.trim()) return;
    editMutation.mutate(editInstruction.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleInstructions = [
    "Change weight to 135 pounds",
    "Make it 3 sets instead of 4",
    "RPE was actually 8, not 7",
    "Add 10 pounds to the weight",
    "This should be barbell, not dumbbell",
    "Add shoulders to muscle groups",
    "It wasn't bodyweight, I used 25lb dumbbells"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>
            <div className={styles.titleContainer}>
              <Sparkles className={styles.titleIcon} />
              Edit {exerciseName}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className={styles.content}>
          <div className={styles.instructionSection}>
            <label className={styles.label}>
              What would you like to change?
            </label>
            <Textarea
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what to fix... (e.g., 'change weight to 135', 'make it 3 sets', 'RPE was actually 8')"
              className={styles.textarea}
              disabled={editMutation.isPending}
              rows={3}
            />
            <div className={styles.hint}>
              Press Cmd+Enter (Mac) or Ctrl+Enter (PC) to submit
            </div>
          </div>

          <div className={styles.examplesSection}>
            <h4 className={styles.examplesTitle}>Example instructions:</h4>
            <div className={styles.examples}>
              {exampleInstructions.map((example, index) => (
                <button
                  key={index}
                  className={styles.exampleButton}
                  onClick={() => setEditInstruction(example)}
                  disabled={editMutation.isPending}
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={editMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!editInstruction.trim() || editMutation.isPending}
              className={styles.submitButton}
            >
              {editMutation.isPending ? (
                <>
                  <div className={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>
                  <Send className={styles.sendIcon} />
                  Update Exercise
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}