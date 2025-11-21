// lib/errors/errorTypes.ts

export type ErrorTypeDefinition = {
  errorCode: string;
  errorStatus: number;
};

// Előre definiált hiba kategóriák
export const ErrorTypes = {
  BAD_REQUEST: {
    errorCode: 'BAD_REQUEST',
    errorStatus: 400,
  },
  VALIDATION_ERROR: {
    errorCode: 'VALIDATION_ERROR',
    errorStatus: 400,
  },
  UNAUTHORIZED: {
    errorCode: 'UNAUTHORIZED',
    errorStatus: 401,
  },
  FORBIDDEN: {
    errorCode: 'FORBIDDEN',
    errorStatus: 403,
  },
  NOT_FOUND: {
    errorCode: 'NOT_FOUND',
    errorStatus: 404,
  },
  CONFLICT: {
    errorCode: 'CONFLICT', // Pl. már létező email
    errorStatus: 409, // 409 Conflict a helyes HTTP kód duplikációra
  },
  INTERNAL_SERVER_ERROR: {
    errorCode: 'INTERNAL_SERVER_ERROR',
    errorStatus: 500,
  },
} as const;

// Típus a kulcsokhoz (opcionális, ha szigorúbb akarsz lenni)
export type ErrorTypeKey = keyof typeof ErrorTypes;
