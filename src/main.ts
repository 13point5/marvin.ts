import { z } from "zod";
import { AIModel } from "./marvin";

const locationSchema = z.object({
  city: z.string(),
  state: z.string({
    description: "The two-letter state abbreviation",
  }),
});

const Location = AIModel(locationSchema);

const result = await Location("The tech startup hub of India");
console.log(result);
