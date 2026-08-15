const API_URL = "http://localhost:3000/api/backup";

async function parseError(
  response: Response,
  fallback: string,
): Promise<never> {
  let message = fallback;

  try {
    const body = await response.json();

    if (body?.message) {
      message = body.message;
    }
  } catch (parseErr) {
    console.warn(
      "No se pudo interpretar el cuerpo del error como JSON:",
      parseErr,
    );
  }

  throw new Error(message);
}

export async function downloadInventoryBackup(): Promise<void> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    return parseError(
      response,
      "No se pudo generar el respaldo del inventario",
    );
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get(
    "Content-Disposition",
  );

  let fileName = "respaldo-inventario.zip";

  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(
      /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i,
    );

    if (fileNameMatch?.[1]) {
      fileName = decodeURIComponent(fileNameMatch[1]);
    }
  }

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}