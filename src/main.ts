import { z } from "zod";
import { AIClassifier } from "./examples/ai_classifier";

enum Operation {
  Add = "add",
  Subtract = "subtract",
  Divide = 1,
}

const AIOperation = AIClassifier(z.nativeEnum(Operation));

const result = await AIOperation("I want to subtract 5 from 3");
console.log("result", result);
