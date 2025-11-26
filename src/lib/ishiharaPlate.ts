import { IshiharaPlate } from "@/types/ishihara";

export const ishiharaPlates: IshiharaPlate[] = [
  // --- Plat Kontrol ---
  {
    id: 1,
    image: "/Ishihara2/1.jpg",
    normalAnswer: "12",
    deficientAnswer: "12",
    plateType: "control"
  },
  // --- Plat Angka Standar ---
  {
    id: 2,
    image: "/Ishihara2/2.jpg",
    normalAnswer: "8",
    deficientAnswer: "3",
    plateType: "number"
  },
  {
    id: 3,
    image: "/Ishihara2/3.jpg",
    normalAnswer: "29",
    deficientAnswer: "70",
    plateType: "number"
  },
  {
    id: 4,
    image: "/Ishihara2/4.jpg",
    normalAnswer: "5",
    deficientAnswer: "2",
    plateType: "number"
  },
  {
    id: 5,
    image: "/Ishihara2/5.jpg",
    normalAnswer: "3",
    deficientAnswer: "5",
    plateType: "number"
  },
  {
    id: 6,
    image: "/Ishihara2/6.jpg",
    normalAnswer: "15",
    deficientAnswer: "17",
    plateType: "number"
  },
  {
    id: 7,
    image: "/Ishihara2/7.jpg",
    normalAnswer: "74",
    deficientAnswer: "21",
    plateType: "number"
  },
  // --- Plat Angka (Normal melihat, Defisiensi tidak) ---
  {
    id: 8,
    image: "/Ishihara2/8.jpg",
    normalAnswer: "6",
    deficientAnswer: null,
    plateType: "number"
  },
  {
    id: 9,
    image: "/Ishihara2/9.jpg",
    normalAnswer: "45",
    deficientAnswer: null,
    plateType: "number"
  },
  {
    id: 10,
    image: "/Ishihara2/10.jpg",
    normalAnswer: "5",
    deficientAnswer: null,
    plateType: "number"
  },
  {
    id: 11,
    image: "/Ishihara2/11.jpg",
    normalAnswer: "7",
    deficientAnswer: null,
    plateType: "number"
  },
  {
    id: 12,
    image: "/Ishihara2/12.jpg",
    normalAnswer: "16",
    deficientAnswer: null,
    plateType: "number"
  },
  {
    id: 13,
    image: "/Ishihara2/13.jpg",
    normalAnswer: "73",
    deficientAnswer: null,
    plateType: "number"
  },
  // --- Plat Diagnostik ---
  {
    id: 14,
    image: "/Ishihara2/16.jpg",
    normalAnswer: "26",
    deficientAnswer: "6/2",
    plateType: "diagnostic"
  },
  {
    id: 15,
    image: "/Ishihara2/17.jpg",
    normalAnswer: "42",
    deficientAnswer: "2/4",
    plateType: "diagnostic"
  },
  // --- Plat lanjutan ---
  {
    id: 16,
    image: "/Ishihara2/14.jpg",
    normalAnswer: "2",
    deficientAnswer: null,
    plateType: "trace"
  },
  {
    id: 17,
    image: "/Ishihara2/15.jpg",
    normalAnswer: "6",
    deficientAnswer: null,
    plateType: "trace"
  },
  {
    id: 18,
    image: "/Ishihara/Ishihara_Tests_page-0020.jpg",
    normalAnswer: "trace",
    deficientAnswer: "trace_fail",
    plateType: "trace"
  },
  // --- Plat Tersembunyi ---
  {
    id: 19,
    image: "/Ishihara/Ishihara_Tests_page-0021.jpg",
    normalAnswer: null,
    deficientAnswer: "2",
    plateType: "hidden_number"
  },
  {
    id: 20,
    image: "/Ishihara/Ishihara_Tests_page-0022.jpg",
    normalAnswer: null,
    deficientAnswer: "45",
    plateType: "hidden_number"
  },
  {
    id: 21,
    image: "/Ishihara/Ishihara_Tests_page-0023.jpg",
    normalAnswer: null,
    deficientAnswer: "73",
    plateType: "hidden_number"
  },
  // --- Plat Alur ---
  {
    id: 22,
    image: "/Ishihara/Ishihara_Tests_page-0024.jpg",
    normalAnswer: "trace",
    deficientAnswer: "trace_fail",
    plateType: "trace"
  },
  {
    id: 23,
    image: "/Ishihara/Ishihara_Tests_page-0025.jpg",
    normalAnswer: "trace",
    deficientAnswer: "trace_fail",
    plateType: "trace"
  },
  {
    id: 24,
    image: "/Ishihara/Ishihara_Tests_page-0026.jpg",
    normalAnswer: "trace",
    deficientAnswer: "trace_fail",
    plateType: "trace"
  }
];

// Filtered plates for basic test (exclude trace and hidden)
export const testPlates: IshiharaPlate[] = ishiharaPlates.filter(
  plate => plate.plateType !== 'trace' && plate.plateType !== 'hidden_number'
);
// Result: 17 plates suitable for number input

// Advanced test (include all)
export const advancedTestPlates: IshiharaPlate[] = ishiharaPlates;



// import { IshiharaPlate } from "@/types/ishihara";

