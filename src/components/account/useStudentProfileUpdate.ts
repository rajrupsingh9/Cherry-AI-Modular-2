import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { safeSetItem } from "../../utils/safeStorage";

export interface UseStudentProfileUpdateProps {
  currentUser: any;
  studentName?: string;
  grade?: any;
  board?: string;
  subject?: string;
  mediumOfLearning?: string;
  onRefreshProfile?: () => void;
}

export function useStudentProfileUpdate({
  currentUser,
  studentName = "Student",
  grade = "Class 10",
  board = "CBSE",
  subject = "Mathematics",
  mediumOfLearning = "Hinglish",
  onRefreshProfile,
}: UseStudentProfileUpdateProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [editName, setEditName] = useState(studentName);
  const [editGrade, setEditGrade] = useState(grade);
  const [editBoard, setEditBoard] = useState(board);
  const [editMediumOfLearning, setEditMediumOfLearning] = useState(mediumOfLearning);

  useEffect(() => {
    setEditName(studentName);
    setEditGrade(grade);
    setEditBoard(board);
    setEditMediumOfLearning(mediumOfLearning);
  }, [studentName, grade, board, mediumOfLearning]);

  const handleUpdateProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      setSavingProfile(true);
      try {
        const profileData = {
          name: editName,
          grade: editGrade,
          subject: subject || "Mathematics",
          board: editBoard,
          mediumOfLearning: editMediumOfLearning,
        };
        safeSetItem(
          `studentProfile_${currentUser.uid}`,
          JSON.stringify(profileData),
        );

        if (
          currentUser.uid !== "local_guest_student" &&
          !currentUser.uid.startsWith("local_")
        ) {
          const profileRef = doc(db, "studentProfiles", currentUser.uid);
          await updateDoc(profileRef, {
            ...profileData,
            updatedAt: serverTimestamp(),
          });
        }
        setEditingProfile(false);
        if (onRefreshProfile) onRefreshProfile();
      } catch (err) {
        console.warn(
          "Failed saving student updates to Firestore, saved locally:",
          err,
        );
        setEditingProfile(false);
        if (onRefreshProfile) onRefreshProfile();
      } finally {
        setSavingProfile(false);
      }
    },
    [
      currentUser,
      editName,
      editGrade,
      editBoard,
      editMediumOfLearning,
      subject,
      onRefreshProfile,
    ],
  );

  return {
    editingProfile,
    setEditingProfile,
    savingProfile,
    editName,
    setEditName,
    editGrade,
    setEditGrade,
    editBoard,
    setEditBoard,
    editMediumOfLearning,
    setEditMediumOfLearning,
    handleUpdateProfile,
  };
}
