import { Type } from "@google/genai";

export const cherryToolDeclarations = [
  {
    name: "getWhiteboardContent",
    description: "Retrieves all current history of text, equations, and topics written or discussed on the board in this session. Call this when the student asks what was taught, what is currently written on the board, or to review/repeat a previous formula/example.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "openWebsite",
    description: "Opens a popular website URL in the user's browser. Call this when the user requests to visit, search, or look at a specific platform or link.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: "The full absolute URL to open (e.g. 'https://www.youtube.com', 'https://www.github.com').",
        },
        name: {
          type: Type.STRING,
          description: "A friendly name for the website (e.g. 'YouTube' or 'Google').",
        },
      },
      required: ["url", "name"],
    },
  },
  {
    name: "changeTheme",
    description: "Changes the visual theme and mood of the UI. Pick the most suitable style based on user requests, colors, or emotional vibes.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        theme: {
          type: Type.STRING,
          description: "The theme to apply: 'cherry' (fiery red), 'matrix' (neon green), 'cyber' (bright cyber violet), 'sunset' (warm electric amber), 'slate' (sleek charcoal).",
        },
      },
      required: ["theme"],
    },
  },
  {
    name: "classIsComplete",
    description: "Call this tool AFTER you have explained all topics, asked the student if they have any doubt or question, and they confirmed they don't have any more doubts. This will formally end the lecture and trigger the graduation celebration.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "setTeachingState",
    description: "Updates the current active teaching phase of Cherry Ma'am's lesson. Expected values: 'intro' (Prichey), 'concept' (Chalk notes writing), 'example' (Deep dive explanation), 'doubt' (Student doubt solving), 'transition' (moving to next topic).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        phase: {
          type: Type.STRING,
          description: "The current phase of the lesson: 'intro', 'concept', 'example', 'doubt', or 'transition'.",
        },
      },
      required: ["phase"],
    },
  },
  {
    name: "moveToNextTopic",
    description: "Saves current board progress, updates syllabus tracking index, and scrolls the center visual classroom slide safely to the next topic/section of the document in the UI. Call this when you make a Phase 5 transition or before loading the next study material on the blackboard.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "updateWhiteboard",
    description: "Writes, updates, solves formulas, LaTeX equations, diagrams, or bullet lists on the classroom board. Call this tool ONCE when introducing new board notes in Phase 1 or Phase 2, or when adding new steps with append: true.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        content: {
          type: Type.STRING,
          description: "The complete, formatted whiteboard notes content in LaTeX ($$...$$), definitions, lists, or custom responsive neon XML SVG diagram layouts.",
        },
        append: {
          type: Type.BOOLEAN,
          description: "Set to true to append to existing blackboard notes. Set to false (default) to replace the current whiteboard content entirely.",
        },
      },
      required: ["content"],
    },
  },
];
