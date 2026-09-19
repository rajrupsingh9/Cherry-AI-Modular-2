import { db, auth } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";

export interface BattleParticipant {
  uid: string;
  name: string;
  isReady: boolean;
  isHost?: boolean;
  score?: number;
  correctCount?: number;
  currentQuestion?: number;
  currentQuestionIndex?: number;
  accuracy?: number;
  speedBonusTotal?: number;
  avatar?: string;
  joinedAt?: number;
}

export interface BattleRoomData {
  id?: string;
  code?: string;
  roomId: string;
  roomCode?: string;
  title: string;
  subject: string;
  grade: string;
  hostUid: string;
  hostName: string;
  status: "waiting" | "live" | "completed";
  questions?: any[];
  scheduledAt?: string;
  participantsCount?: number;
  createdAt?: number;
  [key: string]: any;
}

const ROOMS_CACHE_KEY = "cherry_battle_rooms_cache";

export function buildBattleInviteMessage(room: BattleRoomData): string {
  const code = room.roomCode || room.code || "";
  return `⚔️ Join my 1v1 Peer Battle on Cherry AI!
📚 Subject: ${room.subject} (${room.grade})
🎯 Topic: ${room.title}
🔑 Room Code: ${code}
🚀 Click here to join: ${window.location.origin}?battleCode=${code}`;
}

export async function createBattleRoom(params: {
  title: string;
  subject: string;
  grade: string;
  hostName: string;
  questions?: any[];
  scheduledAt?: string;
  chapterOrFileName?: string;
  numQuestions?: number;
  timePerQuestion?: number;
  isInstant?: boolean;
  scheduledDateTime?: string;
  file?: any;
  selectedChapter?: string;
  [key: string]: any;
}): Promise<BattleRoomData> {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomId = `room_${Date.now()}_${roomCode}`;
  const hostUid = auth.currentUser?.uid || `user_${Date.now()}`;

  const roomData: BattleRoomData = {
    id: roomId,
    code: roomCode,
    roomId,
    roomCode,
    title: params.title,
    subject: params.subject,
    grade: params.grade,
    hostUid,
    hostName: params.hostName,
    status: "waiting",
    questions: params.questions || [],
    scheduledAt: params.scheduledAt || params.scheduledDateTime,
    participantsCount: 1,
    createdAt: Date.now(),
    ...params,
  };

  try {
    const roomRef = doc(db, "battle_rooms", roomId);
    await setDoc(roomRef, { ...roomData, createdAt: serverTimestamp() });

    const participantRef = doc(db, "battle_rooms", roomId, "participants", hostUid);
    await setDoc(participantRef, {
      uid: hostUid,
      name: params.hostName,
      isReady: true,
      score: 0,
      joinedAt: Date.now(),
    });
  } catch (e) {
    console.warn("[BattleRoomService] Firestore create failed, caching locally:", e);
    const existing = getUpcomingBattleRooms();
    safeSetItem(ROOMS_CACHE_KEY, JSON.stringify([roomData, ...existing]));
  }

  return roomData;
}

export async function joinBattleRoomByCode(
  roomCode: string,
  participantName: string
): Promise<BattleRoomData | null> {
  const code = (roomCode || "").toUpperCase().trim();
  try {
    const q = query(collection(db, "battle_rooms"), where("roomCode", "==", code));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const roomDoc = snap.docs[0];
      const roomData = roomDoc.data() as BattleRoomData;
      const uid = auth.currentUser?.uid || `guest_${Date.now()}`;

      const participantRef = doc(db, "battle_rooms", roomDoc.id, "participants", uid);
      await setDoc(participantRef, {
        uid,
        name: participantName,
        isReady: true,
        score: 0,
        joinedAt: Date.now(),
      });

      return { ...roomData, roomId: roomDoc.id };
    }
  } catch (err) {
    console.warn("[BattleRoomService] Join query failed:", err);
  }

  const cached = getUpcomingBattleRooms().find((r) => r.roomCode === code);
  return cached || null;
}

export function getUpcomingBattleRooms(subject?: string): BattleRoomData[] {
  try {
    const raw = safeGetItem(ROOMS_CACHE_KEY, "[]");
    const list: BattleRoomData[] = JSON.parse(raw);
    if (subject) {
      const lower = subject.toLowerCase();
      return list.filter((r) => !r.subject || r.subject.toLowerCase() === lower);
    }
    return list;
  } catch {
    return [];
  }
}

export function subscribeToBattleRoom(
  roomId: string,
  callback: (room: BattleRoomData | null) => void
): () => void {
  try {
    const roomRef = doc(db, "battle_rooms", roomId);
    return onSnapshot(
      roomRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as BattleRoomData);
        } else {
          callback(null);
        }
      },
      () => callback(null)
    );
  } catch {
    return () => {};
  }
}

export function subscribeToBattleParticipants(
  roomId: string,
  callback: (participants: BattleParticipant[]) => void
): () => void {
  try {
    const pCol = collection(db, "battle_rooms", roomId, "participants");
    return onSnapshot(
      pCol,
      (snap) => {
        const list: BattleParticipant[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as BattleParticipant);
        });
        callback(list);
      },
      () => callback([])
    );
  } catch {
    return () => {};
  }
}

export async function toggleParticipantReady(
  roomId: string,
  uid: string,
  isReady: boolean
): Promise<void> {
  try {
    const pRef = doc(db, "battle_rooms", roomId, "participants", uid);
    await setDoc(pRef, { isReady }, { merge: true });
  } catch (err) {
    console.warn("[BattleRoomService] Failed to toggle ready:", err);
  }
}

export async function startBattleRoomLive(roomId: string): Promise<void> {
  try {
    const roomRef = doc(db, "battle_rooms", roomId);
    await setDoc(roomRef, { status: "live" }, { merge: true });
  } catch (err) {
    console.warn("[BattleRoomService] Failed to start battle:", err);
  }
}

export async function updateParticipantBattleProgress(
  roomId: string,
  uid: string,
  scoreOrProgress: number | {
    score?: number;
    correctCount?: number;
    currentQuestion?: number;
    currentQuestionIndex?: number;
    accuracy?: number;
    speedBonusTotal?: number;
    [key: string]: any;
  },
  currentQuestion?: number
): Promise<void> {
  try {
    const pRef = doc(db, "battle_rooms", roomId, "participants", uid);
    const dataToSet =
      typeof scoreOrProgress === "object"
        ? scoreOrProgress
        : { score: scoreOrProgress, currentQuestion: currentQuestion ?? 0 };
    await setDoc(pRef, dataToSet, { merge: true });
  } catch (err) {
    console.warn("[BattleRoomService] Failed to update progress:", err);
  }
}
