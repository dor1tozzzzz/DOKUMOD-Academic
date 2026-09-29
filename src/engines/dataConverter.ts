import Papa from "papaparse";
import { DataConverterOptions } from "../types";
import {
  validateSingleFile,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from "../utils/fileValidation";

// Converts JSON string or array of objects to CSV format
export function jsonToCsv(
  jsonInput: string | object[],
  options: Partial<DataConverterOptions> = {},
): string {
  let parsedData: unknown;

  if (typeof jsonInput === "string") {
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      throw new Error("Input JSON tidak boleh kosong.");
    }
    try {
      parsedData = JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`Sintaks JSON tidak valid: ${(err as Error).message}`);
    }
  } else {
    parsedData = jsonInput;
  }

  // Ensure data is array of objects for tabular CSV format
  if (!Array.isArray(parsedData)) {
    if (typeof parsedData === "object" && parsedData !== null) {
      parsedData = [parsedData];
    } else {
      throw new Error("Format JSON harus berupa Array atau Object.");
    }
  }

  const csvResult = Papa.unparse(parsedData as object[], {
    delimiter: options.delimiter || ",",
    quotes: false,
    skipEmptyLines: true,
  });

  return csvResult;
}

//Converts CSV string to formatted JSON string
export function csvToJson(
  csvInput: string,
  options: Partial<DataConverterOptions> = {},
): string {
  const trimmed = csvInput.trim();
  if (!trimmed) {
    throw new Error("Input CSV tidak boleh kosong.");
  }

  const parseResult = Papa.parse(trimmed, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimiter: options.delimiter || "", // Auto-detect delimiter if empty string
  });

  if (parseResult.errors && parseResult.errors.length > 0) {
    const firstError = parseResult.errors[0];
    console.warn("CSV Parse Warnings/Errors:", parseResult.errors);
    if (parseResult.data.length === 0) {
      throw new Error(
        `Gagal memproses CSV (Baris ${firstError.row}): ${firstError.message}`,
      );
    }
  }

  const indent = options.prettyJson !== false ? 2 : 0;
  return JSON.stringify(parseResult.data, null, indent);
}

// Main converter entry point handling string conversion based on direction
export function convertDataString(
  input: string,
  options: DataConverterOptions,
): string {
  if (options.direction === "json2csv") {
    return jsonToCsv(input, options);
  } else {
    return csvToJson(input, options);
  }
}

// Reads a local File object as a plain string with size validation
export async function readFileAsString(file: File): Promise<string> {
  const validation = validateSingleFile(file, {
    maxSizeMB: FILE_SIZE_LIMITS.DATA_CONVERTER,
    allowedMimeTypes: ALLOWED_MIME_TYPES.DATA,
    allowedExtensions: [".json", ".csv", ".txt"],
  });

  if (!validation.isValid) {
    throw new Error(validation.errorMessage || "Validasi berkas data gagal.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error(`Gagal membaca berkas "${file.name}".`));
    reader.readAsText(file);
  });
}
