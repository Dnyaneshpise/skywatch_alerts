import { cookies } from "next/headers";

type FirebaseUser = {
  localId: string;
  email?: string;
  displayName?: string;
};

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

const identityBaseUrl = "https://identitytoolkit.googleapis.com/v1";
const firestoreBaseUrl = "https://firestore.googleapis.com/v1";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");

  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return null;
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("skywatch_session")?.value ?? null;
}

export async function requireFirebaseUser(request: Request) {
  const token = getBearerToken(request) ?? (await getSessionToken());

  if (!token) {
    throw new Response(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return verifyFirebaseIdToken(token);
}

export async function verifyFirebaseIdToken(idToken: string) {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured");
  }

  const response = await fetch(
    `${identityBaseUrl}/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({ error: "Invalid or expired session" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const payload = (await response.json()) as {
    users?: FirebaseUser[];
  };

  const user = payload.users?.[0];

  if (!user?.localId) {
    throw new Response(
      JSON.stringify({ error: "Invalid or expired session" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return user;
}

export function toFirestoreFields(input: Record<string, unknown>) {
  return Object.entries(input).reduce<Record<string, FirestoreValue>>(
    (fields, [key, value]) => {
      if (value === undefined) return fields;

      if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value
              .map(toFirestoreValue)
              .filter(
                (item): item is FirestoreValue => item !== null,
              ),
          },
        };

        return fields;
      }

      if (typeof value === "string") {
        fields[key] = isIsoDate(value)
          ? { timestampValue: value }
          : { stringValue: value };

        return fields;
      }

      if (typeof value === "number") {
        fields[key] = Number.isInteger(value)
          ? { integerValue: String(value) }
          : { doubleValue: value };

        return fields;
      }

      if (typeof value === "boolean") {
        fields[key] = { booleanValue: value };
        return fields;
      }

      if (value === null) {
        fields[key] = { nullValue: null };
      }

      return fields;
    },
    {},
  );
}

export function fromFirestoreFields(
  fields: Record<string, FirestoreValue> = {},
): Record<string, unknown> {
  return Object.entries(fields).reduce<Record<string, unknown>>(
    (data, [key, value]) => {
      data[key] = fromFirestoreValue(value);
      return data;
    },
    {},
  );
}

function toFirestoreValue(value: unknown): FirestoreValue | null {
  if (typeof value === "string") {
    return isIsoDate(value)
      ? { timestampValue: value }
      : { stringValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (value === null) {
    return { nullValue: null };
  }

  return null;
}

/* FIX: explicit return type */
function fromFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("integerValue" in value) {
    return Number(value.integerValue);
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("timestampValue" in value) {
    return value.timestampValue;
  }

  if ("nullValue" in value) {
    return null;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(fromFirestoreValue);
  }

  return null;
}

export function documentId(documentName: string) {
  return documentName.split("/").pop() ?? documentName;
}

export async function firestoreRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured");
  }

  const bearer = token ?? (await getServerAccessToken());

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${bearer}`);

  const response = await fetch(
    `${firestoreBaseUrl}/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Firestore request failed with ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function firestoreRunQuery<T>(
  body: Record<string, unknown>,
  token?: string,
): Promise<T> {
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured");
  }

  const bearer = token ?? (await getServerAccessToken());

  const response = await fetch(
    `${firestoreBaseUrl}/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Firestore query failed with ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export type { FirestoreDocument };

async function getServerAccessToken(): Promise<string> {
  if (
    cachedAccessToken &&
    cachedAccessToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedAccessToken.token;
  }

  const serviceAccount = readServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is required for server Firestore access",
    );
  }

  const now = Math.floor(Date.now() / 1000);

  const assertion = await signJwt(
    { alg: "RS256", typ: "JWT" },
    {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    serviceAccount.private_key,
  );

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type:
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create Firebase service token: ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return cachedAccessToken.token;
}

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    return null;
  }

  const value = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");

  const serviceAccount = JSON.parse(value) as {
    client_email: string;
    private_key: string;
  };

  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    ),
  };
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKey: string,
): Promise<string> {
  const crypto = await import("crypto");

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  const input = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.sign(
    "RSA-SHA256",
    Buffer.from(input),
    privateKey,
  );

  return `${input}.${base64url(signature)}`;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function isIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}
