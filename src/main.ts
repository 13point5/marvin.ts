import { z } from "zod";
import { AIModel } from "./marvin";

const locationSchema = z.object({
  city: z.string(),
  state: z.string({
    description: "The two-letter state abbreviation",
  }),
});

// const Location = AIModel(locationSchema);

// const result = await Location("The tech startup hub of India");
// console.log(result);

// Let's see if we get an error if we have the state as an enum without KA
const locationSchema2 = z.object({
  city: z.string(),
  state: z.enum(
    ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "MA"],
    {
      description: "The two-letter state abbreviation",
    }
  ),
});

const Location2 = AIModel(locationSchema2);
const result2 = await Location2("The tech startup hub of India");
console.log(result2);