// export const ishiharaPlates: IshiharaPlate[] = [
//   // --- Plat Kontrol ---
//   {
//     id: 1,
//     image: "/Ishihara/Ishihara_Tests_page-0003.jpg",
//     normalAnswer: "12",
//     deficientAnswer: "12",
//     plateType: "control",
//     description: "Control plate - everyone should see this number",
//   },
//   // --- Plat Angka Standar ---
//   {
//     id: 2,
//     image: "/Ishihara/Ishihara_Tests_page-0004.jpg",
//     normalAnswer: "8",
//     deficientAnswer: "3",
//     plateType: "number",
//     description: "Red-green color blindness screening",
//   },
//   {
//     id: 3,
//     image: "/Ishihara/Ishihara_Tests_page-0005.jpg",
//     normalAnswer: "29",
//     deficientAnswer: "70",
//     plateType: "number",
//     description: "Red-green color vision test",
//   },
//   {
//     id: 4,
//     image: "/Ishihara/Ishihara_Tests_page-0006.jpg",
//     normalAnswer: "5",
//     deficientAnswer: "2",
//     plateType: "number",
//     description: "Advanced red-green discrimination test",
//   },
//   {
//     id: 5,
//     image: "/Ishihara/Ishihara_Tests_page-0007.jpg",
//     normalAnswer: "3",
//     deficientAnswer: "5",
//     plateType: "number",
//     description: "Red-green color blindness detection",
//   },
//   {
//     id: 6,
//     image: "/Ishihara/Ishihara_Tests_page-0008.jpg",
//     normalAnswer: "15",
//     deficientAnswer: "17",
//     plateType: "number",
//     description: "Color discrimination assessment",
//   },
//   {
//     id: 7,
//     image: "/Ishihara/Ishihara_Tests_page-0009.jpg",
//     normalAnswer: "74",
//     deficientAnswer: "21",
//     plateType: "number",
//     description: "Red-green vision evaluation",
//   },
//   // --- Plat Angka (Normal melihat, Defisiensi tidak) ---
//   {
//     id: 8,
//     image: "/Ishihara/Ishihara_Tests_page-0010.jpg",
//     normalAnswer: "6",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Color perception test",
//   },
//   {
//     id: 9,
//     image: "/Ishihara/Ishihara_Tests_page-0011.jpg",
//     normalAnswer: "45",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Color perception test",
//   },
//   {
//     id: 10,
//     image: "/Ishihara/Ishihara_Tests_page-0012.jpg",
//     normalAnswer: "5",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Color perception test",
//   },
//   {
//     id: 11,
//     image: "/Ishihara/Ishihara_Tests_page-0013.jpg",
//     normalAnswer: "7",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Advanced color perception",
//   },
//   {
//     id: 12,
//     image: "/Ishihara/Ishihara_Tests_page-0014.jpg",
//     normalAnswer: "16",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Advanced color perception",
//    },
//   {
//     id: 13,
//     image: "/Ishihara/Ishihara_Tests_page-0015.jpg",
//     normalAnswer: "73",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Advanced color perception",
//   },
//   // --- Plat Diagnostik ---
//   {
//     id: 14,
//     image: "/Ishihara/Ishihara_Tests_page-0016.jpg",
//     normalAnswer: "26",
//     deficientAnswer: "6/2",
//     plateType: "diagnostic",
//     description: "Diagnostic plate for deficiency type",
//   },
//   {
//     id: 15,
//     image: "/Ishihara/Ishihara_Tests_page-0017.jpg",
//     normalAnswer: "42",
//     deficientAnswer: "2/4",
//     plateType: "diagnostic",
//     description: "Diagnostic plate for deficiency type",
//   },
//   // --- Plat lanjutan ---
//   {
//     id: 16,
//     image: "/Ishihara/Ishihara_Tests_page-0018.jpg",
//     normalAnswer: "2",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Color perception verification",
//   },
//   {
//     id: 17,
//     image: "/Ishihara/Ishihara_Tests_page-0019.jpg",
//     normalAnswer: "6",
//     deficientAnswer: null,
//     plateType: "number",
//     description: "Color perception verification",
//   },
//   {
//     id: 18,
//     image: "/Ishihara/Ishihara_Tests_page-0020.jpg",
//     normalAnswer: "trace",
//     deficientAnswer: "trace_fail",
//     plateType: "trace",
//     description: "Tracing test",
//   },
//   // --- Plat Tersembunyi ---
//   {
//     id: 19,
//     image: "/Ishihara/Ishihara_Tests_page-0021.jpg",
//     normalAnswer: null,
//     deficientAnswer: "2",
//     plateType: "hidden_number",
//     description: "Hidden number test",
//   },
//   {
//     id: 20,
//     image: "/Ishihara/Ishihara_Tests_page-0022.jpg",
//     normalAnswer: null,
//     deficientAnswer: "45",
//     plateType: "hidden_number",
//     description: "Hidden number test",
//   },
//   {
//     id: 21,
//     image: "/Ishihara/Ishihara_Tests_page-0023.jpg",
//     normalAnswer: null,
//     deficientAnswer: "73",
//     plateType: "hidden_number",
//     description: "Hidden number test",
//   },
//   // --- Plat Alur ---
//   {
//     id: 22,
//     image: "/Ishihara/Ishihara_Tests_page-0024.jpg",
//     normalAnswer: "trace",
//     deficientAnswer: "trace_fail",
//     plateType: "trace",
//     description: "Tracing test",
//   },
//   {
//     id: 23,
//     image: "/Ishihara/Ishihara_Tests_page-0025.jpg",
//     normalAnswer: "trace",
//     deficientAnswer: "trace_fail",
//     plateType: "trace",
//     description: "Tracing test",
    
//   },
//   {
//     id: 24,
//     image: "/Ishihara/Ishihara_Tests_page-0026.jpg",
//     normalAnswer: "trace",
//     deficientAnswer: "trace_fail",
//     plateType: "trace",
//     description: "Tracing test",
//   }
// ];